import React from 'react';
import QuickActions from './QuickActions';
import PersonalizedFeed from './PersonalizedFeed';
import DiscoverySection from './DiscoverySection';

const MainContent = ({ activeTab, setActiveTab, data, user }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'friends', label: 'Friend Requests', icon: '👥' },
    { id: 'groups', label: 'Groups', icon: '📋' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'activity', label: 'Recent Activity', icon: '📰' }
  ];

  const handleQuickAction = (actionId) => {
    console.log('Quick action triggered:', actionId);
    // In a real app, this would navigate to the appropriate page or open a modal
    switch (actionId) {
      case 'create-post':
        // Navigate to post creation or open modal
        alert('Create Post feature would open here');
        break;
      case 'invite-friends':
        // Navigate to friend invitation page
        alert('Invite Friends feature would open here');
        break;
      case 'join-group':
        setActiveTab('groups');
        break;
      case 'create-event':
        // Navigate to event creation
        alert('Create Event feature would open here');
        break;
      default:
        break;
    }
  };

  const handleJoinAction = (type, id) => {
    console.log(`Joining ${type} with id:`, id);
    alert(`${type === 'group' ? 'Join Group' : 'RSVP Event'} feature would execute here`);
  };

  const handleExplore = (type) => {
    console.log('Exploring:', type);
    if (type === 'groups') {
      setActiveTab('groups');
    } else if (type === 'events') {
      setActiveTab('events');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="tab-content">
            <div className="home-dashboard">
              <div className="dashboard-welcome">
                <h3>Welcome back, {user.name || 'User'}! 👋</h3>
                <p>Here's what's happening in your community today.</p>
              </div>
              
              <QuickActions onAction={handleQuickAction} />
              
              <div className="dashboard-main-content">
                <div className="dashboard-left">
                  <PersonalizedFeed data={data} user={user} />
                </div>
                <div className="dashboard-right">
                  <DiscoverySection onJoin={handleJoinAction} onExplore={handleExplore} />
                </div>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="tab-content">
            <h3>My Profile</h3>
            <p>Manage your profile details here.</p>
            <div className="profile-info">
              <p><strong>Name:</strong> {user.name || 'Not provided'}</p>
              <p><strong>Email:</strong> {user.username}</p>
              <p><strong>Bio:</strong> Tell us about yourself...</p>
            </div>
            <button className="primary-button">Edit Profile</button>
          </div>
        );
      
      case 'friends':
        return (
          <div className="tab-content">
            <h3>Friend Requests</h3>
            <p>Manage your friend requests here.</p>
            {data.friendRequests.length === 0 ? (
              <p className="empty-state">No pending friend requests</p>
            ) : (
              <div className="friend-requests-list">
                {data.friendRequests.map((request) => (
                  <div key={request.id} className="friend-request-item">
                    <div className="friend-info">
                      <div className="friend-avatar">{request.name ? request.name[0] : '?'}</div>
                      <div>
                        <h4>{request.name}</h4>
                        <p>{request.mutualFriends} mutual friends</p>
                      </div>
                    </div>
                    <div className="friend-actions">
                      <button className="accept-button">Accept</button>
                      <button className="reject-button">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'groups':
        return (
          <div className="tab-content">
            <h3>Groups</h3>
            <p>Stay updated with your groups.</p>
            <div className="groups-list">
              {data.groups.map((group) => (
                <div key={group.id} className="group-item">
                  <div className="group-info">
                    <h4>{group.name}</h4>
                    <p>{group.members} members</p>
                    <p className="group-activity">{group.recentActivity}</p>
                  </div>
                  <button className="secondary-button">View Group</button>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'events':
        return (
          <div className="tab-content">
            <h3>Events</h3>
            <p>Don't miss out on upcoming events!</p>
            <div className="events-list">
              {data.events.map((event) => (
                <div key={event.id} className="event-item">
                  <div className="event-info">
                    <h4>{event.name}</h4>
                    <p>{event.date}</p>
                    <p>{event.attendees} attendees</p>
                  </div>
                  <div className="event-rsvp">
                    <span className={`rsvp-status ${event.rsvp}`}>
                      {event.rsvp === 'yes' ? '✓ Going' : 
                       event.rsvp === 'maybe' ? '? Maybe' : '⏳ Pending'}
                    </span>
                    <button className="secondary-button">View Event</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'activity':
        return (
          <div className="tab-content">
            <h3>Recent Activity Feed</h3>
            <p>Latest posts and comments from your groups and events.</p>
            <div className="activity-feed">
              <div className="activity-item">
                <p><strong>Emma</strong> posted in <strong>Book Club</strong></p>
                <p className="activity-time">2 hours ago</p>
              </div>
              <div className="activity-item">
                <p><strong>Mike</strong> commented on your post in <strong>Tech Meetup</strong></p>
                <p className="activity-time">4 hours ago</p>
              </div>
              <div className="activity-item">
                <p><strong>Sarah</strong> uploaded photos to <strong>Hiking Enthusiasts</strong></p>
                <p className="activity-time">1 day ago</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <main className="main-content">
      {/* Tab Navigation */}
      <div className="tab-navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content-container">
        {renderTabContent()}
      </div>
    </main>
  );
};

export default MainContent;