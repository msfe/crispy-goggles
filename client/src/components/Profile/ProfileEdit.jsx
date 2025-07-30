import React, { useState } from 'react';

const ProfileEdit = ({ profile, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    bio: profile?.bio || '',
    contactDetails: profile?.contactDetails || {}
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      contactDetails: {
        ...prev.contactDetails,
        [key]: value
      }
    }));
  };

  const addContactField = () => {
    const key = prompt('Enter contact field name (e.g., "phone", "website"):');
    if (key && key.trim()) {
      handleContactChange(key.trim(), '');
    }
  };

  const removeContactField = (key) => {
    setFormData(prev => {
      const newContactDetails = { ...prev.contactDetails };
      delete newContactDetails[key];
      return {
        ...prev,
        contactDetails: newContactDetails
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const result = await onSave(formData);
      if (!result.success) {
        setError(result.error || 'Failed to save profile');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-edit">
      <form onSubmit={handleSubmit} className="profile-form">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="form-input"
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Tell others about yourself..."
            rows={4}
          />
          <small className="form-help">
            This information will be visible to your friends.
          </small>
        </div>

        <div className="form-group">
          <label>Contact Details (Optional)</label>
          <div className="contact-fields">
            {Object.entries(formData.contactDetails).map(([key, value]) => (
              <div key={key} className="contact-field-row">
                <input
                  type="text"
                  value={key}
                  disabled
                  className="contact-key-input"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleContactChange(key, e.target.value)}
                  className="contact-value-input"
                  placeholder="Enter value"
                />
                <button
                  type="button"
                  onClick={() => removeContactField(key)}
                  className="remove-contact-button"
                  title="Remove field"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addContactField}
              className="add-contact-button"
            >
              + Add Contact Field
            </button>
          </div>
          <small className="form-help">
            Add contact information like phone, website, etc. This will only be visible to your friends.
          </small>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-button"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="save-button"
            disabled={saving || !formData.name.trim()}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;