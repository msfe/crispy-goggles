/**
 * Utility functions for handling Azure authentication data on the backend
 */

/**
 * Comprehensive email validation regex pattern
 * Based on RFC 5322 specification with practical considerations
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validate email address using comprehensive regex
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if email is valid
 */
const isValidEmail = (email) => {
  return typeof email === 'string' && EMAIL_REGEX.test(email);
};

/**
 * Check if email is a real user email (not Azure internal domain)
 * @param {string} email - Email address to check
 * @returns {boolean} - True if email appears to be a real user email
 */
const isRealUserEmail = (email) => {
  if (!isValidEmail(email)) {
    return false;
  }
  // Exclude Azure internal domains that contain user IDs
  return !email.endsWith('.onmicrosoft.com');
};

/**
 * Extract user information from Azure account object with access token fallback
 * @param {Object} account - Azure MSAL account object
 * @param {Object} authResult - Optional MSAL auth result containing access token claims
 * @returns {Object} - Extracted user information
 */
const extractUserInfo = (account, authResult = null) => {
  if (!account) {
    throw new Error('Account object is required');
  }

  // Try to extract email from various possible locations
  let email = null;
  let name = null;
  
  // First try idTokenClaims which typically contains the actual email
  if (account.idTokenClaims?.email && isRealUserEmail(account.idTokenClaims.email)) {
    email = account.idTokenClaims.email;
  } else if (account.idTokenClaims?.preferred_username && isRealUserEmail(account.idTokenClaims.preferred_username)) {
    email = account.idTokenClaims.preferred_username;
  } else if (account.idTokenClaims?.upn && isRealUserEmail(account.idTokenClaims.upn)) {
    // User Principal Name might be used as email
    email = account.idTokenClaims.upn;
  }
  
  // For federated users (like Google through Azure Entra External ID),
  // ID token claims may be limited. Try access token claims as fallback.
  if (!email && authResult?.accessToken) {
    console.log('ID token missing email claims, trying access token for federated user...');
    
    // Access token claims are often richer for federated users
    if (authResult.account?.idTokenClaims?.email && isRealUserEmail(authResult.account.idTokenClaims.email)) {
      email = authResult.account.idTokenClaims.email;
    } else if (authResult.account?.idTokenClaims?.preferred_username && isRealUserEmail(authResult.account.idTokenClaims.preferred_username)) {
      email = authResult.account.idTokenClaims.preferred_username;
    } else if (authResult.account?.idTokenClaims?.upn && isRealUserEmail(authResult.account.idTokenClaims.upn)) {
      email = authResult.account.idTokenClaims.upn;
    }
    
    // If we have access token but no parsed claims, log for debugging
    if (!email) {
      console.warn('Access token available but no email claims found. May need to decode access token or configure Azure claim mappings.');
    }
  }
  
  // Last resort: check username if it looks like a real email
  if (!email && account.username && isRealUserEmail(account.username)) {
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
const validateAndSanitizeHomeAccountId = (homeAccountId) => {
  if (!homeAccountId || typeof homeAccountId !== 'string') {
    return null;
  }
  // Validate Azure homeAccountId format: "userId.tenantId"
  // Both userId and tenantId should be alphanumeric strings
  const isValidFormat = /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+$/.test(homeAccountId);
  return isValidFormat ? homeAccountId : null;
};

/**
 * Log account information for debugging (safe for production)
 * @param {Object} account - Azure MSAL account object
 * @param {Object} authResult - Optional MSAL auth result containing access token
 */
const logAccountInfo = (account, authResult = null) => {
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

module.exports = {
  extractUserInfo,
  validateAndSanitizeHomeAccountId,
  logAccountInfo,
  isValidEmail,
  isRealUserEmail
};