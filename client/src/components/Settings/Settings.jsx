import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { UserApiService } from '../../services/apiService';
import { useAlert } from '../Alert';
import './Settings.css';

const Settings = () => {
  const { accounts } = useMsal();
  const account = accounts[0];
  const { showInfo, showError } = useAlert();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [privacySettings, setPrivacySettings] = useState({
    profilePictureVisibility: 'friends',
    bioVisibility: 'friends',
    contactDetailsVisibility: 'friends',
    friendsListVisibility: 'friends',
    userDiscoverability: 'friends_of_friends'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    initializeUser();
  }, [account]);

  useEffect(() => {
    if (currentUserId) {
      loadPrivacySettings();
    }
  }, [currentUserId]);

  const initializeUser = async () => {
    try {
      const userId = await UserApiService.initializeUser(account);
      setCurrentUserId(userId);
    } catch (err) {
      console.error('Error initializing user:', err);
      showError('Failed to initialize user. Please try again.');
    }
  };

  const loadPrivacySettings = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/users/${currentUserId}/privacy-settings`);
      if (response.ok) {
        const settings = await response.json();
        setPrivacySettings(settings);
      } else if (response.status === 503) {
        // Database not configured - show info message but don't treat as error
        showInfo('Database not configured. Using default settings.');
      } else {
        showError('Failed to load privacy settings');
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      showError('Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (setting, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await fetch(`/api/users/${currentUserId}/privacy-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(privacySettings),
      });

      if (response.ok) {
        showInfo('Privacy settings saved successfully!');
      } else if (response.status === 503) {
        // Database not configured - show warning but don't treat as error
        showError('Database not configured. Settings could not be saved.');
      } else {
        showError('Failed to save privacy settings');
      }
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      showError('Failed to save privacy settings');
    } finally {
      setSaving(false);
    }
  };

  const renderSettingCard = (setting, title, description, options) => (
    <div className="setting-card" key={setting}>
      <h3 className="setting-title">{title}</h3>
      <div className="setting-content">
        <p className="setting-description">{description}</p>
        <div className="setting-options">
          {options.map(option => (
            <label key={option.value} className="setting-option">
              <input
                type="radio"
                name={setting}
                value={option.value}
                checked={privacySettings[setting] === option.value}
                onChange={(e) => handleSettingChange(setting, e.target.value)}
                className="setting-radio"
              />
              <span className="setting-option-content">
                <span className="setting-option-label">{option.label}</span>
                <span className="setting-option-description">{option.description}</span>
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="settings-container">
        <div className="settings-loading">
          <div className="loading-spinner" role="status" aria-label="Loading settings"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  // Show loading state while initializing user
  if (!currentUserId) {
    return (
      <div className="settings-container">
        <div className="settings-loading">
          <div className="loading-spinner" role="status" aria-label="Initializing user"></div>
          <p>Initializing user...</p>
        </div>
      </div>
    );
  }

  const visibilityOptions = [
    {
      value: 'friends',
      label: 'Friends',
      description: 'Only your friends can see this'
    },
    {
      value: 'friends_of_friends',
      label: 'Friends of Friends',
      description: 'Your friends and their friends can see this'
    },
    {
      value: 'all_users',
      label: 'All Users',
      description: 'Anyone on the platform can see this'
    }
  ];

  const discoverabilityOptions = [
    {
      value: 'none',
      label: 'None',
      description: 'Your profile won\'t appear in search results'
    },
    {
      value: 'friends_of_friends',
      label: 'Friends of Friends',
      description: 'Only friends of your friends can find you'
    },
    {
      value: 'all_users',
      label: 'All Users',
      description: 'Anyone can find your profile in search'
    }
  ];

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1 className="settings-page-title">Settings</h1>
        <p className="settings-page-description">
          Manage your privacy preferences and control who can see your information.
        </p>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h2 className="section-title">Privacy Settings</h2>
          <p className="section-description">
            Control who can see different parts of your profile and how discoverable you are on the platform.
          </p>

          <div className="settings-grid">
            {renderSettingCard(
              'profilePictureVisibility',
              'Profile Picture Visibility',
              'Choose who can see your profile picture',
              visibilityOptions
            )}

            {renderSettingCard(
              'bioVisibility',
              'Bio Visibility',
              'Choose who can see your profile bio and description',
              visibilityOptions
            )}

            {renderSettingCard(
              'contactDetailsVisibility',
              'Contact Details Visibility',
              'Choose who can see your contact information',
              visibilityOptions
            )}

            {renderSettingCard(
              'friendsListVisibility',
              'Friends List Visibility',
              'Choose who can see your friends list',
              visibilityOptions
            )}

            {renderSettingCard(
              'userDiscoverability',
              'Profile Discoverability',
              'Choose who can find your profile in search results',
              discoverabilityOptions
            )}
          </div>
        </div>

        <div className="settings-actions">
          <button
            onClick={handleSave}
            disabled={saving}
            className="save-button"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;