import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { apiRequest } from '../../utils/apiConfig';
import { validateAndSanitizeHomeAccountId } from '../../utils/authUtils';
import './Friends.css';

const FriendSearch = ({ searchQuery, onBack }) => {
  const { accounts } = useMsal();
  const account = accounts[0];
  const [currentUserId, setCurrentUserId] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  // Mock data for development
  const mockUserId = 'mock-user-id-123';

  useEffect(() => {
    initializeUser();
  }, [account]);

  useEffect(() => {
    if (currentUserId && searchQuery) {
      handleSearch();
    }
  }, [currentUserId, searchQuery]);

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

  const fetchUserFriendships = async () => {
    try {
      if (currentUserId === mockUserId) {
        // Use mock data for development
        setFriends(['friend-1', 'friend-2']);
        setPendingRequests(['friend-3']);
        setSentRequests([]);
        return;
      }

      const friendshipsResponse = await apiRequest(`/api/friendships/user/${currentUserId}`);
      const pendingResponse = await apiRequest(`/api/friendships/pending/${currentUserId}`);

      if (friendshipsResponse.ok && pendingResponse.ok) {
        const friendshipsData = await friendshipsResponse.json();
        const pendingData = await pendingResponse.json();

        const friendIds = friendshipsData.friendships
          .filter(f => f.status === 'accepted')
          .map(f => f.userId === currentUserId ? f.friendId : f.userId);
        
        const pendingIds = pendingData.requests.map(r => r.requestedBy);
        const sentIds = friendshipsData.friendships
          .filter(f => f.status === 'pending' && f.requestedBy === currentUserId)
          .map(f => f.friendId);

        setFriends(friendIds);
        setPendingRequests(pendingIds);
        setSentRequests(sentIds);
      }
    } catch (err) {
      console.error('Error fetching friendships:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Fetch user friendships to filter results
      await fetchUserFriendships();

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
          },
          {
            id: 'search-3',
            name: 'Michael Johnson',
            email: 'michael@example.com',
            bio: 'Product manager'
          }
        ].filter(user => 
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(mockResults);
        setLoading(false);
        return;
      }

      const response = await apiRequest(`/api/users/search/${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        // Filter out current user and existing friends/requests
        const filteredResults = data.users.filter(user => 
          user.id !== currentUserId && 
          !friends.includes(user.id) &&
          !pendingRequests.includes(user.id) &&
          !sentRequests.includes(user.id)
        );
        setSearchResults(filteredResults);
      } else {
        throw new Error('Failed to search users');
      }
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Failed to search users. Please try again.');
      // Fallback to mock data
      if (currentUserId === mockUserId) {
        const mockResults = [
          {
            id: 'search-1',
            name: 'David Miller',
            email: 'david@example.com',
            bio: 'Frontend developer'
          }
        ].filter(user => 
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(mockResults);
      }
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      if (currentUserId === mockUserId) {
        // Mock successful request
        alert('Friend request sent successfully!');
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
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send friend request');
      }
    } catch (err) {
      console.error('Error sending friend request:', err);
      alert('Failed to send friend request. Please try again.');
    }
  };

  const getUserInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  };

  return (
    <div className="friends-container">
      <div className="friends-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Friends
        </button>
        <h1>Search Results for "{searchQuery}"</h1>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={handleSearch} className="retry-button">
            Retry
          </button>
        </div>
      )}

      <div className="search-section">
        {loading ? (
          <div className="friends-loading">
            <div className="loading-spinner"></div>
            <p>Searching for people...</p>
          </div>
        ) : (
          <div className="search-results">
            {searchResults.length === 0 ? (
              <div className="empty-state">
                <p>No users found matching "{searchQuery}". Try a different search term.</p>
              </div>
            ) : (
              <>
                <p className="results-count">Found {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}</p>
                {searchResults.map((user) => (
                  <div key={user.id} className="user-card">
                    <div className="friend-avatar">
                      {getUserInitials(user.name)}
                    </div>
                    <div className="friend-info">
                      <h3>{user.name}</h3>
                      <p className="friend-email">{user.email}</p>
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
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendSearch;