import { apiRequest } from '../utils/apiConfig';
import { validateAndSanitizeHomeAccountId } from '../utils/authUtils';
import { 
  shouldUseMockData, 
  getMockUserId, 
  MockFriendshipService, 
  MockUserService,
  initializeMockUser,
  MOCK_CONFIG
} from './mockService';

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
        return data.users || [];
      } else {
        throw new Error('Failed to search users');
      }
    } catch (err) {
      console.error('Error searching users:', err);
      // Fallback to mock data if configured
      if (currentUserId === getMockUserId()) {
        return MockUserService.search(searchQuery);
      }
      throw err;
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
   * Get user by ID
   */
  async getUserById(userId, currentUserId = null) {
    // Use mock data only if we're in pure mock mode (current user is mock user)
    if (shouldUseMockData(currentUserId)) {
      try {
        return MockUserService.getById(userId);
      } catch (mockErr) {
        // If mock data doesn't have the user, continue to API
        console.warn('Mock user not found, trying API:', mockErr.message);
      }
    }

    try {
      const response = await apiRequest(`/api/users/${userId}`);
      if (response.ok) {
        return await response.json();
      } else if (response.status === 503) {
        // Database not configured, fall back to mock data
        console.warn('Database not configured, falling back to mock data');
        try {
          return MockUserService.getById(userId);
        } catch (mockErr) {
          throw new Error('User not found and database not configured');
        }
      } else {
        throw new Error('User not found');
      }
    } catch (err) {
      console.error('Error fetching user by ID:', err);
      // Fallback to mock data if API fails and we haven't tried mock yet
      if (!shouldUseMockData(currentUserId)) {
        try {
          return MockUserService.getById(userId);
        } catch (mockErr) {
          throw err;
        }
      }
      throw err;
    }
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

      const friendIds = friendshipsData.friendships
        .filter(f => f.status === 'accepted')
        .map(f => f.userId === currentUserId ? f.friendId : f.userId);
      
      const pendingIds = pendingData.requests.map(r => r.requestedBy);
      const sentIds = friendshipsData.friendships
        .filter(f => f.status === 'pending' && f.requestedBy === currentUserId)
        .map(f => f.friendId);

      return {
        friends: friendIds,
        pendingRequests: pendingIds,
        sentRequests: sentIds
      };
    } catch (err) {
      console.error('Error fetching friendships:', err);
      return { friends: [], pendingRequests: [], sentRequests: [] };
    }
  }
};