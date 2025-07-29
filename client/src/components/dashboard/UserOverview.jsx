import React from 'react';

const UserOverview = ({ user, stats }) => {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <section className="user-overview">
      <div className="user-overview-container">
        {/* Profile Picture */}
        <div className="profile-picture">
          <div className="profile-pic-placeholder">
            {getInitials(user.name)}
          </div>
        </div>

        {/* Welcome Message */}
        <div className="welcome-section">
          <h1 className="welcome-message">
            Welcome back, {user.name || 'User'}!
          </h1>
          <p className="welcome-subtitle">Ready to connect and engage?</p>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-number">{stats.friends}</span>
            <span className="stat-label">Friends</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">{stats.groups}</span>
            <span className="stat-label">Groups</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">{stats.upcomingEvents}</span>
            <span className="stat-label">Upcoming Events</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserOverview;