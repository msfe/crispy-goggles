import { apiRequest } from '../utils/apiConfig';
import { validateAndSanitizeHomeAccountId } from '../utils/authUtils';
import { 
  shouldUseMockData, 
  getMockUserId, 
  MockFriendshipService, 
  MockUserService,
  initializeMockUser 
} from './mockService';

/**
 * Event API Service
 */
export const EventApiService = {
  /**
   * Get all events with optional filtering
   */
  async getEvents(organizerId = null, userId = null) {
    try {
      let url = '/api/events';
      const params = new URLSearchParams();
      
      if (organizerId) {
        params.append('organizerId', organizerId);
      }
      
      if (userId) {
        params.append('userId', userId);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await apiRequest(url);
      
      if (response.ok) {
        const events = await response.json();
        return Array.isArray(events) ? events : [];
      } else {
        throw new Error(`Failed to fetch events: ${response.status}`);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      return [];
    }
  },

  /**
   * Get a specific event by ID
   */
  async getEvent(eventId) {
    try {
      const response = await apiRequest(`/api/events/${eventId}`);
      
      if (response.ok) {
        return await response.json();
      } else if (response.status === 404) {
        throw new Error('Event not found');
      } else {
        throw new Error(`Failed to fetch event: ${response.status}`);
      }
    } catch (err) {
      console.error('Error fetching event:', err);
      throw err;
    }
  },

  /**
   * Create a new event
   */
  async createEvent(eventData) {
    try {
      const response = await apiRequest('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create event: ${response.status}`);
      }
    } catch (err) {
      console.error('Error creating event:', err);
      throw err;
    }
  },

  /**
   * Update an existing event
   */
  async updateEvent(eventId, updateData) {
    try {
      const response = await apiRequest(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        return await response.json();
      } else if (response.status === 404) {
        throw new Error('Event not found');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update event: ${response.status}`);
      }
    } catch (err) {
      console.error('Error updating event:', err);
      throw err;
    }
  },

  /**
   * Delete an event
   */
  async deleteEvent(eventId) {
    try {
      const response = await apiRequest(`/api/events/${eventId}`, {
        method: 'DELETE'
      });

      if (response.ok || response.status === 204) {
        return true;
      } else if (response.status === 404) {
        throw new Error('Event not found');
      } else {
        throw new Error(`Failed to delete event: ${response.status}`);
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      throw err;
    }
  },

  /**
   * RSVP to an event
   */
  async rsvpToEvent(eventId, userId, status) {
    try {
      const response = await apiRequest(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, status })
      });

      if (response.ok) {
        return await response.json();
      } else if (response.status === 404) {
        throw new Error('Event not found');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update RSVP: ${response.status}`);
      }
    } catch (err) {
      console.error('Error updating RSVP:', err);
      throw err;
    }
  },

  /**
   * Get posts for an event
   */
  async getEventPosts(eventId) {
    try {
      const response = await apiRequest(`/api/events/${eventId}/posts`);
      
      if (response.ok) {
        const posts = await response.json();
        return Array.isArray(posts) ? posts : [];
      } else if (response.status === 404) {
        throw new Error('Event not found');
      } else {
        throw new Error(`Failed to fetch event posts: ${response.status}`);
      }
    } catch (err) {
      console.error('Error fetching event posts:', err);
      return [];
    }
  },

  /**
   * Create a post in an event
   */
  async createEventPost(eventId, postData) {
    try {
      const response = await apiRequest(`/api/events/${eventId}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        return await response.json();
      } else if (response.status === 404) {
        throw new Error('Event not found');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create post: ${response.status}`);
      }
    } catch (err) {
      console.error('Error creating event post:', err);
      throw err;
    }
  }
};

/**
 * User API Service
 */
export const UserApiService = {
  /**
   * Initialize user - try to get from Azure, fallback to mock
   */
  async initializeUser(account) {
    try {
      if (!account) {
        return initializeMockUser();
      }

      const sanitizedHomeAccountId = validateAndSanitizeHomeAccountId(account.homeAccountId);
      if (!sanitizedHomeAccountId) {
        throw new Error('Invalid account ID');
      }

      const response = await apiRequest(`/api/users/azure/${sanitizedHomeAccountId}`);
      if (response.ok) {
        const userData = await response.json();
        return userData.id;
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (err) {
      console.error('Error initializing user:', err);
      return initializeMockUser();
    }
  },

  /**
   * Search users with query parameter (optimized)
   */
  async searchUsers(searchQuery, currentUserId) {
    if (shouldUseMockData(currentUserId)) {
      return MockUserService.search(searchQuery);
    }

    try {
      const response = await apiRequest(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Search API response:', data);
        
        // Handle various response formats defensively
        if (data && Array.isArray(data.users)) {
          return data.users;
        } else if (data && Array.isArray(data)) {
          // In case the API returns users directly as an array
          return data;
        } else if (data && typeof data === 'object') {
          console.warn('Search API returned unexpected data structure:', data);
          // Check if the object has any user-like properties
          if (data.id && data.name) {
            return [data]; // Single user object
          }
        }
        
        console.warn('Search API returned empty or invalid data:', data);
        return [];
      } else {
        throw new Error(`Search failed with status ${response.status}`);
      }
    } catch (err) {
      console.error('Error searching users:', err);
      // Fallback to mock data if configured
      if (currentUserId === getMockUserId()) {
        return MockUserService.search(searchQuery);
      }
      // Always return an array even on error to prevent downstream issues
      return [];
    }
  },

  /**
   * Batch get users by IDs (optimized to avoid N+1 queries)
   */
  async batchGetUsers(userIds, currentUserId) {
    if (!userIds || userIds.length === 0) {
      return [];
    }

    if (shouldUseMockData(currentUserId)) {
      return MockUserService.batchGetUsers(userIds);
    }

    try {
      const response = await apiRequest('/api/users/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userIds })
      });

      if (response.ok) {
        const data = await response.json();
        return data.users || [];
      } else {
        throw new Error('Failed to batch fetch users');
      }
    } catch (err) {
      console.error('Error batch fetching users:', err);
      // Fallback to individual requests if batch fails
      return await this.fallbackIndividualRequests(userIds);
    }
  },

  /**
   * Fallback to individual user requests if batch fails
   */
  async fallbackIndividualRequests(userIds) {
    const users = [];
    for (const userId of userIds) {
      try {
        const response = await apiRequest(`/api/users/${userId}`);
        if (response.ok) {
          const userData = await response.json();
          users.push(userData);
        }
      } catch (err) {
        console.error(`Error fetching user ${userId}:`, err);
        // Continue with other users
      }
    }
    return users;
  },

  /**
   * Send friend request
   */
  async sendFriendRequest(currentUserId, targetUserId) {
    if (shouldUseMockData(currentUserId)) {
      return MockUserService.sendFriendRequest(targetUserId);
    }

    try {
      const response = await apiRequest('/api/friendships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: currentUserId,
          friendId: targetUserId
        })
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Friend request sent successfully!'
        };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send friend request');
      }
    } catch (err) {
      console.error('Error sending friend request:', err);
      throw err;
    }
  }
};

/**
 * Friendship API Service
 */
export const FriendshipApiService = {
  /**
   * Get friendships data with optimized user fetching
   */
  async getFriendshipsData(currentUserId) {
    if (shouldUseMockData(currentUserId)) {
      return MockFriendshipService.getFriendshipsData();
    }

    try {
      // Fetch all friendship data
      const [friendshipsResponse, pendingResponse] = await Promise.all([
        apiRequest(`/api/friendships/user/${currentUserId}`),
        apiRequest(`/api/friendships/pending/${currentUserId}`)
      ]);

      if (!friendshipsResponse.ok || !pendingResponse.ok) {
        throw new Error('Failed to fetch friendships data');
      }

      const [friendshipsData, pendingData] = await Promise.all([
        friendshipsResponse.json(),
        pendingResponse.json()
      ]);

      // Separate different types of relationships
      const acceptedFriendships = friendshipsData.friendships.filter(f => f.status === 'accepted');
      const sentRequestsList = friendshipsData.friendships.filter(f => 
        f.status === 'pending' && f.requestedBy === currentUserId
      );

      // Collect all user IDs that need to be fetched
      const friendIds = acceptedFriendships.map(f => 
        f.userId === currentUserId ? f.friendId : f.userId
      );
      const requesterIds = pendingData.requests.map(r => r.requestedBy);
      const sentRequestIds = sentRequestsList.map(r => r.friendId);

      // Batch fetch all users to avoid N+1 queries
      const allUserIds = [...new Set([...friendIds, ...requesterIds, ...sentRequestIds])];
      const users = await UserApiService.batchGetUsers(allUserIds, currentUserId);
      
      // Create user lookup map
      const userMap = {};
      users.forEach(user => {
        userMap[user.id] = user;
      });

      // Attach user data to friendships
      const friendsWithDetails = acceptedFriendships.map(friendship => ({
        ...friendship,
        friend: userMap[friendship.userId === currentUserId ? friendship.friendId : friendship.userId]
      }));

      const pendingWithDetails = pendingData.requests.map(request => ({
        ...request,
        requester: userMap[request.requestedBy]
      }));

      const sentRequestsWithDetails = sentRequestsList.map(request => ({
        ...request,
        friend: userMap[request.friendId]
      }));

      return {
        friends: friendsWithDetails,
        pendingRequests: pendingWithDetails,
        sentRequests: sentRequestsWithDetails
      };
    } catch (err) {
      console.error('Error fetching friendships:', err);
      // Fallback to mock data if configured
      if (currentUserId === getMockUserId()) {
        return MockFriendshipService.getFriendshipsData();
      }
      throw err;
    }
  },

  /**
   * Respond to friend request
   */
  async respondToFriendRequest(friendshipId, status, currentUserId) {
    if (shouldUseMockData(currentUserId)) {
      return MockFriendshipService.respondToFriendRequest(friendshipId, status);
    }

    try {
      const response = await apiRequest(`/api/friendships/${friendshipId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        return {
          success: true,
          message: `Friend request ${status}!`
        };
      } else {
        // Handle specific error cases
        if (response.status === 503) {
          // Database not configured - fall back to mock behavior
          console.log(`Database not configured, using mock: ${status} friend request ${friendshipId}`);
          return MockFriendshipService.respondToFriendRequest(friendshipId, status);
        } else if (response.status === 404) {
          throw new Error('Friend request not found. It may have already been responded to.');
        } else {
          let errorMessage = `Failed to ${status} friend request`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (parseError) {
            console.warn('Could not parse error response:', parseError);
          }
          throw new Error(errorMessage);
        }
      }
    } catch (err) {
      console.error(`Error ${status} friend request:`, err);
      throw err;
    }
  },

  /**
   * Get user friendships for search filtering
   */
  async getUserFriendships(currentUserId) {
    if (shouldUseMockData(currentUserId)) {
      return MockFriendshipService.getUserFriendships();
    }

    try {
      const [friendshipsResponse, pendingResponse] = await Promise.all([
        apiRequest(`/api/friendships/user/${currentUserId}`),
        apiRequest(`/api/friendships/pending/${currentUserId}`)
      ]);

      if (!friendshipsResponse.ok || !pendingResponse.ok) {
        throw new Error('Failed to fetch friendships data');
      }

      const [friendshipsData, pendingData] = await Promise.all([
        friendshipsResponse.json(),
        pendingResponse.json()
      ]);

      // Ensure we have valid data structures
      const friendships = Array.isArray(friendshipsData.friendships) ? friendshipsData.friendships : [];
      const requests = Array.isArray(pendingData.requests) ? pendingData.requests : [];

      const friendIds = friendships
        .filter(f => f && f.status === 'accepted')
        .map(f => f.userId === currentUserId ? f.friendId : f.userId)
        .filter(id => id); // Remove any undefined/null IDs
      
      const pendingIds = requests
        .map(r => r && r.requestedBy)
        .filter(id => id); // Remove any undefined/null IDs
        
      const sentIds = friendships
        .filter(f => f && f.status === 'pending' && f.requestedBy === currentUserId)
        .map(f => f.friendId)
        .filter(id => id); // Remove any undefined/null IDs

      return {
        friends: friendIds,
        pendingRequests: pendingIds,
        sentRequests: sentIds
      };
    } catch (err) {
      console.error('Error fetching friendships:', err);
      // Always return valid arrays to prevent downstream errors
      return { friends: [], pendingRequests: [], sentRequests: [] };
    }
  }
};