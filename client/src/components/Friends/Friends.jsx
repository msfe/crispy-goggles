import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { apiRequest } from '../../utils/apiConfig';
import { extractUserInfo, validateAndSanitizeHomeAccountId } from '../../utils/authUtils';
import './Friends.css';

const Friends = () => {
  const { accounts } = useMsal();
  const account = accounts[0];
  const [currentUserId, setCurrentUserId] = useState(null);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('received'); // Default to received requests as requested
  const [friendsFilter, setFriendsFilter] = useState('');

  // Mock data for development
  const mockUserId = 'mock-user-id-123';
  const mockFriends = [
    {
      id: 'friendship-1',
      userId: mockUserId,
      friendId: 'friend-1',
      status: 'accepted',
      createdAt: '2024-01-01T00:00:00.000Z',
      friend: {
        id: 'friend-1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        bio: 'Software developer and tech enthusiast'
      }
    },
    {
      id: 'friendship-2',
      userId: mockUserId,
      friendId: 'friend-2',
      status: 'accepted',
      createdAt: '2024-01-02T00:00:00.000Z',
      friend: {
        id: 'friend-2',
        name: 'Bob Wilson',
        email: 'bob@example.com',
        bio: 'Designer and creative thinker'
      }
    }
  ];

  const mockPendingRequests = [
    {
      id: 'friendship-3',
      userId: 'friend-3',
      friendId: mockUserId,
      requestedBy: 'friend-3',
      status: 'pending',
      createdAt: '2024-01-03T00:00:00.000Z',
      requester: {
        id: 'friend-3',
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        bio: 'Product manager with a passion for innovation'
      }
    }
  ];

  useEffect(() => {
    initializeUser();
  }, [account]);

  useEffect(() => {
    if (currentUserId) {
      fetchFriendshipsData();
    }
  }, [currentUserId]);

  const initializeUser = async () => {
    try {
      if (!account) {
        setCurrentUserId(mockUserId);
        return;
      }

      const sanitizedHomeAccountId = validateAndSanitizeHomeAccountId(account.homeAccountId);
      if (!sanitizedHomeAccountId) {
        throw new Error('Invalid account ID');
      }

      const response = await apiRequest(`/api/users/azure/${sanitizedHomeAccountId}`);
      if (response.ok) {
        const userData = await response.json();
        setCurrentUserId(userData.id);
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (err) {
      console.error('Error initializing user:', err);
      setCurrentUserId(mockUserId);
    }
  };

  const fetchFriendshipsData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (currentUserId === mockUserId) {
        // Use mock data in development
        setFriends(mockFriends);
        setPendingRequests(mockPendingRequests);
        setSentRequests([]);
        setLoading(false);
        return;
      }

      // Fetch all friendships for the user
      const friendshipsResponse = await apiRequest(`/api/friendships/user/${currentUserId}`);
      const pendingResponse = await apiRequest(`/api/friendships/pending/${currentUserId}`);

      if (friendshipsResponse.ok && pendingResponse.ok) {
        const friendshipsData = await friendshipsResponse.json();
        const pendingData = await pendingResponse.json();

        // Separate accepted friendships from sent requests
        const acceptedFriendships = friendshipsData.friendships.filter(f => f.status === 'accepted');
        const sentRequestsList = friendshipsData.friendships.filter(f => 
          f.status === 'pending' && f.requestedBy === currentUserId
        );

        // Fetch user details for friends and requests
        const friendsWithDetails = await Promise.all(
          acceptedFriendships.map(async (friendship) => {
            const friendId = friendship.userId === currentUserId ? friendship.friendId : friendship.userId;
            const userResponse = await apiRequest(`/api/users/${friendId}`);
            if (userResponse.ok) {
              const friendData = await userResponse.json();
              return { ...friendship, friend: friendData };
            }
            return friendship;
          })
        );

        const pendingWithDetails = await Promise.all(
          pendingData.requests.map(async (request) => {
            const requesterResponse = await apiRequest(`/api/users/${request.requestedBy}`);
            if (requesterResponse.ok) {
              const requesterData = await requesterResponse.json();
              return { ...request, requester: requesterData };
            }
            return request;
          })
        );

        setFriends(friendsWithDetails);
        setPendingRequests(pendingWithDetails);
        setSentRequests(sentRequestsList);
      } else {
        throw new Error('Failed to fetch friendships data');
      }
    } catch (err) {
      console.error('Error fetching friendships:', err);
      setError('Failed to load friendships. Please try again.');
      // Fallback to mock data
      setFriends(mockFriends);
      setPendingRequests(mockPendingRequests);
      setSentRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const respondToFriendRequest = async (friendshipId, status) => {
    try {
      if (currentUserId === mockUserId) {
        // Mock response for development
        console.log(`Mock: ${status} friend request ${friendshipId}`);
        setPendingRequests(prev => prev.filter(req => req.id !== friendshipId));
        if (status === 'accepted') {
          // Add to friends list if accepted
          const acceptedRequest = pendingRequests.find(req => req.id === friendshipId);
          if (acceptedRequest) {
            const newFriend = {
              id: `friendship-accepted-${Date.now()}`,
              userId: currentUserId,
              friendId: acceptedRequest.requester.id,
              status: 'accepted',
              createdAt: new Date().toISOString(),
              friend: acceptedRequest.requester
            };
            setFriends(prev => [...prev, newFriend]);
          }
        }
        alert(`Friend request ${status}!`);
        return;
      }

      const response = await apiRequest(`/api/friendships/${friendshipId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        alert(`Friend request ${status}!`);
        fetchFriendshipsData(); // Refresh data
      } else {
        // Handle specific error cases
        if (response.status === 503) {
          // Database not configured - fall back to mock behavior
          console.log(`Database not configured, using mock: ${status} friend request ${friendshipId}`);
          setPendingRequests(prev => prev.filter(req => req.id !== friendshipId));
          if (status === 'accepted') {
            const acceptedRequest = pendingRequests.find(req => req.id === friendshipId);
            if (acceptedRequest) {
              const newFriend = {
                id: `friendship-accepted-${Date.now()}`,
                userId: currentUserId,
                friendId: acceptedRequest.requester.id,
                status: 'accepted',
                createdAt: new Date().toISOString(),
                friend: acceptedRequest.requester
              };
              setFriends(prev => [...prev, newFriend]);
            }
          }
          alert(`Friend request ${status}!`);
          return;
        } else if (response.status === 404) {
          throw new Error('Friend request not found. It may have already been responded to.');
        } else {
          let errorMessage = `Failed to ${status} friend request`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (parseError) {
            // If we can't parse the error response, use the default message
            console.warn('Could not parse error response:', parseError);
          }
          throw new Error(errorMessage);
        }
      }
    } catch (err) {
      console.error(`Error ${status} friend request:`, err);
      alert(`Failed to ${status} friend request: ${err.message}`);
    }
  };

  const getUserInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  };

  const filteredFriends = friends.filter(friendship => {
    if (!friendsFilter) return true;
    const friend = friendship.friend;
    return friend && (
      friend.name?.toLowerCase().includes(friendsFilter.toLowerCase()) ||
      friend.email?.toLowerCase().includes(friendsFilter.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="friends-container">
        <div className="friends-loading">
          <div className="loading-spinner"></div>
          <p>Loading friends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="friends-container">
      <div className="friends-header">
        <h1>Friends</h1>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchFriendshipsData} className="retry-button">
            Retry
          </button>
        </div>
      )}

      <div className="friends-tabs">
        <button 
          className={`tab-button ${activeTab === 'received' ? 'active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          Friend Requests ({pendingRequests.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          My Pending Requests ({sentRequests.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          My Friends ({friends.length})
        </button>
      </div>

      <div className="friends-content">
        {activeTab === 'received' && (
          <div className="requests-list">
            <h2>Friend Requests Received</h2>
            {pendingRequests.length === 0 ? (
              <div className="empty-state">
                <p>No pending friend requests.</p>
              </div>
            ) : (
              pendingRequests.map((request) => (
                <div key={request.id} className="request-card">
                  <div className="friend-avatar">
                    {getUserInitials(request.requester?.name)}
                  </div>
                  <div className="friend-info">
                    <h3>{request.requester?.name}</h3>
                    <p className="friend-email">{request.requester?.email}</p>
                    {request.requester?.bio && (
                      <p className="friend-bio">{request.requester.bio}</p>
                    )}
                    <p className="request-date">
                      Requested on {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="request-actions">
                    <button 
                      onClick={() => respondToFriendRequest(request.id, 'accepted')}
                      className="accept-button"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => respondToFriendRequest(request.id, 'rejected')}
                      className="reject-button"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'sent' && (
          <div className="requests-list">
            <h2>My Pending Requests</h2>
            {sentRequests.length === 0 ? (
              <div className="empty-state">
                <p>You haven't sent any friend requests.</p>
              </div>
            ) : (
              sentRequests.map((request) => (
                <div key={request.id} className="request-card">
                  <div className="friend-avatar">
                    {getUserInitials(request.friend?.name)}
                  </div>
                  <div className="friend-info">
                    <h3>{request.friend?.name}</h3>
                    <p className="friend-email">{request.friend?.email}</p>
                    {request.friend?.bio && (
                      <p className="friend-bio">{request.friend.bio}</p>
                    )}
                    <p className="request-date">
                      Sent on {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="request-status">
                    <span className="status-pending">Pending</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="friends-list">
            <div className="friends-header-section">
              <h2>My Friends</h2>
              <div className="friends-filter">
                <input
                  type="text"
                  placeholder="Search friends..."
                  value={friendsFilter}
                  onChange={(e) => setFriendsFilter(e.target.value)}
                  className="filter-input"
                />
              </div>
            </div>
            {filteredFriends.length === 0 ? (
              <div className="empty-state">
                {friends.length === 0 ? (
                  <p>You don't have any friends yet. Use the search bar in the top navigation to find and connect with people!</p>
                ) : (
                  <p>No friends match your search criteria.</p>
                )}
              </div>
            ) : (
              filteredFriends.map((friendship) => (
                <div key={friendship.id} className="friend-card">
                  <div className="friend-avatar">
                    {getUserInitials(friendship.friend?.name)}
                  </div>
                  <div className="friend-info">
                    <h3>{friendship.friend?.name}</h3>
                    <p className="friend-email">{friendship.friend?.email}</p>
                    {friendship.friend?.bio && (
                      <p className="friend-bio">{friendship.friend.bio}</p>
                    )}
                    <p className="friendship-date">
                      Friends since {new Date(friendship.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;