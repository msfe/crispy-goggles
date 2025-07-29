import React from 'react';

const Notifications = ({ notifications, isVisible, onClose }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'friend_request':
        return '👥';
      case 'group_invitation':
        return '📋';
      case 'event_update':
        return '📅';
      case 'comment':
        return '💬';
      default:
        return '🔔';
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div className="notifications-overlay" onClick={onClose}></div>
      
      {/* Notifications Panel */}
      <div className="notifications-panel">
        <div className="notifications-header">
          <h3>Notifications</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="notifications-content">
          {notifications.length === 0 ? (
            <div className="no-notifications">
              <p>No new notifications</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div key={notification.id} className="notification-item">
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="notifications-footer">
          <Link to="/notifications" className="view-all-link">View All Notifications</Link>
        </div>
      </div>
    </>
  );
};

export default Notifications;