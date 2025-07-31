const express = require('express');
const { cca, isConfigured } = require('../config/authConfig');
const { extractUserInfo, logAccountInfo } = require('../utils/authUtils');
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

/**
 * @swagger
 * /auth/login:
 *   get:
 *     tags: [Authentication]
 *     summary: Get login URL
 *     description: Generates an Azure CIAM authorization URL for user login
 *     responses:
 *       200:
 *         description: Authorization URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthUrl'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
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

/**
 * @swagger
 * /auth/signup:
 *   get:
 *     tags: [Authentication]
 *     summary: Get signup URL
 *     description: Generates an Azure CIAM authorization URL for user signup
 *     responses:
 *       200:
 *         description: Authorization URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthUrl'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
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

/**
 * @swagger
 * /auth/validate-token:
 *   post:
 *     tags: [Authentication]
 *     summary: Validate authorization code
 *     description: Exchanges an authorization code for user information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *                 description: Authorization code from Azure CIAM
 *                 example: "0.AXoA..."
 *     responses:
 *       200:
 *         description: Token validated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthValidation'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
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
    
    // Log account info for debugging in development
    if (process.env.NODE_ENV === 'development') {
      logAccountInfo(response.account, response);
    }
    
    // Extract user information using robust email extraction logic with access token fallback
    const userInfo = extractUserInfo(response.account, response);
    
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

/**
 * @swagger
 * /auth/status:
 *   get:
 *     tags: [Authentication]
 *     summary: Get authentication configuration status
 *     description: Returns whether Azure CIAM authentication is properly configured
 *     responses:
 *       200:
 *         description: Authentication status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthStatus'
 */
router.get('/status', (req, res) => {
  res.json({
    configured: isConfigured,
    message: isConfigured 
      ? 'Azure CIAM authentication is properly configured' 
      : 'Azure CIAM authentication requires configuration. See docs/AZURE_CIAM_SETUP.md'
  });
});

/**
 * @swagger
 * /auth/sync-user:
 *   post:
 *     tags: [Authentication]
 *     summary: Sync user to database
 *     description: Creates or updates user in the database from Azure account information. This endpoint is automatically called after successful Azure authentication to ensure user data is synced to the local database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userInfo]
 *             properties:
 *               userInfo:
 *                 type: object
 *                 required: [userId, email]
 *                 properties:
 *                   userId:
 *                     type: string
 *                     description: Azure homeAccountId (unique identifier)
 *                     example: "00000000-0000-0000-0000-000000000000.11111111-1111-1111-1111-111111111111"
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: User's actual email address
 *                     example: "user@example.com"
 *                   name:
 *                     type: string
 *                     description: User's display name
 *                     example: "John Doe"
 *                   username:
 *                     type: string
 *                     description: Azure username (for debugging)
 *                     example: "john.doe@tenant.onmicrosoft.com"
 *     responses:
 *       200:
 *         description: User already exists, returned existing user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 created:
 *                   type: boolean
 *                   example: false
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 created:
 *                   type: boolean
 *                   example: true
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         description: User with this email already exists with different Azure ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */

// User sync endpoint - creates/updates user in database from Azure account info
router.post('/sync-user', checkConfiguration, async (req, res) => {
  try {
    const { userInfo } = req.body;
    
    // Enhanced validation with detailed logging
    if (!userInfo) {
      console.error('Sync failed: userInfo is required');
      return res.status(400).json({ error: 'userInfo is required' });
    }
    
    if (!userInfo.userId) {
      console.error('Sync failed: userInfo.userId is required', { receivedUserInfo: userInfo });
      return res.status(400).json({ error: 'userInfo.userId is required' });
    }
    
    if (!userInfo.email) {
      console.error('Sync failed: userInfo.email is required', { receivedUserInfo: userInfo });
      return res.status(400).json({ error: 'userInfo.email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userInfo.email)) {
      console.error('Sync failed: Invalid email format', { email: userInfo.email });
      return res.status(400).json({ error: 'Invalid email format', receivedEmail: userInfo.email });
    }

    // Additional validation for Azure-specific patterns
    if (userInfo.email.endsWith('.onmicrosoft.com')) {
      console.warn('Warning: Email appears to be Azure internal ID, not user email', { email: userInfo.email });
      // Don't fail but warn - this might indicate the email extraction isn't working properly
    }

    // Log sync attempt for debugging with more details
    console.log('User sync attempt with details:', {
      userId: userInfo.userId,
      email: userInfo.email,
      name: userInfo.name,
      username: userInfo.username,
      hasUsername: !!userInfo.username,
      isInternalAzureEmail: userInfo.email.endsWith('.onmicrosoft.com'),
      timestamp: new Date().toISOString(),
    });

    const { UserService } = require('../services/databaseService');
    const { User } = require('../models');
    const userService = new UserService();

    // Check if user already exists by Azure ID
    console.log('Checking for existing user by Azure ID:', userInfo.userId);
    const existingUser = await userService.getByAzureId(userInfo.userId);
    
    if (existingUser.success) {
      // User exists, return the existing user
      console.log('User already exists in database:', {
        userId: existingUser.data.id,
        azureId: existingUser.data.azureId,
        email: existingUser.data.email,
        name: existingUser.data.name
      });
      res.json({ 
        success: true, 
        user: existingUser.data,
        created: false 
      });
    } else {
      console.log('User not found, creating new user:', {
        azureId: userInfo.userId,
        email: userInfo.email,
        name: userInfo.name
      });
      
      // User doesn't exist, create new user
      const newUser = new User({
        azureId: userInfo.userId,
        email: userInfo.email,
        name: userInfo.name || userInfo.email.split('@')[0],
        bio: ''
      });

      // Validate user data
      console.log('Validating new user data...');
      newUser.validate();

      // Check if email is already taken by another user (shouldn't happen with Azure)
      console.log('Checking for email conflicts...');
      const emailCheck = await userService.getByEmail(newUser.email);
      if (emailCheck.success) {
        console.warn('Email conflict detected:', {
          existingUser: emailCheck.data.id,
          existingAzureId: emailCheck.data.azureId,
          newAzureId: userInfo.userId,
          conflictingEmail: newUser.email
        });
        return res.status(409).json({ 
          error: 'User with this email already exists with different Azure ID',
          details: {
            existingUserId: emailCheck.data.id,
            conflictingEmail: newUser.email,
            existingAzureId: emailCheck.data.azureId,
            newAzureId: userInfo.userId
          }
        });
      }

      console.log('Creating new user in database...');
      const result = await userService.create(newUser.toJSON());
      if (result.success) {
        console.log('User created successfully:', {
          userId: result.data.id,
          azureId: result.data.azureId,
          email: result.data.email,
          name: result.data.name
        });
        res.status(201).json({
          success: true,
          user: result.data,
          created: true
        });
      } else {
        console.error('Database error creating user:', {
          error: result.error,
          userInfo: {
            azureId: userInfo.userId,
            email: userInfo.email,
            name: userInfo.name
          }
        });
        res.status(500).json({ 
          error: 'Database error creating user',
          details: result.error,
          userInfo: {
            azureId: userInfo.userId,
            email: userInfo.email,
            name: userInfo.name
          }
        });
      }
    }
  } catch (error) {
    console.error('User sync error:', {
      error: error.message,
      stack: error.stack,
      userInfo: req.body?.userInfo,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ 
      error: 'Failed to sync user',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Logout endpoint
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout user
 *     description: Handles server-side session cleanup for user logout
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully"
 */
router.post('/logout', (req, res) => {
  // For Azure CIAM, logout is typically handled on the frontend
  // This endpoint can be used for server-side session cleanup
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;