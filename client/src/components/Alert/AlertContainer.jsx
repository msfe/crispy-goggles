import React from 'react';
import { useAlert } from './AlertProvider';
import Alert from './Alert';
import './AlertContainer.css';

const AlertContainer = () => {
  const { alerts, removeAlert } = useAlert();

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="alert-container" aria-live="polite" aria-label="Notifications">
      {alerts.map(alert => (
        <Alert
          key={alert.id}
          id={alert.id}
          type={alert.type}
          message={alert.message}
          duration={alert.duration}
          dismissible={alert.dismissible}
          onDismiss={removeAlert}
        />
      ))}
    </div>
  );
};

export default AlertContainer;