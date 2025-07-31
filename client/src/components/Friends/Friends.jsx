import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { UserApiService, FriendshipApiService } from '../../services/apiService';
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
      const userId = await UserApiService.initializeUser(account);
      setCurrentUserId(userId);
    } catch (err) {
      console.error('Error initializing user:', err);
      setError('Failed to initialize user. Please try again.');
    }
  };

  const fetchFriendshipsData = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await FriendshipApiService.getFriendshipsData(currentUserId);
      setFriends(data.friends);
      setPendingRequests(data.pendingRequests);
      setSentRequests(data.sentRequests);
    } catch (err) {
      console.error('Error fetching friendships:', err);
      setError('Failed to load friendships. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const respondToFriendRequest = async (friendshipId, status) => {
    try {
      const result = await FriendshipApiService.respondToFriendRequest(friendshipId, status, currentUserId);
      
      if (result.success) {
        // Update UI state
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
        
        alert(result.message);
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

      {/* Pending Requests Module - Always at the top */}
      <div className="pending-requests-module">
        <div className="module-tabs">
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
        </div>

        <div className="module-content">
          {activeTab === 'received' && (
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
        </div>
      </div>

      {/* Friends List - Always below pending requests */}
      <div className="friends-list-section">
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
        
        <div className="friends-list">
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
                  <p className="friendship-date">
                    Friends since {new Date(friendship.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends;