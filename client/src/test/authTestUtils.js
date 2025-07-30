// Test utility to simulate authentication state changes
import { msalInstance } from '../config/authConfig';

// Mock account for testing
const mockAccount = {
  homeAccountId: "test-home-account-id",
  environment: "crispygoggles.ciamlogin.com",
  tenantId: "869afa14-2d2f-4ddf-a6d9-8cb3977cb5d7",
  username: "test.user@example.com",
  localAccountId: "test-local-account-id",
  name: "Test User",
  authorityType: "MSSTS",
  cloudGraphHostName: "",
  msGraphHost: "",
  idTokenClaims: {
    aud: "test_client_id",
    iss: "https://crispygoggles.ciamlogin.com/869afa14-2d2f-4ddf-a6d9-8cb3977cb5d7/v2.0/",
    iat: Math.floor(Date.now() / 1000),
    nbf: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    name: "Test User",
    preferred_username: "test.user@example.com",
    sub: "test-subject-id",
    tid: "869afa14-2d2f-4ddf-a6d9-8cb3977cb5d7",
    ver: "2.0"
  }
};

// Function to simulate successful authentication
export const simulateAuthentication = () => {
  if (typeof window !== 'undefined') {
    // Store mock account in localStorage to simulate MSAL cache
    const accountKey = `${mockAccount.environment}-${mockAccount.tenantId}-${mockAccount.homeAccountId}`;
    const accountData = {
      account: mockAccount,
      authority: `https://crispygoggles.ciamlogin.com/${mockAccount.tenantId}/`,
      authorityType: "MSSTS"
    };
    
    if (msalInstance) {
      try {
        msalInstance.getTokenCache().writeAccounts([mockAccount]);
      } catch (error) {
        console.warn('Could not write account to MSAL cache:', error);
      }
    }
    
    // Set active account if MSAL instance is available
    if (msalInstance) {
      try {
        msalInstance.setActiveAccount(mockAccount);
      } catch (error) {
        console.warn('Could not set active account:', error);
      }
    }
    
    // Notify about authentication state change
    if (onAuthStateChange) {
      onAuthStateChange({ authenticated: true, account: mockAccount });
    }
  }
};

// Function to clear authentication state
export const clearAuthentication = (onAuthStateChange) => {
  if (typeof window !== 'undefined') {
    // Clear localStorage entries related to MSAL
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('msal.')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear active account if MSAL instance is available
    if (msalInstance) {
      try {
        msalInstance.setActiveAccount(null);
      } catch (error) {
        console.warn('Could not clear active account:', error);
      }
    }
    
    // Notify that authentication state has been cleared
    if (typeof window.onAuthStateChanged === 'function') {
      window.onAuthStateChanged('cleared');
    } else {
      console.log('Authentication state updated: cleared');
    }
  }
};

// Add global functions for browser console testing
if (typeof window !== 'undefined') {
  window.onAuthStateChanged = null; // Callback for authentication state changes
  window.testAuth = {
    simulate: simulateAuthentication,
    clear: clearAuthentication
  };
}