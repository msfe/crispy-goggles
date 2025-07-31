import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";

const Header = ({ onNotificationsToggle, notificationCount }) => {
  const { instance } = useMsal();
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    instance.logoutRedirect({
      postLogoutRedirectUri: "/",
      mainWindowRedirectUri: "/",
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Check if we're on the Friends page to handle friend search
    if (location.pathname === '/friends') {
      // Navigate to friend search results
      navigate(`/friends/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      // Default search functionality for groups/events
      console.log("Search query:", searchQuery);
    }
  };

  return (
    <header className="dashboard-header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo">
          <Link to="/" className="logo-link">
            <span className="logo-text">Crispy Goggles</span>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="header-nav">
          <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}>
            Profile
          </Link>
          <Link to="/friends" className={`nav-link ${location.pathname === '/friends' ? 'active' : ''}`}>
            Friends
          </Link>
          <Link to="/groups" className={`nav-link ${location.pathname === '/groups' ? 'active' : ''}`}>
            Groups
          </Link>
          <Link to="/events" className={`nav-link ${location.pathname === '/events' ? 'active' : ''}`}>
            Events
          </Link>
          <Link to="/settings" className={`nav-link ${location.pathname === '/settings' ? 'active' : ''}`}>
            Settings
          </Link>
        </nav>

        {/* Search Bar */}
        <form className="header-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder={location.pathname === '/friends' ? "Search for people..." : "Search groups or events..."}
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
