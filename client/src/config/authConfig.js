import { PublicClientApplication } from '@azure/msal-browser';

// MSAL configuration for frontend
export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || 'your_client_id_here',
    authority: `${import.meta.env.VITE_AZURE_CLOUD_INSTANCE || 'https://crispygoggles.ciamlogin.com/'}${import.meta.env.VITE_AZURE_TENANT_ID || '869afa14-2d2f-4ddf-a6d9-8cb3977cb5d7'}`,
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || 'http://localhost:3000',
  },
  cache: {
    cacheLocation: 'sessionStorage', // Store tokens in session storage
    storeAuthStateInCookie: false, // Don't store auth state in cookies
  },
};

// Create MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Login request configuration
export const loginRequest = {
  scopes: ['openid', 'profile', 'email'],
};

// Signup request configuration (same as login for Azure CIAM)
export const signupRequest = {
  scopes: ['openid', 'profile', 'email'],
  prompt: 'create', // Encourage account creation
};