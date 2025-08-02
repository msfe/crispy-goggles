import React, { useState, useEffect } from 'react';
import { useAlert } from '../Alert/AlertProvider';
import { GroupApiService } from '../../services/apiService';
import './Groups.css';

/**
 * Groups Component - Manages group creation, discovery, and membership
 */
const Groups = ({ currentUserId }) => {
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');
  const [searchTags, setSearchTags] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: '',
    tags: '',
    privacy: 'public'
  });

  const { showAlert } = useAlert();

  // Load initial data
  useEffect(() => {
    loadData();
  }, [currentUserId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [publicGroups, myGroups] = await Promise.all([
        GroupApiService.getPublicGroups(currentUserId),
        GroupApiService.getUserGroups(currentUserId)
      ]);
      
      setGroups(publicGroups);
      setUserGroups(myGroups);
    } catch (error) {
      console.error('Error loading groups data:', error);
      if (showAlert) {
        showAlert('Failed to load groups data', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTags.trim()) {
      // If no search tags, reload all public groups
      try {
        const publicGroups = await GroupApiService.getPublicGroups(currentUserId);
        setGroups(publicGroups);
      } catch (error) {
        if (showAlert) {
          showAlert('Failed to load groups', 'error');
        }
      }
      return;
    }

    try {
      setLoading(true);
      const tagsArray = searchTags.split(',').map(tag => tag.trim()).filter(tag => tag);
      const searchResults = await GroupApiService.searchByTags(tagsArray, currentUserId);
      setGroups(searchResults);
      showAlert(`Found ${searchResults.length} groups matching your search`, 'info');
    } catch (error) {
      console.error('Error searching groups:', error);
      if (showAlert) {
        showAlert('Failed to search groups', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    
    if (!createFormData.name.trim() || !createFormData.description.trim()) {
      showAlert('Please fill in all required fields', 'error');
      return;
    }

    try {
      const groupData = {
        ...createFormData,
        tags: createFormData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        adminIds: [currentUserId]
      };

      const result = await GroupApiService.createGroup(groupData, currentUserId);
      
      if (result.success) {
        if (showAlert) {
          showAlert(result.message, 'success');
        }
        setShowCreateForm(false);
        setCreateFormData({ name: '', description: '', tags: '', privacy: 'public' });
        loadData(); // Reload data to show new group
      }
    } catch (error) {
      console.error('Error creating group:', error);
      if (showAlert) {
        showAlert(error.message || 'Failed to create group', 'error');
      }
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const result = await GroupApiService.applyForMembership(groupId, currentUserId);
      
      if (result.success) {
        if (showAlert) {
          showAlert(result.message, 'success');
        }
        loadData(); // Reload to update group status
      }
    } catch (error) {
      console.error('Error joining group:', error);
      if (showAlert) {
        showAlert(error.message || 'Failed to join group', 'error');
      }
    }
  };

  const isUserMemberOrAdmin = (group) => {
    return group.memberIds?.includes(currentUserId) || 
           group.adminIds?.includes(currentUserId);
  };

  const hasUserApplied = (group) => {
    return group.membershipRequests?.includes(currentUserId);
  };

  const renderGroupCard = (group, isUserGroup = false) => (
    <div key={group.id} className="group-card">
      <div className="group-header">
        <h3 className="group-name">{group.name}</h3>
        <span className={`group-privacy ${group.isPublic ? 'public' : 'private'}`}>
          {group.isPublic ? 'Public' : 'Private'}
        </span>
      </div>
      
      <p className="group-description">{group.description}</p>
      
      <div className="group-tags">
        {group.tags?.map((tag, index) => (
          <span key={index} className="tag">{tag}</span>
        ))}
      </div>
      
      <div className="group-stats">
        <span className="member-count">
          {group.memberIds?.length || 0} members
        </span>
        <span className="created-date">
          Created {new Date(group.createdAt).toLocaleDateString()}
        </span>
      </div>
      
      {!isUserGroup && (
        <div className="group-actions">
          {isUserMemberOrAdmin(group) ? (
            <span className="status-badge member">Member</span>
          ) : hasUserApplied(group) ? (
            <span className="status-badge pending">Request Pending</span>
          ) : (
            <button 
              className="btn-join"
              onClick={() => handleJoinGroup(group.id)}
            >
              Join Group
            </button>
          )}
        </div>
      )}
      
      {isUserGroup && group.adminIds?.includes(currentUserId) && (
        <div className="group-admin-badge">
          <span className="status-badge admin">Admin</span>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="groups-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="groups-container">
      <div className="groups-header">
        <h1>Groups</h1>
        <button 
          className="btn-create-group"
          onClick={() => setShowCreateForm(true)}
        >
          Create Group
        </button>
      </div>

      <div className="groups-tabs">
        <button 
          className={`tab ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={() => setActiveTab('discover')}
        >
          Discover Groups
        </button>
        <button 
          className={`tab ${activeTab === 'mygroups' ? 'active' : ''}`}
          onClick={() => setActiveTab('mygroups')}
        >
          My Groups ({userGroups.length})
        </button>
      </div>

      {activeTab === 'discover' && (
        <div className="discover-section">
          <div className="search-section">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Search by tags (e.g., technology, meetup, stockholm)"
                value={searchTags}
                onChange={(e) => setSearchTags(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="search-input"
              />
              <button onClick={handleSearch} className="btn-search">
                Search
              </button>
            </div>
            <p className="search-hint">
              Separate multiple tags with commas
            </p>
          </div>

          <div className="groups-grid">
            {groups.length === 0 ? (
              <div className="empty-state">
                <p>No groups found. Try different search terms or create a new group.</p>
              </div>
            ) : (
              groups.map(group => renderGroupCard(group))
            )}
          </div>
        </div>
      )}

      {activeTab === 'mygroups' && (
        <div className="my-groups-section">
          <div className="groups-grid">
            {userGroups.length === 0 ? (
              <div className="empty-state">
                <p>You haven't joined any groups yet. Discover and join groups to get started!</p>
              </div>
            ) : (
              userGroups.map(group => renderGroupCard(group, true))
            )}
          </div>
        </div>
      )}

      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Group</h2>
              <button 
                className="modal-close"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateGroup} className="create-group-form">
              <div className="form-group">
                <label htmlFor="groupName">Group Name *</label>
                <input
                  id="groupName"
                  type="text"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter group name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="groupDescription">Description *</label>
                <textarea
                  id="groupDescription"
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your group"
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="groupTags">Tags</label>
                <input
                  id="groupTags"
                  type="text"
                  value={createFormData.tags}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="technology, meetup, stockholm (separate with commas)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="groupPrivacy">Privacy</label>
                <select
                  id="groupPrivacy"
                  value={createFormData.privacy}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, privacy: e.target.value }))}
                >
                  <option value="public">Public - Anyone can find and join</option>
                  <option value="private">Private - Members must be approved</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateForm(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-create">
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;