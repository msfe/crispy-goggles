/**
 * Utility functions for handling Azure authentication data on the backend
 */

const { jwtDecode } = require('jwt-decode');

/**
 * Extract user information from Azure account object with access token fallback.
 * Always prefer access token claims for federated users.
 * @param {Object} account - Azure MSAL account object
 * @param {Object} authResult - Optional MSAL auth result containing access token claims
 * @returns {Object} - Extracted user information
 */
const extractUserInfo = (account, authResult = null) => {
  if (!account && !authResult?.accessToken) {
    throw new Error("Account object or access token is required");
  }

  let email = null;
  let name = null;

  // 1. Try to extract from access token first (for federated users)
  let accessTokenClaims = null;
  if (authResult?.accessToken) {
    try {
      accessTokenClaims = jwtDecode(authResult.accessToken);
      // Prefer a real email from access token
      if (
        accessTokenClaims.email &&
        accessTokenClaims.email.includes("@") &&
        !accessTokenClaims.email.endsWith(".onmicrosoft.com")
      ) {
        email = accessTokenClaims.email;
      }
      // Prefer name from access token if available
      if (accessTokenClaims.name) {
        name = accessTokenClaims.name;
      } else if (
        accessTokenClaims.given_name &&
        accessTokenClaims.family_name
      ) {
        name = `${accessTokenClaims.given_name} ${accessTokenClaims.family_name}`;
      }
    } catch (e) {
      console.warn("Failed to decode access token", e);
    }
  }

  // 2. If still missing, try idTokenClaims
  if (
    !email &&
    account?.idTokenClaims?.email &&
    account.idTokenClaims.email.includes("@") &&
    !account.idTokenClaims.email.endsWith(".onmicrosoft.com")
  ) {
    email = account.idTokenClaims.email;
  } else if (
    !email &&
    account?.idTokenClaims?.preferred_username &&
    account.idTokenClaims.preferred_username.includes("@") &&
    !account.idTokenClaims.preferred_username.endsWith(".onmicrosoft.com")
  ) {
    email = account.idTokenClaims.preferred_username;
  } else if (
    !email &&
    account?.idTokenClaims?.upn &&
    account.idTokenClaims.upn.includes("@") &&
    !account.idTokenClaims.upn.endsWith(".onmicrosoft.com")
  ) {
    email = account.idTokenClaims.upn;
  }

  // 3. Last resort: check username if it looks like a real email
  if (
    !email &&
    account?.username &&
    account.username.includes("@") &&
    !account.username.endsWith(".onmicrosoft.com")
  ) {
    email = account.username;
  }

  if (!email) {
    console.warn("Unable to extract email from Azure account or access token", {
      account: {
        username: account?.username,
        hasIdTokenClaims: !!account?.idTokenClaims,
        idTokenClaimsKeys: account?.idTokenClaims
          ? Object.keys(account.idTokenClaims)
          : [],
      },
      hasAccessToken: !!authResult?.accessToken,
      accessTokenClaims,
    });
    throw new Error(
      "Unable to extract email from Azure account or access token. For federated users, ensure claim mapping is configured in Azure External ID."
    );
  }

  // Prefer name from access token, then idTokenClaims, then account
  if (!name) {
    if (account?.idTokenClaims?.name) {
      name = account.idTokenClaims.name;
    } else if (
      account?.idTokenClaims?.given_name &&
      account?.idTokenClaims?.family_name
    ) {
      name = `${account.idTokenClaims.given_name} ${account.idTokenClaims.family_name}`;
    } else if (account?.name) {
      name = account.name;
    } else if (email) {
      name = email.split("@")[0];
    }
  }

  return {
    userId: account?.homeAccountId || null,
    email,
    name: name || "Unknown User",
    username: account?.username || email,
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
 * @param {Object} authResult - Optional MSAL auth result containing access token
 */
const logAccountInfo = (account, authResult = null) => {
  if (!account) return;

  console.log("Azure Account Debug Info:", {
    homeAccountId: account.homeAccountId,
    username: account.username,
    name: account.name,
    hasIdTokenClaims: !!account.idTokenClaims,
    idTokenClaimsKeys: account.idTokenClaims
      ? Object.keys(account.idTokenClaims)
      : [],
    environment: account.environment,
    tenantId: account.tenantId,
    hasAccessToken: !!authResult?.accessToken,
  });

  if (account.idTokenClaims) {
    console.log("ID Token Claims (safe fields):", {
      email: account.idTokenClaims.email,
      name: account.idTokenClaims.name,
      given_name: account.idTokenClaims.given_name,
      family_name: account.idTokenClaims.family_name,
      preferred_username: account.idTokenClaims.preferred_username,
      upn: account.idTokenClaims.upn,
    });
  }

  if (authResult?.accessToken) {
    console.log(
      "Access Token Available - Length:",
      authResult.accessToken.length
    );
    
    // Try to decode access token for debugging
    try {
      const accessTokenClaims = jwtDecode(authResult.accessToken);
      console.log("Access Token Claims (safe fields):", {
        email: accessTokenClaims.email,
        name: accessTokenClaims.name,
        given_name: accessTokenClaims.given_name,
        family_name: accessTokenClaims.family_name,
        preferred_username: accessTokenClaims.preferred_username,
        upn: accessTokenClaims.upn,
        hasEmailClaim: !!accessTokenClaims.email,
        claimsCount: Object.keys(accessTokenClaims).length,
      });
    } catch (e) {
      console.warn("Failed to decode access token for debugging:", e.message);
    }
  }
};

module.exports = {
  extractUserInfo,
  validateAndSanitizeHomeAccountId,
  logAccountInfo
};