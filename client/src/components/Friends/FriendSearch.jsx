import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { UserApiService, FriendshipApiService } from '../../services/apiService';
import { useAlert } from '../Alert';
import './Friends.css';

const FriendSearch = ({ searchQuery, onBack }) => {
  const { accounts } = useMsal();
  const account = accounts[0];
  const { showInfo, showError } = useAlert();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

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
      const userId = await UserApiService.initializeUser(account);
      setCurrentUserId(userId);
    } catch (err) {
      console.error('Error initializing user:', err);
      setError('Failed to initialize user. Please try again.');
    }
  };

  const fetchUserFriendships = async () => {
    try {
      const friendshipData = await FriendshipApiService.getUserFriendships(currentUserId);
      
      // Ensure we have valid arrays
      setFriends(Array.isArray(friendshipData.friends) ? friendshipData.friends : []);
      setPendingRequests(Array.isArray(friendshipData.pendingRequests) ? friendshipData.pendingRequests : []);
      setSentRequests(Array.isArray(friendshipData.sentRequests) ? friendshipData.sentRequests : []);
    } catch (err) {
      console.error('Error fetching friendships:', err);
      // Set empty arrays on error to ensure filtering doesn't break
      setFriends([]);
      setPendingRequests([]);
      setSentRequests([]);
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
      const friendshipData = await FriendshipApiService.getUserFriendships(currentUserId);
      
      // Ensure we have valid arrays and update state
      const friendIds = Array.isArray(friendshipData.friends) ? friendshipData.friends : [];
      const pendingIds = Array.isArray(friendshipData.pendingRequests) ? friendshipData.pendingRequests : [];
      const sentIds = Array.isArray(friendshipData.sentRequests) ? friendshipData.sentRequests : [];
      
      setFriends(friendIds);
      setPendingRequests(pendingIds);
      setSentRequests(sentIds);

      // Search for users
      const users = await UserApiService.searchUsers(searchQuery, currentUserId);
      
      // Ensure users is an array
      if (!Array.isArray(users)) {
        console.warn('Search API returned non-array response:', users);
        setSearchResults([]);
        return;
      }
      
      // Filter out current user and existing friends/requests
      const filteredResults = users.filter(user => 
        user && 
        user.id && 
        user.id !== currentUserId && 
        !friendIds.includes(user.id) &&
        !pendingIds.includes(user.id) &&
        !sentIds.includes(user.id)
      );
      
      setSearchResults(filteredResults);
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Failed to search users. Please try again.');
      // Set empty arrays on error to ensure safe state
      setFriends([]);
      setPendingRequests([]);
      setSentRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      const result = await UserApiService.sendFriendRequest(currentUserId, userId);
      
      if (result.success) {
        showInfo(result.message);
        setSearchResults(prev => prev.filter(user => user.id !== userId));
      }
    } catch (err) {
      console.error('Error sending friend request:', err);
      showError('Failed to send friend request. Please try again.');
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