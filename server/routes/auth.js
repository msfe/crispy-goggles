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
    
    // Return user info (explicitly exclude sensitive token data such as access tokens and refresh tokens)
    const userInfo = {
      userId: response.account.homeAccountId, // Unique identifier for the user
      username: response.account.username, // User's username (often their email)
      name: response.account.name, // User's display name
      email: response.account.username, // Email is typically in username for Azure CIAM
      // Note: Sensitive fields like accessToken, refreshToken, and idToken are excluded for security
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

// User sync endpoint - creates/updates user in database from Azure account info
router.post('/sync-user', checkConfiguration, async (req, res) => {
  try {
    const { userInfo } = req.body;
    
    if (!userInfo || !userInfo.userId || !userInfo.email) {
      return res.status(400).json({ error: 'User info with userId and email is required' });
    }

    const { UserService } = require('../services/databaseService');
    const { User } = require('../models');
    const userService = new UserService();

    // Check if user already exists by Azure ID
    const existingUser = await userService.getByAzureId(userInfo.userId);
    
    if (existingUser.success) {
      // User exists, return the existing user
      res.json({ 
        success: true, 
        user: existingUser.data,
        created: false 
      });
    } else {
      // User doesn't exist, create new user
      const newUser = new User({
        azureId: userInfo.userId,
        email: userInfo.email,
        name: userInfo.name || userInfo.email.split('@')[0],
        bio: ''
      });

      // Validate user data
      newUser.validate();

      // Check if email is already taken by another user (shouldn't happen with Azure)
      const emailCheck = await userService.getByEmail(newUser.email);
      if (emailCheck.success) {
        return res.status(409).json({ error: 'User with this email already exists with different Azure ID' });
      }

      const result = await userService.create(newUser.toJSON());
      if (result.success) {
        res.status(201).json({
          success: true,
          user: result.data,
          created: true
        });
      } else {
        res.status(500).json({ error: result.error });
      }
    }
  } catch (error) {
    console.error('User sync error:', error);
    res.status(500).json({ 
      error: 'Failed to sync user',
      details: error.message 
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  // For Azure CIAM, logout is typically handled on the frontend
  // This endpoint can be used for server-side session cleanup
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;