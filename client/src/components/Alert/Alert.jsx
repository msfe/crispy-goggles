import React, { useEffect, useState } from 'react';
import './Alert.css';

const Alert = ({ 
  id,
  type = 'info', 
  message, 
  duration = 5000, 
  dismissible = true, 
  onDismiss 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss(id);
    }, 300); // Match animation duration
  };

  const getIcon = () => {
    switch (type) {
      case 'info':
        return '🛈'; // Info symbol
      case 'warning':
        return '⚠️'; // Warning symbol
      case 'error':
        return '❌'; // Error symbol
      case 'success':
        return '✅'; // Success symbol
      default:
        return '🛈';
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleDismiss();
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`alert alert--${type} ${isExiting ? 'alert--exiting' : ''}`}
      role="alert"
      aria-live="polite"
      tabIndex={dismissible ? 0 : -1}
      onKeyDown={dismissible ? handleKeyDown : undefined}
    >
      <div className="alert__icon">
        {getIcon()}
      </div>
      <div className="alert__content">
        <p className="alert__message">{message}</p>
      </div>
      {dismissible && (
        <button
          className="alert__dismiss"
          onClick={handleDismiss}
          aria-label="Dismiss alert"
          type="button"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;