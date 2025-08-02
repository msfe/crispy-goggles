import React, { createContext, useContext, useState, useCallback } from 'react';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const addAlert = useCallback((alert) => {
    const id = Date.now() + Math.random();
    const newAlert = {
      id,
      type: 'info',
      duration: 5000,
      dismissible: true,
      ...alert,
    };

    setAlerts(prev => [...prev, newAlert]);
    return id;
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Convenience methods for different alert types
  const showInfo = useCallback((message, options = {}) => {
    return addAlert({ ...options, type: 'info', message });
  }, [addAlert]);

  const showWarning = useCallback((message, options = {}) => {
    return addAlert({ ...options, type: 'warning', message });
  }, [addAlert]);

  const showError = useCallback((message, options = {}) => {
    return addAlert({ ...options, type: 'error', message });
  }, [addAlert]);

  const value = {
    alerts,
    addAlert,
    removeAlert,
    clearAllAlerts,
    showInfo,
    showWarning,
    showError,
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};

export default AlertProvider;