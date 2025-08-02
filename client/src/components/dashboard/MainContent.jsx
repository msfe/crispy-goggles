import React from 'react';
import { useAlert } from '../Alert';
import QuickActions from './QuickActions';
import PersonalizedFeed from './PersonalizedFeed';
import DiscoverySection from './DiscoverySection';

const MainContent = ({ data, user }) => {
  const { showInfo, showWarning } = useAlert();

  const handleQuickAction = (actionId) => {
    console.log('Quick action triggered:', actionId);
    // In a real app, this would navigate to the appropriate page or open a modal
    switch (actionId) {
      case 'create-post':
        // Navigate to post creation or open modal
        showInfo('Create Post feature would open here');
        break;
      case 'invite-friends':
        // Navigate to friend invitation page
        showInfo('Invite Friends feature would open here');
        break;
      case 'join-group':
        // Navigate to groups page via top navigation
        showWarning('Navigate to Groups page via top navigation');
        break;
      case 'create-event':
        // Navigate to event creation
        showInfo('Create Event feature would open here');
        break;
      default:
        break;
    }
  };

  const handleJoinAction = (type, id) => {
    console.log(`Joining ${type} with id:`, id);
    showInfo(`${type === 'group' ? 'Join Group' : 'RSVP Event'} feature would execute here`);
  };

  const handleExplore = (type) => {
    console.log('Exploring:', type);
    // Navigation would be handled by top navigation bar
    showWarning(`Explore ${type} via top navigation`);
  };

  return (
    <main className="main-content">
      {/* Dashboard Home Content - No Tabs */}
      <div className="dashboard-container">
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
    </main>
  );
};

export default MainContent;