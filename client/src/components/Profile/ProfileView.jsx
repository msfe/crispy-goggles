import React from 'react';

const ProfileView = ({ profile }) => {
  if (!profile) {
    return <div className="profile-view">No profile data available</div>;
  }

  return (
    <div className="profile-view">
      <div className="profile-avatar">
        <div className="avatar-placeholder">
          {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>
      
      <div className="profile-details">
        <div className="profile-field">
          <label>Name</label>
          <div className="field-value">
            {profile.name || 'Not provided'}
          </div>
        </div>
        
        <div className="profile-field">
          <label>Email</label>
          <div className="field-value">
            {profile.email || 'Not provided'}
          </div>
        </div>
        
        <div className="profile-field">
          <label>Bio</label>
          <div className="field-value bio">
            {profile.bio || 'No bio available. Click "Edit Profile" to add one!'}
          </div>
        </div>

        {profile.contactDetails && Object.keys(profile.contactDetails).length > 0 && (
          <div className="profile-field">
            <label>Contact Details</label>
            <div className="field-value contact-details">
              {Object.entries(profile.contactDetails).map(([key, value]) => (
                <div key={key} className="contact-item">
                  <span className="contact-key">{key}:</span>
                  <span className="contact-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="profile-metadata">
          <small className="text-muted">
            Member since {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
          </small>
          {profile.updatedAt && profile.updatedAt !== profile.createdAt && (
            <small className="text-muted">
              • Last updated {new Date(profile.updatedAt).toLocaleDateString()}
            </small>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;