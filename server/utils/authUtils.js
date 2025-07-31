/**
 * Utility functions for handling Azure authentication data on the backend
 */

/**
 * Extract user information from Azure account object
 * @param {Object} account - Azure MSAL account object
 * @returns {Object} - Extracted user information
 */
const extractUserInfo = (account) => {
  if (!account) {
    throw new Error('Account object is required');
  }

  // Try to extract email from various possible locations
  let email = null;
  
  // First try idTokenClaims which typically contains the actual email
  if (account.idTokenClaims?.email) {
    email = account.idTokenClaims.email;
  } else if (account.idTokenClaims?.preferred_username) {
    email = account.idTokenClaims.preferred_username;
  } else if (account.idTokenClaims?.upn) {
    // User Principal Name might be used as email
    email = account.idTokenClaims.upn;
  } else if (account.username && account.username.includes('@') && !account.username.includes('.onmicrosoft.com')) {
    // Only use username if it looks like a real email (not an Azure internal ID)
    email = account.username;
  }

  // If we still don't have an email, this might be an issue with Azure configuration
  if (!email) {
    console.warn('Unable to extract email from Azure account object', account);
    throw new Error('Unable to extract email from Azure account. Please check Azure configuration.');
  }

  // Extract name, preferring display name from idTokenClaims
  let name = account.name;
  if (account.idTokenClaims?.name) {
    name = account.idTokenClaims.name;
  } else if (account.idTokenClaims?.given_name && account.idTokenClaims?.family_name) {
    name = `${account.idTokenClaims.given_name} ${account.idTokenClaims.family_name}`;
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
  // Basic sanitization - remove any potentially dangerous characters
  // Azure IDs are typically in format: "userId.tenantId"
  const sanitized = homeAccountId.replace(/[^a-zA-Z0-9.\-_]/g, '');
  return sanitized.length > 0 ? sanitized : null;
};

/**
 * Log account information for debugging (safe for production)
 * @param {Object} account - Azure MSAL account object
 */
const logAccountInfo = (account) => {
  if (!account) return;
  
  console.log('Azure Account Debug Info:', {
    homeAccountId: account.homeAccountId,
    username: account.username,
    name: account.name,
    hasIdTokenClaims: !!account.idTokenClaims,
    idTokenClaimsKeys: account.idTokenClaims ? Object.keys(account.idTokenClaims) : [],
    environment: account.environment,
    tenantId: account.tenantId,
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
};

module.exports = {
  extractUserInfo,
  validateAndSanitizeHomeAccountId,
  logAccountInfo
};