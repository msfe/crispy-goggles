const express = require('express');
const { UserService } = require('../services/databaseService');
const { User } = require('../models');
const router = express.Router();

const userService = new UserService();

// Middleware to check if database is configured
const checkDatabaseConfig = (req, res, next) => {
  const { isConfigured } = require('../config/cosmosConfig');
  if (!isConfigured) {
    return res.status(503).json({
      error: 'Database not configured',
      message: 'Cosmos DB is not properly configured. Please check environment variables.',
      documentation: 'See docs/COSMOS_DB_SETUP.md for setup instructions'
    });
  }
  next();
};

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 *     description: Retrieves a list of all users in the system
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
router.get('/', checkDatabaseConfig, async (req, res) => {
  try {
    const result = await userService.getAll();
    if (result.success) {
      res.json({ users: result.data });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     description: Retrieves a specific user by their unique identifier
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User unique identifier
 *         example: user-123-abc
 *     responses:
 *       200:
 *         description: User information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
router.get('/:id', checkDatabaseConfig, async (req, res) => {
  try {
    const result = await userService.getById(req.params.id);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Create new user
 *     description: Creates a new user account in the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, role]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               bio:
 *                 type: string
 *                 example: Software developer passionate about privacy
 *               role:
 *                 type: string
 *                 enum: [member, group_admin, global_admin]
 *                 example: member
 *               azureId:
 *                 type: string
 *                 example: azure-user-456-def
 *               contactDetails:
 *                 type: object
 *                 properties:
 *                   phone:
 *                     type: string
 *                     example: +1-555-123-4567
 *                   location:
 *                     type: string
 *                     example: Stockholm, Sweden
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         description: User with this email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
router.post('/', checkDatabaseConfig, async (req, res) => {
  try {
    const userData = req.body;
    const user = new User(userData);
    
    // Validate user data
    user.validate();

    // Check if user already exists
    const existingUser = await userService.getByEmail(user.email);
    if (existingUser.success) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const result = await userService.create(user.toJSON());
    if (result.success) {
      res.status(201).json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update user
 *     description: Updates an existing user's information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User unique identifier
 *         example: user-123-abc
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe Updated
 *               bio:
 *                 type: string
 *                 example: Updated bio information
 *               contactDetails:
 *                 type: object
 *                 properties:
 *                   phone:
 *                     type: string
 *                     example: +1-555-987-6543
 *                   location:
 *                     type: string
 *                     example: Gothenburg, Sweden
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
router.put('/:id', checkDatabaseConfig, async (req, res) => {
  try {
    const updates = req.body;
    
    // Don't allow updating certain fields
    delete updates.id;
    delete updates.createdAt;
    delete updates.type;

    const result = await userService.update(req.params.id, updates);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user
 *     description: Deletes a user account from the system
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User unique identifier
 *         example: user-123-abc
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
router.delete('/:id', checkDatabaseConfig, async (req, res) => {
  try {
    const result = await userService.delete(req.params.id);
    if (result.success) {
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     tags: [Users]
 *     summary: Search users
 *     description: Searches for users by name or email using query parameter
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *         example: john
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing search query
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
router.get('/search', checkDatabaseConfig, async (req, res) => {
  try {
    const { q: searchTerm } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({ error: 'Search query parameter "q" is required' });
    }

    const result = await userService.search(searchTerm);
    if (result.success) {
      res.json({ users: result.data });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/users/search/{term}:
 *   get:
 *     tags: [Users]
 *     summary: Search users (deprecated)
 *     description: Searches for users by name or email - use /search?q= instead
 *     deprecated: true
 *     parameters:
 *       - in: path
 *         name: term
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *         example: john
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
router.get('/search/:term', checkDatabaseConfig, async (req, res) => {
  try {
    const result = await userService.search(req.params.term);
    if (result.success) {
      res.json({ users: result.data });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/users/batch:
 *   post:
 *     tags: [Users]
 *     summary: Batch get users
 *     description: Retrieves multiple users by their IDs in a single request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userIds]
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to fetch
 *                 example: ["user-123-abc", "user-456-def"]
 *     responses:
 *       200:
 *         description: Batch user lookup results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid request body
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
router.post('/batch', checkDatabaseConfig, async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ error: 'userIds must be an array' });
    }

    const result = await userService.batchGetUsers(userIds);
    if (result.success) {
      res.json({ users: result.data });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/users/email/{email}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by email
 *     description: Retrieves a user by their email address
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: User email address
 *         example: john.doe@example.com
 *     responses:
 *       200:
 *         description: User information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
router.get('/email/:email', checkDatabaseConfig, async (req, res) => {
  try {
    const result = await userService.getByEmail(req.params.email);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/users/azure/{azureId}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by Azure ID
 *     description: Retrieves a user by their Azure Active Directory identifier
 *     parameters:
 *       - in: path
 *         name: azureId
 *         required: true
 *         schema:
 *           type: string
 *         description: Azure Active Directory user identifier
 *         example: azure-user-456-def
 *     responses:
 *       200:
 *         description: User information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
router.get('/azure/:azureId', checkDatabaseConfig, async (req, res) => {
  try {
    const result = await userService.getByAzureId(req.params.azureId);
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/users/{id}/privacy-settings:
 *   get:
 *     tags: [Users]
 *     summary: Get user privacy settings
 *     description: Retrieves privacy settings for a specific user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User unique identifier
 *         example: user-123-abc
 *     responses:
 *       200:
 *         description: User privacy settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profilePictureVisibility:
 *                   type: string
 *                   enum: [friends, friends_of_friends, all_users]
 *                   example: friends
 *                 bioVisibility:
 *                   type: string
 *                   enum: [friends, friends_of_friends, all_users]
 *                   example: friends
 *                 contactDetailsVisibility:
 *                   type: string
 *                   enum: [friends, friends_of_friends, all_users]
 *                   example: friends
 *                 friendsListVisibility:
 *                   type: string
 *                   enum: [friends, friends_of_friends, all_users]
 *                   example: friends
 *                 userDiscoverability:
 *                   type: string
 *                   enum: [none, friends_of_friends, all_users]
 *                   example: friends_of_friends
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
router.get('/:id/privacy-settings', checkDatabaseConfig, async (req, res) => {
  try {
    const result = await userService.getById(req.params.id);
    if (result.success) {
      res.json(result.data.privacySettings || {
        profilePictureVisibility: 'friends',
        bioVisibility: 'friends',
        contactDetailsVisibility: 'friends',
        friendsListVisibility: 'friends',
        userDiscoverability: 'friends_of_friends'
      });
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/users/{id}/privacy-settings:
 *   put:
 *     tags: [Users]
 *     summary: Update user privacy settings
 *     description: Updates privacy settings for a specific user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User unique identifier
 *         example: user-123-abc
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profilePictureVisibility:
 *                 type: string
 *                 enum: [friends, friends_of_friends, all_users]
 *                 example: friends
 *               bioVisibility:
 *                 type: string
 *                 enum: [friends, friends_of_friends, all_users]
 *                 example: friends_of_friends
 *               contactDetailsVisibility:
 *                 type: string
 *                 enum: [friends, friends_of_friends, all_users]
 *                 example: friends
 *               friendsListVisibility:
 *                 type: string
 *                 enum: [friends, friends_of_friends, all_users]
 *                 example: friends
 *               userDiscoverability:
 *                 type: string
 *                 enum: [none, friends_of_friends, all_users]
 *                 example: all_users
 *     responses:
 *       200:
 *         description: Privacy settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profilePictureVisibility:
 *                   type: string
 *                   enum: [friends, friends_of_friends, all_users]
 *                 bioVisibility:
 *                   type: string
 *                   enum: [friends, friends_of_friends, all_users]
 *                 contactDetailsVisibility:
 *                   type: string
 *                   enum: [friends, friends_of_friends, all_users]
 *                 friendsListVisibility:
 *                   type: string
 *                   enum: [friends, friends_of_friends, all_users]
 *                 userDiscoverability:
 *                   type: string
 *                   enum: [none, friends_of_friends, all_users]
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
router.put('/:id/privacy-settings', checkDatabaseConfig, async (req, res) => {
  try {
    const privacySettings = req.body;
    
    // Validate privacy setting values
    const validVisibilityOptions = ['friends', 'friends_of_friends', 'all_users'];
    const validDiscoverabilityOptions = ['none', 'friends_of_friends', 'all_users'];
    
    // Validate each setting if provided
    if (privacySettings.profilePictureVisibility && !validVisibilityOptions.includes(privacySettings.profilePictureVisibility)) {
      return res.status(400).json({ error: 'Invalid profilePictureVisibility value' });
    }
    if (privacySettings.bioVisibility && !validVisibilityOptions.includes(privacySettings.bioVisibility)) {
      return res.status(400).json({ error: 'Invalid bioVisibility value' });
    }
    if (privacySettings.contactDetailsVisibility && !validVisibilityOptions.includes(privacySettings.contactDetailsVisibility)) {
      return res.status(400).json({ error: 'Invalid contactDetailsVisibility value' });
    }
    if (privacySettings.friendsListVisibility && !validVisibilityOptions.includes(privacySettings.friendsListVisibility)) {
      return res.status(400).json({ error: 'Invalid friendsListVisibility value' });
    }
    if (privacySettings.userDiscoverability && !validDiscoverabilityOptions.includes(privacySettings.userDiscoverability)) {
      return res.status(400).json({ error: 'Invalid userDiscoverability value' });
    }

    // Get current user to merge privacy settings
    const userResult = await userService.getById(req.params.id);
    if (!userResult.success) {
      return res.status(404).json({ error: userResult.error });
    }

    const currentUser = userResult.data;
    const updatedPrivacySettings = {
      ...currentUser.privacySettings,
      ...privacySettings
    };

    const result = await userService.update(req.params.id, {
      privacySettings: updatedPrivacySettings
    });
    
    if (result.success) {
      res.json(result.data.privacySettings);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;