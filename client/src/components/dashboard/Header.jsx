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
          <a href="/" className="logo-link">
            <span className="logo-text">Crispy Goggles</span>
          </a>
        </div>

        {/* Navigation Menu */}
        <nav className="header-nav">
          <Link to="/profile" className="nav-link">Profile</Link>
          <Link to="/friends" className="nav-link">Friends</Link>
          <Link to="/groups" className="nav-link">Groups</Link>
          <Link to="/events" className="nav-link">Events</Link>
          <Link to="/settings" className="nav-link">Settings</Link>
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