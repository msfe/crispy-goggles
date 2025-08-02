const { getContainer, collections, isConfigured } = require('../config/cosmosConfig');

/**
 * Base database service class with common CRUD operations
 */
class BaseService {
  constructor(containerName) {
    this.containerName = containerName;
  }

  /**
   * Get the container for this service
   */
  getContainer() {
    if (!isConfigured) {
      throw new Error('Database not configured');
    }
    return getContainer(this.containerName);
  }

  /**
   * Create a new document
   */
  async create(item) {
    try {
      const container = this.getContainer();
      const { resource: created } = await container.items.create(item);
      return { success: true, data: created };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get a document by ID
   */
  async getById(id, partitionKey = id) {
    try {
      const container = this.getContainer();
      const { resource: item } = await container.item(id, partitionKey).read();
      return { success: true, data: item };
    } catch (error) {
      if (error.code === 404) {
        return { success: false, error: 'Document not found' };
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a document
   */
  async update(id, updates, partitionKey = id) {
    try {
      const container = this.getContainer();
      
      // First get the existing document
      const { resource: existing } = await container.item(id, partitionKey).read();
      if (!existing) {
        return { success: false, error: 'Document not found' };
      }

      // Merge updates with existing data
      const updatedItem = {
        ...existing,
        ...updates,
        id: existing.id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString()
      };

      const { resource: updated } = await container.item(id, partitionKey).replace(updatedItem);
      return { success: true, data: updated };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a document
   */
  async delete(id, partitionKey = id) {
    try {
      const container = this.getContainer();
      await container.item(id, partitionKey).delete();
      return { success: true };
    } catch (error) {
      if (error.code === 404) {
        return { success: false, error: 'Document not found' };
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Query documents
   */
  async query(querySpec, options = {}) {
    try {
      const container = this.getContainer();
      const { resources: items } = await container.items.query(querySpec, options).fetchAll();
      
      // Ensure we always return an array, even if items is undefined/null
      const data = Array.isArray(items) ? items : [];
      console.log(`📊 Query executed: ${querySpec.query}, returned ${data.length} items`);
      
      return { success: true, data };
    } catch (error) {
      console.error(`📊 Query failed: ${querySpec.query}`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all documents (with optional filtering)
   */
  async getAll(filter = {}) {
    // Handle both SQL-style filter {conditions, parameters} and object-style filter
    if (filter.conditions !== undefined || filter.parameters !== undefined) {
      // SQL-style filter
      const { conditions = '', parameters = [] } = filter;
      const querySpec = {
        query: `SELECT * FROM c${conditions ? ` WHERE ${conditions}` : ''}`,
        parameters
      };
      return this.query(querySpec);
    } else {
      // Object-style filter - build WHERE clause from object properties
      const filterKeys = Object.keys(filter);
      if (filterKeys.length === 0) {
        // No filter, get all
        const querySpec = { query: 'SELECT * FROM c' };
        return this.query(querySpec);
      }

      const conditions = filterKeys.map(key => `c.${key} = @${key}`).join(' AND ');
      const parameters = filterKeys.map(key => ({ name: `@${key}`, value: filter[key] }));
      
      const querySpec = {
        query: `SELECT * FROM c WHERE ${conditions}`,
        parameters
      };
      return this.query(querySpec);
    }
  }
}

/**
 * User service
 */
class UserService extends BaseService {
  constructor() {
    super(collections.USERS);
  }

  /**
   * Get user by email
   */
  async getByEmail(email) {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.email = @email',
      parameters: [{ name: '@email', value: email }]
    };
    const result = await this.query(querySpec);
    if (result.success && result.data.length > 0) {
      return { success: true, data: result.data[0] };
    }
    return { success: false, error: 'User not found' };
  }

  /**
   * Get user by Azure ID
   */
  async getByAzureId(azureId) {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.azureId = @azureId',
      parameters: [{ name: '@azureId', value: azureId }]
    };
    const result = await this.query(querySpec);
    if (result.success && result.data.length > 0) {
      return { success: true, data: result.data[0] };
    }
    return { success: false, error: 'User not found' };
  }

  /**
   * Search users by name or email
   */
  async search(searchTerm) {
    console.log(`👤 UserService.search called with term: "${searchTerm}"`);
    const querySpec = {
      query: 'SELECT * FROM c WHERE CONTAINS(c.name, @searchTerm) OR CONTAINS(c.email, @searchTerm)',
      parameters: [{ name: '@searchTerm', value: searchTerm }]
    };
    console.log(`👤 Executing query:`, querySpec);
    const result = await this.query(querySpec);
    console.log(`👤 UserService.search result:`, { success: result.success, dataLength: result.data?.length, error: result.error });
    return result;
  }

  /**
   * Batch get users by IDs
   */
  async batchGetUsers(userIds) {
    if (!userIds || userIds.length === 0) {
      return { success: true, data: [] };
    }

    const querySpec = {
      query: `SELECT * FROM c WHERE c.id IN (${userIds.map((_, index) => `@id${index}`).join(', ')})`,
      parameters: userIds.map((id, index) => ({ name: `@id${index}`, value: id }))
    };
    return this.query(querySpec);
  }
}

/**
 * Friendship service
 */
class FriendshipService extends BaseService {
  constructor() {
    super(collections.FRIENDSHIPS);
  }

  /**
   * Update a friendship with proper partition key
   * Override base method to use userId as partition key for friendships
   */
  async update(id, updates) {
    try {
      const container = this.getContainer();
      
      // First get the existing document to find the userId (partition key)
      const querySpec = {
        query: 'SELECT * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: id }]
      };
      const { resources: items } = await container.items.query(querySpec).fetchAll();
      
      if (!items || items.length === 0) {
        return { success: false, error: 'Document not found' };
      }

      const existing = items[0];
      const partitionKey = existing.userId; // Use userId as partition key

      // Merge updates with existing data
      const updatedItem = {
        ...existing,
        ...updates,
        id: existing.id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString()
      };

      const { resource: updated } = await container.item(id, partitionKey).replace(updatedItem);
      return { success: true, data: updated };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get friendships for a user
   */
  async getFriendshipsForUser(userId) {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.userId = @userId OR c.friendId = @userId',
      parameters: [{ name: '@userId', value: userId }]
    };
    return this.query(querySpec);
  }

  /**
   * Get pending friend requests for a user
   */
  async getPendingRequests(userId) {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.friendId = @userId AND c.status = "pending"',
      parameters: [{ name: '@userId', value: userId }]
    };
    return this.query(querySpec);
  }

  /**
   * Check if friendship exists between two users
   */
  async checkFriendship(userId1, userId2) {
    const querySpec = {
      query: 'SELECT * FROM c WHERE (c.userId = @userId1 AND c.friendId = @userId2) OR (c.userId = @userId2 AND c.friendId = @userId1)',
      parameters: [
        { name: '@userId1', value: userId1 },
        { name: '@userId2', value: userId2 }
      ]
    };
    const result = await this.query(querySpec);
    if (result.success && result.data.length > 0) {
      return { success: true, data: result.data[0] };
    }
    return { success: false, error: 'Friendship not found' };
  }
}

/**
 * Group service
 */
class GroupService extends BaseService {
  constructor() {
    super(collections.GROUPS);
  }

  /**
   * Search groups by name or tags
   */
  async search(searchTerm) {
    const querySpec = {
      query: 'SELECT * FROM c WHERE CONTAINS(c.name, @searchTerm) OR ARRAY_CONTAINS(c.tags, @searchTerm)',
      parameters: [{ name: '@searchTerm', value: searchTerm }]
    };
    return this.query(querySpec);
  }

  /**
   * Get groups where user is a member
   */
  async getGroupsForUser(userId) {
    const querySpec = {
      query: 'SELECT * FROM c WHERE ARRAY_CONTAINS(c.memberIds, @userId) OR ARRAY_CONTAINS(c.adminIds, @userId)',
      parameters: [{ name: '@userId', value: userId }]
    };
    return this.query(querySpec);
  }

  /**
   * Get public groups
   */
  async getPublicGroups() {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.isPublic = true'
    };
    return this.query(querySpec);
  }
}

/**
 * Post service
 */
class PostService extends BaseService {
  constructor() {
    super(collections.POSTS);
  }

  /**
   * Get posts for a group
   */
  async getPostsForGroup(groupId) {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.groupId = @groupId ORDER BY c.createdAt DESC',
      parameters: [{ name: '@groupId', value: groupId }]
    };
    return this.query(querySpec);
  }

  /**
   * Get posts for an event
   */
  async getPostsForEvent(eventId) {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.eventId = @eventId ORDER BY c.createdAt DESC',
      parameters: [{ name: '@eventId', value: eventId }]
    };
    return this.query(querySpec);
  }

  /**
   * Get posts by author
   */
  async getPostsByAuthor(authorId) {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.authorId = @authorId ORDER BY c.createdAt DESC',
      parameters: [{ name: '@authorId', value: authorId }]
    };
    return this.query(querySpec);
  }
}

/**
 * Comment service
 */
class CommentService extends BaseService {
  constructor() {
    super(collections.COMMENTS);
  }

  /**
   * Get comments for a post
   */
  async getCommentsForPost(postId) {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.postId = @postId ORDER BY c.createdAt ASC',
      parameters: [{ name: '@postId', value: postId }]
    };
    return this.query(querySpec);
  }

  /**
   * Get comments by author
   */
  async getCommentsByAuthor(authorId) {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.authorId = @authorId ORDER BY c.createdAt DESC',
      parameters: [{ name: '@authorId', value: authorId }]
    };
    return this.query(querySpec);
  }
}

/**
 * Event service
 */
class EventService extends BaseService {
  constructor() {
    super(collections.EVENTS);
  }

  /**
   * Get events organized by user
   */
  async getEventsByOrganizer(organizerId) {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.organizerId = @organizerId ORDER BY c.startDate ASC',
      parameters: [{ name: '@organizerId', value: organizerId }]
    };
    return this.query(querySpec);
  }

  /**
   * Get events where user is invited
   */
  async getEventsForUser(userId) {
    const querySpec = {
      query: 'SELECT * FROM c WHERE ARRAY_CONTAINS(c.invitedUserIds, @userId) OR c.organizerId = @userId ORDER BY c.startDate ASC',
      parameters: [{ name: '@userId', value: userId }]
    };
    return this.query(querySpec);
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents() {
    const now = new Date().toISOString();
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.startDate > @now ORDER BY c.startDate ASC',
      parameters: [{ name: '@now', value: now }]
    };
    return this.query(querySpec);
  }
}

// Service instances
const userService = new UserService();
const friendshipService = new FriendshipService();
const groupService = new GroupService();
const postService = new PostService();
const commentService = new CommentService();
const eventService = new EventService();

// Container name mapping to service instances
const serviceMap = {
  'users': userService,
  'friendships': friendshipService,
  'groups': groupService,
  'posts': postService,
  'comments': commentService,
  'events': eventService
};

/**
 * Unified database service interface for routes
 */
const databaseService = {
  /**
   * Get multiple items from a container with optional filtering
   */
  async getItems(containerName, filter = {}) {
    const service = serviceMap[containerName];
    if (!service) {
      throw new Error(`Unknown container: ${containerName}`);
    }

    try {
      const result = await service.getAll(filter);
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(`Error getting items from ${containerName}:`, error);
      throw error;
    }
  },

  /**
   * Get a single item by ID
   */
  async getItem(containerName, id) {
    const service = serviceMap[containerName];
    if (!service) {
      throw new Error(`Unknown container: ${containerName}`);
    }

    try {
      const result = await service.getById(id);
      if (result.success) {
        return result.data;
      } else if (result.error === 'Document not found') {
        return null;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(`Error getting item ${id} from ${containerName}:`, error);
      throw error;
    }
  },

  /**
   * Create a new item
   */
  async createItem(containerName, data) {
    const service = serviceMap[containerName];
    if (!service) {
      throw new Error(`Unknown container: ${containerName}`);
    }

    try {
      const result = await service.create(data);
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(`Error creating item in ${containerName}:`, error);
      throw error;
    }
  },

  /**
   * Update an existing item
   */
  async updateItem(containerName, id, data) {
    const service = serviceMap[containerName];
    if (!service) {
      throw new Error(`Unknown container: ${containerName}`);
    }

    try {
      const result = await service.update(id, data);
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(`Error updating item ${id} in ${containerName}:`, error);
      throw error;
    }
  },

  /**
   * Delete an item
   */
  async deleteItem(containerName, id) {
    const service = serviceMap[containerName];
    if (!service) {
      throw new Error(`Unknown container: ${containerName}`);
    }

    try {
      const result = await service.delete(id);
      if (result.success) {
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(`Error deleting item ${id} from ${containerName}:`, error);
      throw error;
    }
  }
};

module.exports = databaseService;

// Also export the service classes for direct use when needed
module.exports.services = {
  BaseService,
  UserService,
  FriendshipService,
  GroupService,
  PostService,
  CommentService,
  EventService
};