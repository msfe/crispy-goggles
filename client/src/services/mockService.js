/**
 * Mock Service - Centralized mock data and logic for development
 * This service provides mock data and functionality when the backend is not available
 */

// Mock configuration
export const MOCK_CONFIG = {
  ENABLED: true, // Can be toggled via environment variable or config
  MOCK_USER_ID: 'mock-user-id-123'
};

// Mock data definitions
const MOCK_USERS = {
  'friend-1': {
    id: 'friend-1',
    name: 'Alice Johnson',
    email: 'alice@example.com'
  },
  'friend-2': {
    id: 'friend-2',
    name: 'Bob Wilson',
    email: 'bob@example.com'
  },
  'friend-3': {
    id: 'friend-3',
    name: 'Charlie Brown',
    email: 'charlie@example.com'
  },
  'friend-sent-1': {
    id: 'friend-sent-1',
    name: 'Dave Miller',
    email: 'dave@example.com'
  },
  'search-1': {
    id: 'search-1',
    name: 'David Miller',
    email: 'david@example.com'
  },
  'search-2': {
    id: 'search-2',
    name: 'Emma Davis',
    email: 'emma@example.com'
  },
  'search-3': {
    id: 'search-3',
    name: 'Michael Johnson',
    email: 'michael@example.com'
  }
};

const MOCK_FRIENDSHIPS = [
  {
    id: 'friendship-1',
    userId: MOCK_CONFIG.MOCK_USER_ID,
    friendId: 'friend-1',
    status: 'accepted',
    createdAt: '2024-01-01T00:00:00.000Z',
    friend: MOCK_USERS['friend-1']
  },
  {
    id: 'friendship-2',
    userId: MOCK_CONFIG.MOCK_USER_ID,
    friendId: 'friend-2',
    status: 'accepted',
    createdAt: '2024-01-02T00:00:00.000Z',
    friend: MOCK_USERS['friend-2']
  }
];

const MOCK_PENDING_REQUESTS = [
  {
    id: 'friendship-3',
    userId: 'friend-3',
    friendId: MOCK_CONFIG.MOCK_USER_ID,
    requestedBy: 'friend-3',
    status: 'pending',
    createdAt: '2024-01-03T00:00:00.000Z',
    requester: MOCK_USERS['friend-3']
  }
];

const MOCK_SENT_REQUESTS = [
  {
    id: 'friendship-sent-1',
    userId: MOCK_CONFIG.MOCK_USER_ID,
    friendId: 'friend-sent-1',
    requestedBy: MOCK_CONFIG.MOCK_USER_ID,
    status: 'pending',
    createdAt: '2024-01-04T00:00:00.000Z',
    friend: MOCK_USERS['friend-sent-1']
  }
];

/**
 * Check if we should use mock data
 */
export const shouldUseMockData = (currentUserId) => {
  return MOCK_CONFIG.ENABLED && currentUserId === MOCK_CONFIG.MOCK_USER_ID;
};

/**
 * Get mock user ID
 */
export const getMockUserId = () => {
  return MOCK_CONFIG.MOCK_USER_ID;
};

/**
 * Mock friendship operations
 */
export const MockFriendshipService = {
  /**
   * Get friendships data for the mock user
   */
  getFriendshipsData: () => {
    return {
      friends: [...MOCK_FRIENDSHIPS],
      pendingRequests: [...MOCK_PENDING_REQUESTS],
      sentRequests: [...MOCK_SENT_REQUESTS]
    };
  },

  /**
   * Accept or reject a friend request
   */
  respondToFriendRequest: (friendshipId, status) => {
    console.log(`Mock: ${status} friend request ${friendshipId}`);
    
    // Find the request
    const requestIndex = MOCK_PENDING_REQUESTS.findIndex(req => req.id === friendshipId);
    if (requestIndex === -1) {
      throw new Error('Friend request not found');
    }

    const request = MOCK_PENDING_REQUESTS[requestIndex];
    
    if (status === 'accepted') {
      // Add to friends list
      const newFriend = {
        id: `friendship-accepted-${Date.now()}`,
        userId: MOCK_CONFIG.MOCK_USER_ID,
        friendId: request.requester.id,
        status: 'accepted',
        createdAt: new Date().toISOString(),
        friend: request.requester
      };
      MOCK_FRIENDSHIPS.push(newFriend);
    }

    // Remove from pending requests
    MOCK_PENDING_REQUESTS.splice(requestIndex, 1);
    
    return {
      success: true,
      message: `Friend request ${status}!`
    };
  },

  /**
   * Get user friendships (IDs only)
   */
  getUserFriendships: () => {
    const friendIds = MOCK_FRIENDSHIPS
      .filter(f => f.status === 'accepted')
      .map(f => f.friendId);
    
    const pendingIds = MOCK_PENDING_REQUESTS.map(r => r.requestedBy);
    const sentIds = MOCK_SENT_REQUESTS.map(r => r.friendId);

    return {
      friends: friendIds,
      pendingRequests: pendingIds,
      sentRequests: sentIds
    };
  }
};

/**
 * Mock user search operations
 */
export const MockUserService = {
  /**
   * Search for users
   */
  search: (searchQuery) => {
    if (!searchQuery.trim()) {
      return [];
    }

    return Object.values(MOCK_USERS)
      .filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter(user => user.id !== MOCK_CONFIG.MOCK_USER_ID); // Exclude current user
  },

  /**
   * Send friend request
   */
  sendFriendRequest: (userId) => {
    console.log(`Mock: Sending friend request to ${userId}`);
    return {
      success: true,
      message: 'Friend request sent successfully!'
    };
  },

  /**
   * Batch get users by IDs
   */
  batchGetUsers: (userIds) => {
    return userIds.map(id => MOCK_USERS[id]).filter(Boolean);
  }
};

/**
 * Initialize mock user ID if needed
 */
export const initializeMockUser = () => {
  return MOCK_CONFIG.MOCK_USER_ID;
};