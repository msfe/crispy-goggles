import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { UserApiService, FriendshipApiService } from '../../services/apiService';
import { MOCK_CONFIG, MockUserService } from '../../services/mockService';
import { apiRequest } from '../../utils/apiConfig';
import './UserProfile.css';

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { accounts } = useMsal();
  const account = accounts[0];
  
  const [currentUserId, setCurrentUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [mutualFriends, setMutualFriends] = useState([]);
  const [friendshipStatus, setFriendshipStatus] = useState('none');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    initializeUser();
  }, [account]);

  useEffect(() => {
    if (currentUserId && userId) {
      fetchUserProfile();
    }
  }, [currentUserId, userId]);

  const initializeUser = async () => {
    try {
      const userId = await UserApiService.initializeUser(account);
      setCurrentUserId(userId);
    } catch (err) {
      console.error('Error initializing current user:', err);
      setError('Failed to initialize user session. Please try again.');
    }
  };

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch user profile data
      const userResult = await UserApiService.getUserById(userId, currentUserId);
      setUser(userResult);

      // Don't fetch mutual friends and friendship status for own profile
      if (userId === currentUserId) {
        setLoading(false);
        return;
      }

      // For mock mode, set some mock mutual friends and friendship status
      if (!currentUserId || currentUserId === MOCK_CONFIG.MOCK_USER_ID) {
        // Mock mutual friends from mock service
        const mockMutualFriends = MockUserService.getMockMutualFriends();
        setMutualFriends(mockMutualFriends);
        setFriendshipStatus('none');
        setLoading(false);
        return;
      }

      // Fetch mutual friends and friendship status with proper error handling
      try {
        const [mutualFriendsResponse, friendshipStatusResponse] = await Promise.all([
          apiRequest(`/api/users/${userId}/mutual-friends/${currentUserId}`),
          apiRequest(`/api/users/${userId}/friendship-status/${currentUserId}`)
        ]);

        // Handle mutual friends response
        if (mutualFriendsResponse.ok) {
          try {
            const mutualFriendsData = await mutualFriendsResponse.json();
            setMutualFriends(mutualFriendsData.mutualFriends || []);
          } catch (parseError) {
            console.warn('Failed to parse mutual friends response as JSON, using empty array');
            setMutualFriends([]);
          }
        } else if (mutualFriendsResponse.status === 503) {
          // Database not configured, use empty array
          console.log('Database not configured for mutual friends, using empty array');
          setMutualFriends([]);
        }

        // Handle friendship status response
        if (friendshipStatusResponse.ok) {
          try {
            const friendshipStatusData = await friendshipStatusResponse.json();
            setFriendshipStatus(friendshipStatusData.status || 'none');
          } catch (parseError) {
            console.warn('Failed to parse friendship status response as JSON, using default status');
            setFriendshipStatus('none');
          }
        } else if (friendshipStatusResponse.status === 503) {
          // Database not configured, use default status
          console.log('Database not configured for friendship status, using default status');
          setFriendshipStatus('none');
        }
      } catch (apiError) {
        console.warn('API endpoints not available, using default values:', apiError.message);
        setMutualFriends([]);
        setFriendshipStatus('none');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!currentUserId || actionLoading) return;

    setActionLoading(true);
    try {
      const result = await UserApiService.sendFriendRequest(currentUserId, userId);
      if (result.success) {
        setFriendshipStatus('pending');
        alert('Friend request sent successfully!');
      }
    } catch (err) {
      console.error('Error sending friend request:', err);
      alert('Failed to send friend request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getUserInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const renderActionButtons = () => {
    // Don't show action buttons for own profile
    if (userId === currentUserId) {
      return (
        <div className="user-profile-actions">
          <button 
            className="action-button outline-button"
            onClick={() => navigate('/profile')}
          >
            Edit Profile
          </button>
        </div>
      );
    }

    return (
      <div className="user-profile-actions">
        {friendshipStatus === 'none' && (
          <button 
            className="action-button primary-button"
            onClick={handleSendFriendRequest}
            disabled={actionLoading}
          >
            {actionLoading ? 'Sending...' : 'Add Friend'}
          </button>
        )}
        {friendshipStatus === 'pending' && (
          <button className="action-button primary-button" disabled>
            Friend Request Sent
          </button>
        )}
        {mutualFriends.length > 0 && (
          <button className="action-button mutual-friends-button">
            {mutualFriends.length} Mutual Friend{mutualFriends.length !== 1 ? 's' : ''}
          </button>
        )}
      </div>
    );
  };

  const renderMutualFriends = () => {
    if (userId === currentUserId || mutualFriends.length === 0) {
      return null;
    }

    return (
      <div className="profile-section">
        <h3 className="section-title">
          Mutual Friends ({mutualFriends.length})
        </h3>
        <div className="mutual-friends-list">
          {mutualFriends.slice(0, 6).map((friend) => (
            <Link 
              key={friend.id} 
              to={`/user/${friend.id}`} 
              className="mutual-friend-card"
            >
              <div className="mutual-friend-avatar">
                {getUserInitials(friend.name)}
              </div>
              <div className="mutual-friend-info">
                <p className="mutual-friend-name">{friend.name}</p>
              </div>
            </Link>
          ))}
        </div>
        {mutualFriends.length > 6 && (
          <p className="mutual-friends-count">
            and {mutualFriends.length - 6} more mutual friend{mutualFriends.length - 6 !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="user-profile-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile-container">
        <div className="error-state">
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={fetchUserProfile}>
            Try Again
          </button>
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-profile-container">
        <div className="error-state">
          <p className="error-message">User not found</p>
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <div className="user-profile-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1 className="user-profile-title">
          {userId === currentUserId ? 'Your Profile' : `${user.name}'s Profile`}
        </h1>
      </div>

      <div className="user-profile-content">
        {/* Left Column - Profile Picture and Actions */}
        <div className="user-profile-left">
          <div className="user-profile-avatar">
            {getUserInitials(user.name)}
          </div>
          <h2 className="user-profile-name">{user.name}</h2>
          <p className="user-profile-email">{user.email}</p>
          <p className="member-since">
            Member since {formatDate(user.createdAt)}
          </p>
          {renderActionButtons()}
        </div>

        {/* Right Column - Detailed Information */}
        <div className="user-profile-right">
          {/* Bio Section */}
          <div className="profile-section">
            <h3 className="section-title">About</h3>
            <p className={`bio-text ${!user.bio ? 'bio-empty' : ''}`}>
              {user.bio || 'No bio available.'}
            </p>
          </div>

          {/* Contact Details Section */}
          {user.contactDetails && Object.keys(user.contactDetails).length > 0 && (
            <div className="profile-section">
              <h3 className="section-title">Contact Information</h3>
              <div className="contact-details">
                {Object.entries(user.contactDetails).map(([key, value]) => (
                  <div key={key} className="contact-item">
                    <span className="contact-key">{key}:</span>
                    <span className="contact-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mutual Friends Section */}
          {renderMutualFriends()}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;