const express = require('express');
const { cca, isConfigured } = require('../config/authConfig');
const router = express.Router();

// Middleware to check if Azure CIAM is configured
const checkConfiguration = (req, res, next) => {
  if (!isConfigured || !cca) {
    return res.status(503).json({
      error: 'Azure CIAM not configured',
      message: 'Authentication service is not properly configured. Please check environment variables.',
      documentation: 'See docs/AZURE_CIAM_SETUP.md for setup instructions'
    });
  }
  next();
};

// Login endpoint - generates authorization URL
router.get('/login', checkConfiguration, async (req, res) => {
  try {
    const authCodeUrlParameters = {
      scopes: ['openid', 'profile', 'email'],
      redirectUri: process.env.AZURE_REDIRECT_URI,
      responseMode: 'fragment', // For SPA
    };

    const authUrl = await cca.getAuthCodeUrl(authCodeUrlParameters);
    res.json({ authUrl });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Failed to generate login URL',
      details: error.message 
    });
  }
});

// Signup endpoint - same as login for Azure CIAM (users can create accounts during sign-in)
router.get('/signup', checkConfiguration, async (req, res) => {
  try {
    const authCodeUrlParameters = {
      scopes: ['openid', 'profile', 'email'],
      redirectUri: process.env.AZURE_REDIRECT_URI,
      responseMode: 'fragment', // For SPA
      prompt: 'create', // Encourage account creation
    };

    const authUrl = await cca.getAuthCodeUrl(authCodeUrlParameters);
    res.json({ authUrl });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: 'Failed to generate signup URL',
      details: error.message 
    });
  }
});

// Token validation endpoint
router.post('/validate-token', checkConfiguration, async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const tokenRequest = {
      code: code,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: process.env.AZURE_REDIRECT_URI,
    };

    const response = await cca.acquireTokenByCode(tokenRequest);
    
    // Return user info (remove sensitive token data for security)
    const userInfo = {
      userId: response.account.homeAccountId,
      username: response.account.username,
      name: response.account.name,
      email: response.account.username, // Email is typically in username for Azure CIAM
    };

    res.json({ 
      success: true, 
      user: userInfo,
      // In production, you might want to create your own JWT token here
      // for session management instead of exposing Azure tokens
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).json({ 
      error: 'Token validation failed',
      details: error.message 
    });
  }
});

// Configuration status endpoint
router.get('/status', (req, res) => {
  res.json({
    configured: isConfigured,
    message: isConfigured 
      ? 'Azure CIAM authentication is properly configured' 
      : 'Azure CIAM authentication requires configuration. See docs/AZURE_CIAM_SETUP.md'
  });
});

// Logout endpoint
router.post('/logout', (req, res) => {
  // For Azure CIAM, logout is typically handled on the frontend
  // This endpoint can be used for server-side session cleanup
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;