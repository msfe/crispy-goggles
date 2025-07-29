import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import AuthProvider from './components/auth/AuthProvider.jsx';
import { msalInstance } from './config/authConfig.js';

// Initialize MSAL before handling redirects
msalInstance.initialize().then(() => {
  // Handle MSAL redirect responses before rendering the app
  return msalInstance.handleRedirectPromise();
}).then((authResult) => {
  // authResult will contain tokens if the user was redirected after login
  if (authResult) {
    console.log('Authentication successful:', authResult);
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
