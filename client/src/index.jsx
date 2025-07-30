import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import AuthProvider from './components/auth/AuthProvider.jsx';
import { msalInstance } from './config/authConfig.js';

// Import test utilities in development mode
if (import.meta.env.DEV) {
  import('./test/authTestUtils.js');
}

// Initialize MSAL before handling redirects
msalInstance.initialize().then(() => {
  // Handle MSAL redirect responses before rendering the app
  return msalInstance.handleRedirectPromise();
}).then(async (authResult) => {
  // authResult will contain tokens if the user was redirected after login
  if (authResult) {
    console.log('Authentication successful:', authResult);
    // Set the active account after successful authentication
    if (authResult.account) {
      msalInstance.setActiveAccount(authResult.account);
      
      // Sync user to database after successful authentication
      try {
        const userInfo = {
          userId: authResult.account.homeAccountId,
          username: authResult.account.username,
          name: authResult.account.name,
          email: authResult.account.username, // Email is typically in username for Azure CIAM
        };

        const response = await fetch('/auth/sync-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userInfo }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('User sync successful:', result);
        } else {
          console.error('User sync failed:', await response.text());
        }
      } catch (error) {
        console.error('Error syncing user to database:', error);
        // Don't prevent app rendering if sync fails
      }
    }
  } else {
    // If no authResult but there are accounts, set the first one as active
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      msalInstance.setActiveAccount(accounts[0]);
    }
  }
  
  // Render the app after handling any redirect
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
}).catch((error) => {
  console.error('Error during MSAL initialization or redirect handling:', error);
  
  // Still render the app even if there's an error
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
});
