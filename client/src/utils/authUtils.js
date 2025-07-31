/**
 * Utility functions for handling Azure authentication data
 */

import { jwtDecode } from "jwt-decode";

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
 * Safely decode JWT token with proper validation and error handling
 * @param {string} token - JWT token to decode
 * @returns {Object|null} - Decoded token claims or null if invalid
 */
const safeJwtDecode = (token) => {
  if (!token || typeof token !== 'string') {
    console.warn('JWT decode: Invalid token provided - not a string');
    return null;
  }

  // Basic JWT structure validation (header.payload.signature)
  const tokenParts = token.split('.');
  if (tokenParts.length !== 3) {
    console.warn('JWT decode: Invalid token structure - expected 3 parts separated by dots');
    return null;
  }

  // Validate that parts are not empty
  if (tokenParts.some(part => !part || part.length === 0)) {
    console.warn('JWT decode: Invalid token structure - empty parts detected');
    return null;
  }

  try {
    const decoded = jwtDecode(token);
    
    // Validate that decoded token has expected structure
    if (!decoded || typeof decoded !== 'object') {
      console.warn('JWT decode: Decoded token is not a valid object');
      return null;
    }

    // Check for common JWT fields to ensure it's a valid token
    if (!decoded.iat && !decoded.exp && !decoded.aud && !decoded.iss) {
      console.warn('JWT decode: Token missing standard JWT claims (iat, exp, aud, iss)');
      return null;
    }

    // Check if token is expired (if exp claim exists)
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      console.warn('JWT decode: Token is expired');
      return null;
    }

    return decoded;
  } catch (error) {
    if (error.name === 'InvalidTokenError') {
      console.warn('JWT decode: Invalid token format', error.message);
    } else if (error.message.includes('Invalid token')) {
      console.warn('JWT decode: Token validation failed', error.message);
    } else {
      console.warn('JWT decode: Unexpected error during token decoding', error.message);
    }
    return null;
  }
};

/**
 * Extract user information from Azure account object with access token fallback.
 * Always prefer access token claims for federated users.
 * @param {Object} account - Azure MSAL account object
 * @param {Object} authResult - Optional MSAL auth result containing access token claims
 * @returns {Object} - Extracted user information
 */
export const extractUserInfo = (account, authResult = null) => {
  if (!account && !authResult?.accessToken) {
    throw new Error("Account object or access token is required");
  }

  let email = null;
  let name = null;

  // 1. Try to extract from access token first (for federated users)
  let accessTokenClaims = null;
  if (authResult?.accessToken) {
    accessTokenClaims = safeJwtDecode(authResult.accessToken);
    if (accessTokenClaims) {
      // Prefer a real email from access token
      if (accessTokenClaims.email && isRealUserEmail(accessTokenClaims.email)) {
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
    }
  }

  // 2. If still missing, try idTokenClaims
  if (!email && account?.idTokenClaims?.email && isRealUserEmail(account.idTokenClaims.email)) {
    email = account.idTokenClaims.email;
  } else if (!email && account?.idTokenClaims?.preferred_username && isRealUserEmail(account.idTokenClaims.preferred_username)) {
    email = account.idTokenClaims.preferred_username;
  } else if (!email && account?.idTokenClaims?.upn && isRealUserEmail(account.idTokenClaims.upn)) {
    email = account.idTokenClaims.upn;
  }

  // 3. Last resort: check username if it looks like a real email
  if (!email && account?.username && isRealUserEmail(account.username)) {
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
export const validateAndSanitizeHomeAccountId = (homeAccountId) => {
  if (!homeAccountId || typeof homeAccountId !== "string") {
    return null;
  }
  // Basic sanitization - remove any potentially dangerous characters
  // Azure IDs are typically in format: "userId.tenantId"
  const sanitized = homeAccountId.replace(/[^a-zA-Z0-9.\-_]/g, "");
  return sanitized.length > 0 ? sanitized : null;
};

/**
 * Log account information for debugging (safe for production)
 * @param {Object} account - Azure MSAL account object
 * @param {Object} authResult - Optional MSAL auth result containing access token
 */
export const logAccountInfo = (account, authResult = null) => {
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
    console.log("Access Token Claims (if available):", {
      hasAccessTokenClaims: !!authResult.account?.idTokenClaims,
      // Note: Access token claims may need to be decoded from JWT
      // or may be available through different MSAL properties
    });
  }
};
