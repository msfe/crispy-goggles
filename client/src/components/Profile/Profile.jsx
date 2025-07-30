import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import ProfileView from './ProfileView';
import ProfileEdit from './ProfileEdit';
import './Profile.css';

const Profile = () => {
  const { accounts } = useMsal();
  const account = accounts[0];
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for development when no Azure account
  const mockProfile = {
    id: 'mock-user-id-123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'A passionate developer who loves creating innovative solutions and connecting with like-minded people.',
    contactDetails: {},
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  useEffect(() => {
    fetchProfile();
  }, [account]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!account) {
        // Use mock data in development
        setProfile(mockProfile);
        setLoading(false);
        return;
      }

      // Validate and sanitize homeAccountId
      const sanitizedHomeAccountId = validateAndSanitizeHomeAccountId(account.homeAccountId);
      if (!sanitizedHomeAccountId) {
        throw new Error('Invalid homeAccountId');
      }

      // Try to fetch user profile from backend
      const response = await fetch(`/api/users/azure/${sanitizedHomeAccountId}`);
      
      if (response.ok) {
        const userData = await response.json();
        setProfile(userData);
      } else if (response.status === 404) {
        // User doesn't exist in database yet, create with Azure info
        const newUser = {
          azureId: account.homeAccountId,
          email: account.username,
          name: account.name || account.username.split('@')[0],
          bio: ''
        };
        
        const createResponse = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newUser)
        });
        
        if (createResponse.ok) {
          const createdUser = await createResponse.json();
          setProfile(createdUser);
        } else {
          throw new Error('Failed to create user profile');
        }
      } else {
        throw new Error('Failed to fetch profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message);
      // Fallback to basic Azure info
      if (account) {
        setProfile({
          name: account.name || account.username.split('@')[0],
          email: account.username,
          bio: ''
        });
      } else {
        setProfile(mockProfile);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedProfile) => {
    try {
      if (!profile.id) {
        throw new Error('Cannot update profile without ID');
      }

      // In development mode without a real backend, simulate a successful save
      if (!account && profile.id === 'mock-user-id-123') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const savedProfile = {
          ...profile,
          ...updatedProfile,
          updatedAt: new Date().toISOString()
        };
        
        setProfile(savedProfile);
        setIsEditing(false);
        return { success: true };
      }

      const response = await fetch(`/api/users/${profile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProfile)
      });

      if (response.ok) {
        const savedProfile = await response.json();
        setProfile(savedProfile);
        setIsEditing(false);
        return { success: true };
      } else {
        throw new Error('Failed to save profile');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      return { success: false, error: err.message };
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="profile-container">
        <div className="profile-error">
          <h3>Error Loading Profile</h3>
          <p>{error}</p>
          <button onClick={fetchProfile} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="edit-profile-button"
          >
            Edit Profile
          </button>
        )}
      </div>
      
      {isEditing ? (
        <ProfileEdit 
          profile={profile}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <ProfileView profile={profile} />
      )}
    </div>
  );
};

export default Profile;