const { getContainer, collections } = require('../config/cosmosConfig');

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
      return { success: true, data: items };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all documents (with optional filtering)
   */
  async getAll(filter = {}) {
    const { conditions = '', parameters = [] } = filter;
    const querySpec = {
      query: `SELECT * FROM c${conditions ? ` WHERE ${conditions}` : ''}`,
      parameters
    };
    return this.query(querySpec);
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
    const querySpec = {
      query: 'SELECT * FROM c WHERE CONTAINS(c.name, @searchTerm) OR CONTAINS(c.email, @searchTerm)',
      parameters: [{ name: '@searchTerm', value: searchTerm }]
    };
    return this.query(querySpec);
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
   * Search groups by tags (accepts array of tags)
   */
  async searchByTags(tagsArray) {
    if (!tagsArray || tagsArray.length === 0) {
      return { success: false, error: 'Tags array is required' };
    }

    // Build query to find groups that contain any of the specified tags
    const conditions = tagsArray.map((_, index) => `ARRAY_CONTAINS(c.tags, @tag${index})`).join(' OR ');
    const parameters = tagsArray.map((tag, index) => ({ name: `@tag${index}`, value: tag }));

    const querySpec = {
      query: `SELECT * FROM c WHERE c.isPublic = true AND (${conditions})`,
      parameters: parameters
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

module.exports = {
  BaseService,
  UserService,
  FriendshipService,
  GroupService,
  PostService,
  CommentService,
  EventService
};