/**
 * API configuration utility for consistent base URL usage
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Build a full API URL from a relative path
 * @param {string} path - Relative API path (e.g., '/auth/sync-user')
 * @returns {string} - Full API URL
 */
export const buildApiUrl = (path) => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
};

/**
 * Make an API request with proper base URL
 * @param {string} path - Relative API path
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
 */
export const apiRequest = (path, options = {}) => {
  const url = buildApiUrl(path);
  return fetch(url, options);
};