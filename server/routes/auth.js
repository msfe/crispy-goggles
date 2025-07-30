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