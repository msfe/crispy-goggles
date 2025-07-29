import React from 'react';
import { useMsal } from '@azure/msal-react';

const UserProfile = () => {
  const { instance, accounts } = useMsal();
  const account = accounts[0];

  const handleLogout = () => {
    instance.logoutPopup({
      postLogoutRedirectUri: '/',
      mainWindowRedirectUri: '/'
    });
  };

  if (!account) {
    return null;
  }

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '0 auto', 
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#f0f8ff'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Welcome!</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Name:</strong> {account.name || 'Not provided'}</p>
        <p><strong>Email:</strong> {account.username}</p>
        <p><strong>Account ID:</strong> {account.homeAccountId}</p>
      </div>
      
      <button
        onClick={handleLogout}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#d13438',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        Sign Out
      </button>
    </div>
  );
};

export default UserProfile;