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
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('friends');

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

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      if (currentUserId === mockUserId) {
        // Mock search results
        const mockResults = [
          {
            id: 'search-1',
            name: 'David Miller',
            email: 'david@example.com',
            bio: 'Frontend developer'
          },
          {
            id: 'search-2',
            name: 'Emma Davis',
            email: 'emma@example.com',
            bio: 'UX designer'
          }
        ].filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(mockResults);
        return;
      }

      const response = await apiRequest(`/api/users/search/${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        // Filter out current user and existing friends
        const filteredResults = data.users.filter(user => 
          user.id !== currentUserId && 
          !friends.some(f => f.friend?.id === user.id) &&
          !pendingRequests.some(r => r.requester?.id === user.id) &&
          !sentRequests.some(s => s.friendId === user.id)
        );
        setSearchResults(filteredResults);
      }
    } catch (err) {
      console.error('Error searching users:', err);
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      if (currentUserId === mockUserId) {
        // Mock successful request
        alert(`Friend request sent to user ${userId}!`);
        setSearchResults(prev => prev.filter(user => user.id !== userId));
        return;
      }

      const response = await apiRequest('/api/friendships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: currentUserId,
          friendId: userId
        })
      });

      if (response.ok) {
        alert('Friend request sent successfully!');
        setSearchResults(prev => prev.filter(user => user.id !== userId));
        fetchFriendshipsData(); // Refresh data
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send friend request');
      }
    } catch (err) {
      console.error('Error sending friend request:', err);
      alert('Failed to send friend request. Please try again.');
    }
  };

  const respondToFriendRequest = async (friendshipId, status) => {
    try {
      if (currentUserId === mockUserId) {
        // Mock response
        alert(`Friend request ${status}!`);
        setPendingRequests(prev => prev.filter(req => req.id !== friendshipId));
        if (status === 'accepted') {
          fetchFriendshipsData(); // Refresh to show new friend
        }
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
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${status} friend request`);
      }
    } catch (err) {
      console.error(`Error ${status} friend request:`, err);
      alert(`Failed to ${status} friend request. Please try again.`);
    }
  };

  const getUserInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  };

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
          className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          My Friends ({friends.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Friend Requests ({pendingRequests.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Find Friends
        </button>
      </div>

      <div className="friends-content">
        {activeTab === 'friends' && (
          <div className="friends-list">
            {friends.length === 0 ? (
              <div className="empty-state">
                <p>You don't have any friends yet. Use the "Find Friends" tab to connect with people!</p>
              </div>
            ) : (
              friends.map((friendship) => (
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

        {activeTab === 'requests' && (
          <div className="requests-list">
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

        {activeTab === 'search' && (
          <div className="search-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search for people by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="search-input"
              />
              <button onClick={handleSearch} className="search-button">
                Search
              </button>
            </div>

            <div className="search-results">
              {searchResults.length === 0 && searchTerm && (
                <div className="empty-state">
                  <p>No users found matching "{searchTerm}".</p>
                </div>
              )}
              
              {searchResults.map((user) => (
                <div key={user.id} className="user-card">
                  <div className="friend-avatar">
                    {getUserInitials(user.name)}
                  </div>
                  <div className="friend-info">
                    <h3>{user.name}</h3>
                    <p className="friend-email">{user.email}</p>
                    {user.bio && (
                      <p className="friend-bio">{user.bio}</p>
                    )}
                  </div>
                  <div className="user-actions">
                    <button 
                      onClick={() => sendFriendRequest(user.id)}
                      className="add-friend-button"
                    >
                      Add Friend
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;