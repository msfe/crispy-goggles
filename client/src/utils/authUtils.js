/**
 * Utility functions for handling Azure authentication data
 */

/**
 * Extract user information from Azure account object with access token fallback
 * @param {Object} account - Azure MSAL account object
 * @param {Object} authResult - Optional MSAL auth result containing access token claims
 * @returns {Object} - Extracted user information
 */
export const extractUserInfo = (account, authResult = null) => {
  if (!account) {
    throw new Error('Account object is required');
  }

  // Try to extract email from various possible locations
  let email = null;
  let name = null;
  
  // First try idTokenClaims which typically contains the actual email
  if (account.idTokenClaims?.email) {
    email = account.idTokenClaims.email;
  } else if (account.idTokenClaims?.preferred_username) {
    email = account.idTokenClaims.preferred_username;
  } else if (account.idTokenClaims?.upn) {
    // User Principal Name might be used as email
    email = account.idTokenClaims.upn;
  }
  
  // For federated users (like Google through Azure Entra External ID),
  // ID token claims may be limited. Try access token claims as fallback.
  if (!email && authResult?.accessToken) {
    console.log('ID token missing email claims, trying access token for federated user...');
    
    // Access token claims are often richer for federated users
    if (authResult.account?.idTokenClaims?.email) {
      email = authResult.account.idTokenClaims.email;
    } else if (authResult.account?.idTokenClaims?.preferred_username) {
      email = authResult.account.idTokenClaims.preferred_username;
    } else if (authResult.account?.idTokenClaims?.upn) {
      email = authResult.account.idTokenClaims.upn;
    }
    
    // If we have access token but no parsed claims, log for debugging
    if (!email) {
      console.warn('Access token available but no email claims found. May need to decode access token or configure Azure claim mappings.');
    }
  }
  
  // Last resort: check username if it looks like a real email
  if (!email && account.username && account.username.includes('@') && !account.username.includes('.onmicrosoft.com')) {
    // Only use username if it looks like a real email (not an Azure internal ID)
    email = account.username;
  }

  // If we still don't have an email, this might be an issue with Azure configuration
  if (!email) {
    console.warn('Unable to extract email from Azure account object', {
      account: {
        username: account.username,
        hasIdTokenClaims: !!account.idTokenClaims,
        idTokenClaimsKeys: account.idTokenClaims ? Object.keys(account.idTokenClaims) : [],
      },
      hasAccessToken: !!(authResult?.accessToken),
    });
    throw new Error('Unable to extract email from Azure account. For federated users, ensure claim mapping is configured in Azure External ID.');
  }

  // Extract name, preferring display name from idTokenClaims
  name = account.name;
  if (account.idTokenClaims?.name) {
    name = account.idTokenClaims.name;
  } else if (account.idTokenClaims?.given_name && account.idTokenClaims?.family_name) {
    name = `${account.idTokenClaims.given_name} ${account.idTokenClaims.family_name}`;
  } else if (!name && authResult?.account?.idTokenClaims?.name) {
    // Try access token claims for federated users
    name = authResult.account.idTokenClaims.name;
  } else if (!name && authResult?.account?.idTokenClaims?.given_name && authResult?.account?.idTokenClaims?.family_name) {
    name = `${authResult.account.idTokenClaims.given_name} ${authResult.account.idTokenClaims.family_name}`;
  } else if (!name && email) {
    // Fallback: use email local part as name
    name = email.split('@')[0];
  }

  return {
    userId: account.homeAccountId,
    email: email,
    name: name || 'Unknown User',
    username: account.username, // Keep the original username for debugging
  };
};

/**
 * Validate and sanitize Azure homeAccountId
 * @param {string} homeAccountId - Azure homeAccountId
 * @returns {string|null} - Sanitized homeAccountId or null if invalid
 */
export const validateAndSanitizeHomeAccountId = (homeAccountId) => {
  if (!homeAccountId || typeof homeAccountId !== 'string') {
    return null;
  }
  // Basic sanitization - remove any potentially dangerous characters
  // Azure IDs are typically in format: "userId.tenantId"
  const sanitized = homeAccountId.replace(/[^a-zA-Z0-9.\-_]/g, '');
  return sanitized.length > 0 ? sanitized : null;
};

/**
 * Log account information for debugging (safe for production)
 * @param {Object} account - Azure MSAL account object
 * @param {Object} authResult - Optional MSAL auth result containing access token
 */
export const logAccountInfo = (account, authResult = null) => {
  if (!account) return;
  
  console.log('Azure Account Debug Info:', {
    homeAccountId: account.homeAccountId,
    username: account.username,
    name: account.name,
    hasIdTokenClaims: !!account.idTokenClaims,
    idTokenClaimsKeys: account.idTokenClaims ? Object.keys(account.idTokenClaims) : [],
    environment: account.environment,
    tenantId: account.tenantId,
    hasAccessToken: !!(authResult?.accessToken),
  });
  
  if (account.idTokenClaims) {
    console.log('ID Token Claims (safe fields):', {
      email: account.idTokenClaims.email,
      name: account.idTokenClaims.name,
      given_name: account.idTokenClaims.given_name,
      family_name: account.idTokenClaims.family_name,
      preferred_username: account.idTokenClaims.preferred_username,
      upn: account.idTokenClaims.upn,
    });
  }
  
  if (authResult?.accessToken) {
    console.log('Access Token Available - Length:', authResult.accessToken.length);
    console.log('Access Token Claims (if available):', {
      hasAccessTokenClaims: !!(authResult.account?.idTokenClaims),
      // Note: Access token claims may need to be decoded from JWT
      // or may be available through different MSAL properties
    });
  }
};