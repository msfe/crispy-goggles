import React from 'react';

const QuickActions = ({ onAction }) => {
  const quickActions = [
    {
      id: 'create-post',
      label: 'Create Post',
      icon: '✏️',
      description: 'Share your thoughts with groups',
      primary: true
    },
    {
      id: 'invite-friends',
      label: 'Invite Friends',
      icon: '👥',
      description: 'Connect with people you know',
      primary: false
    },
    {
      id: 'join-group',
      label: 'Join Group',
      icon: '📋',
      description: 'Discover new communities',
      primary: false
    },
    {
      id: 'create-event',
      label: 'Create Event',
      icon: '📅',
      description: 'Plan something amazing',
      primary: false
    }
  ];

  return (
    <section className="quick-actions">
      <h3>Quick Actions</h3>
      <div className="quick-actions-grid">
        {quickActions.map((action) => (
          <button
            key={action.id}
            className={`quick-action-card ${action.primary ? 'primary' : 'secondary'}`}
            onClick={() => onAction(action.id)}
          >
            <div className="action-icon">{action.icon}</div>
            <div className="action-content">
              <h4 className="action-label">{action.label}</h4>
              <p className="action-description">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;