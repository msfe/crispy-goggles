import React, { useState, useEffect } from 'react';

const DatabaseStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDatabaseStatus = async () => {
      try {
        setLoading(true);
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const response = await fetch(`${API_BASE_URL}/database/status`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setStatus(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setStatus(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDatabaseStatus();
  }, []);

  if (loading) {
    return (
      <div className="database-status loading">
        <h3>Database Status</h3>
        <p>Checking database connection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="database-status error">
        <h3>Database Status</h3>
        <p className="error-message">Error: {error}</p>
        <p>Cannot connect to backend server.</p>
      </div>
    );
  }

  return (
    <div className={`database-status ${status?.configured ? 'configured' : 'not-configured'}`}>
      <h3>Database Status</h3>
      
      <div className="status-info">
        <div className="status-item">
          <strong>Configured:</strong> 
          <span className={status?.configured ? 'status-yes' : 'status-no'}>
            {status?.configured ? ' ✅ Yes' : ' ❌ No'}
          </span>
        </div>
        
        <div className="status-item">
          <strong>Connection:</strong> 
          <span className={status?.connection?.success ? 'status-yes' : 'status-no'}>
            {status?.connection?.success ? ' ✅ Connected' : ' ❌ Not Connected'}
          </span>
        </div>

        {status?.config && (
          <div className="config-info">
            <h4>Configuration:</h4>
            <div className="config-item">
              <strong>Endpoint:</strong> {status.config.endpoint}
            </div>
            <div className="config-item">
              <strong>Database:</strong> {status.config.database}
            </div>
            <div className="config-item">
              <strong>Has Key:</strong> 
              <span className={status.config.hasKey ? 'status-yes' : 'status-no'}>
                {status.config.hasKey ? ' ✅ Yes' : ' ❌ No'}
              </span>
            </div>
          </div>
        )}

        {status?.connection?.error && (
          <div className="error-details">
            <strong>Connection Error:</strong> {status.connection.error}
          </div>
        )}

        <div className="help-message">
          <p>{status?.message}</p>
        </div>
      </div>

      <style jsx>{`
        .database-status {
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border: 2px solid;
        }

        .database-status.configured {
          border-color: #4ecca3;
          background-color: #f0fdf9;
        }

        .database-status.not-configured {
          border-color: #f59e0b;
          background-color: #fefbf0;
        }

        .database-status.error {
          border-color: #ef4444;
          background-color: #fef2f2;
        }

        .database-status.loading {
          border-color: #a861ba;
          background-color: #faf5ff;
        }

        .database-status h3 {
          margin-top: 0;
          color: #333333;
        }

        .status-item, .config-item {
          margin: 8px 0;
          font-size: 14px;
        }

        .status-yes {
          color: #059669;
          font-weight: bold;
        }

        .status-no {
          color: #dc2626;
          font-weight: bold;
        }

        .config-info {
          margin-top: 15px;
          padding: 10px;
          background-color: rgba(168, 97, 186, 0.1);
          border-radius: 4px;
        }

        .config-info h4 {
          margin: 0 0 10px 0;
          color: #a861ba;
        }

        .error-details {
          margin-top: 10px;
          padding: 10px;
          background-color: rgba(239, 68, 68, 0.1);
          border-radius: 4px;
          color: #dc2626;
        }

        .error-message {
          color: #dc2626;
          font-weight: bold;
        }

        .help-message {
          margin-top: 15px;
          padding: 10px;
          background-color: rgba(78, 204, 163, 0.1);
          border-radius: 4px;
          font-style: italic;
          color: #065f46;
        }
      `}</style>
    </div>
  );
};

export default DatabaseStatus;