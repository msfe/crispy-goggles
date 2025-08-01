import React, { useState } from 'react';
import { useAlert } from '../Alert/useAlert';

const EventForm = ({ event = null, onEventCreated, onCancel }) => {
  const isEditing = !!event;
  const { showError, showSuccess } = useAlert();

  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    location: event?.location || '',
    startDate: event?.startDate ? formatDateForInput(event.startDate) : '',
    endDate: event?.endDate ? formatDateForInput(event.endDate) : '',
    invitedUserIds: event?.invitedUserIds || [],
    invitedGroupIds: event?.invitedGroupIds || []
  });

  const [loading, setLoading] = useState(false);
  const [inviteInput, setInviteInput] = useState('');
  const [groupInviteInput, setGroupInviteInput] = useState('');

  function formatDateForInput(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddUserInvite = (e) => {
    e.preventDefault();
    if (inviteInput.trim()) {
      const userIdOrEmail = inviteInput.trim();
      if (!formData.invitedUserIds.includes(userIdOrEmail)) {
        setFormData(prev => ({
          ...prev,
          invitedUserIds: [...prev.invitedUserIds, userIdOrEmail]
        }));
      }
      setInviteInput('');
    }
  };

  const handleRemoveUserInvite = (userIdToRemove) => {
    setFormData(prev => ({
      ...prev,
      invitedUserIds: prev.invitedUserIds.filter(id => id !== userIdToRemove)
    }));
  };

  const handleAddGroupInvite = (e) => {
    e.preventDefault();
    if (groupInviteInput.trim()) {
      const groupId = groupInviteInput.trim();
      if (!formData.invitedGroupIds.includes(groupId)) {
        setFormData(prev => ({
          ...prev,
          invitedGroupIds: [...prev.invitedGroupIds, groupId]
        }));
      }
      setGroupInviteInput('');
    }
  };

  const handleRemoveGroupInvite = (groupIdToRemove) => {
    setFormData(prev => ({
      ...prev,
      invitedGroupIds: prev.invitedGroupIds.filter(id => id !== groupIdToRemove)
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.title.trim()) {
      errors.push('Event title is required');
    }

    if (!formData.startDate) {
      errors.push('Start date is required');
    }

    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      errors.push('End date cannot be before start date');
    }

    if (new Date(formData.startDate) < new Date()) {
      errors.push('Start date cannot be in the past');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      showError(errors.join('. '));
      return;
    }

    setLoading(true);

    try {
      // In real implementation, this would call the API
      const eventData = {
        ...formData,
        organizerId: 'current-user-123', // This would come from auth context
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (isEditing) {
        eventData.id = event.id;
        showSuccess('Event updated successfully!');
      } else {
        eventData.id = `event-${Date.now()}`;
        showSuccess('Event created successfully!');
      }

      onEventCreated?.(eventData);
    } catch (error) {
      showError(`Failed to ${isEditing ? 'update' : 'create'} event. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <h2>{isEditing ? 'Edit Event' : 'Create New Event'}</h2>

      <div className="form-group">
        <label htmlFor="title">Event Title *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter event title"
          required
          maxLength={100}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe your event..."
          rows={4}
          maxLength={500}
        />
      </div>

      <div className="form-group">
        <label htmlFor="location">Location</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          placeholder="Enter event location or 'Online'"
          maxLength={100}
        />
      </div>

      <div className="date-time-group">
        <div className="form-group">
          <label htmlFor="startDate">Start Date & Time *</label>
          <input
            type="datetime-local"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="endDate">End Date & Time</label>
          <input
            type="datetime-local"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="invitation-section">
        <h3>👥 Invite People</h3>
        
        <div className="form-group">
          <label htmlFor="inviteInput">Invite Users (by email or username)</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              id="inviteInput"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
              placeholder="Enter email or username"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleAddUserInvite}
              disabled={!inviteInput.trim()}
            >
              Add
            </button>
          </div>
        </div>

        {formData.invitedUserIds.length > 0 && (
          <div className="invitation-chips">
            {formData.invitedUserIds.map((userId) => (
              <div key={userId} className="invitation-chip">
                👤 {userId}
                <button
                  type="button"
                  onClick={() => handleRemoveUserInvite(userId)}
                  aria-label={`Remove ${userId}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="groupInviteInput">Invite Groups</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              id="groupInviteInput"
              value={groupInviteInput}
              onChange={(e) => setGroupInviteInput(e.target.value)}
              placeholder="Enter group name or ID"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleAddGroupInvite}
              disabled={!groupInviteInput.trim()}
            >
              Add
            </button>
          </div>
        </div>

        {formData.invitedGroupIds.length > 0 && (
          <div className="invitation-chips">
            {formData.invitedGroupIds.map((groupId) => (
              <div key={groupId} className="invitation-chip">
                👥 {groupId}
                <button
                  type="button"
                  onClick={() => handleRemoveGroupInvite(groupId)}
                  aria-label={`Remove ${groupId}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading
            ? (isEditing ? 'Updating...' : 'Creating...')
            : (isEditing ? 'Update Event' : 'Create Event')
          }
        </button>
      </div>
    </form>
  );
};

export default EventForm;