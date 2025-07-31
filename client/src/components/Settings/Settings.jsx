import React, { useState, useEffect } from 'react';
import './Settings.css';

const Settings = () => {
  const [privacySettings, setPrivacySettings] = useState({
    profilePictureVisibility: 'friends',
    bioVisibility: 'friends',
    contactDetailsVisibility: 'friends',
    friendsListVisibility: 'friends',
    userDiscoverability: 'friends_of_friends'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Mock user ID for development - in production this would come from auth context
  const mockUserId = 'user-123-abc';

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      setLoading(true);
      
      // Mock API call for development
      if (import.meta.env.DEV) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/users/${mockUserId}/privacy-settings`);
      if (response.ok) {
        const settings = await response.json();
        setPrivacySettings(settings);
      } else {
        setMessage({ type: 'error', text: 'Failed to load privacy settings' });
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      setMessage({ type: 'error', text: 'Failed to load privacy settings' });
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
      setMessage({ type: '', text: '' });

      // Mock API call for development
      if (import.meta.env.DEV) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMessage({ type: 'success', text: 'Privacy settings saved successfully!' });
        setSaving(false);
        return;
      }

      const response = await fetch(`/api/users/${mockUserId}/privacy-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(privacySettings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Privacy settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save privacy settings' });
      }
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      setMessage({ type: 'error', text: 'Failed to save privacy settings' });
    } finally {
      setSaving(false);
    }
  };

  const renderSettingCard = (setting, title, description, options) => (
    <div className="setting-card" key={setting}>
      <div className="setting-header">
        <h3 className="setting-title">{title}</h3>
        <p className="setting-description">{description}</p>
      </div>
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
            <span className="setting-option-label">{option.label}</span>
            <span className="setting-option-description">{option.description}</span>
          </label>
        ))}
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

      {message.text && (
        <div className={`settings-message ${message.type}`}>
          {message.text}
        </div>
      )}

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