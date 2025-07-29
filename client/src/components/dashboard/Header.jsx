import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';

const Header = ({ onNotificationsToggle, notificationCount }) => {
  const { instance } = useMsal();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    instance.logoutRedirect({
      postLogoutRedirectUri: "/",
      mainWindowRedirectUri: "/",
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Placeholder for search functionality
    console.log('Search query:', searchQuery);
  };

  return (
    <header className="dashboard-header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo">
          <a href="#" className="logo-link">
            <span className="logo-text">Crispy Goggles</span>
          </a>
        </div>

        {/* Navigation Menu */}
        <nav className="header-nav">
          <a href="#profile" className="nav-link">Profile</a>
          <a href="#friends" className="nav-link">Friends</a>
          <a href="#groups" className="nav-link">Groups</a>
          <a href="#events" className="nav-link">Events</a>
          <a href="#settings" className="nav-link">Settings</a>
        </nav>

        {/* Search Bar */}
        <form className="header-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search groups or events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            <span className="search-icon">🔍</span>
          </button>
        </form>

        {/* Right side controls */}
        <div className="header-controls">
          {/* Notifications */}
          <button 
            className="notifications-button"
            onClick={onNotificationsToggle}
          >
            <span className="notification-icon">🔔</span>
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </button>

          {/* Logout */}
          <button className="logout-button" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;