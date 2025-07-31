const express = require('express');
const { UserService, FriendshipService } = require('../services/databaseService');
const { User } = require('../models');
const router = express.Router();

const userService = new UserService();
const friendshipService = new FriendshipService();

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
 * /api/users/{userId}/mutual-friends/{currentUserId}:
 *   get:
 *     tags: [Users]
 *     summary: Get mutual friends between two users
 *     description: Retrieves a list of mutual friends between the specified user and current user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Target user's unique identifier
 *         example: user-123-abc
 *       - in: path
 *         name: currentUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: Current user's unique identifier
 *         example: user-456-def
 *     responses:
 *       200:
 *         description: List of mutual friends
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mutualFriends:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 count:
 *                   type: integer
 *                   description: Number of mutual friends
 *                   example: 5
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
router.get('/:userId/mutual-friends/:currentUserId', checkDatabaseConfig, async (req, res) => {
  try {
    const { userId, currentUserId } = req.params;

    // Get friendships for both users
    const userFriendshipsResult = await friendshipService.getFriendshipsForUser(userId);
    const currentUserFriendshipsResult = await friendshipService.getFriendshipsForUser(currentUserId);

    if (!userFriendshipsResult.success || !currentUserFriendshipsResult.success) {
      return res.status(500).json({ error: 'Failed to fetch friendships' });
    }

    // Extract accepted friend IDs for both users
    const userFriends = userFriendshipsResult.data
      .filter(f => f.status === 'accepted')
      .map(f => f.userId === userId ? f.friendId : f.userId);
    
    const currentUserFriends = currentUserFriendshipsResult.data
      .filter(f => f.status === 'accepted')
      .map(f => f.userId === currentUserId ? f.friendId : f.userId);

    // Find mutual friends (intersection of both friend lists)
    const mutualFriendIds = userFriends.filter(id => currentUserFriends.includes(id));

    // Get user details for mutual friends
    if (mutualFriendIds.length === 0) {
      return res.json({ mutualFriends: [], count: 0 });
    }

    const mutualFriendsResult = await userService.batchGetUsers(mutualFriendIds);
    if (!mutualFriendsResult.success) {
      return res.status(500).json({ error: 'Failed to fetch mutual friends details' });
    }

    res.json({
      mutualFriends: mutualFriendsResult.data,
      count: mutualFriendsResult.data.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/users/{userId}/friendship-status/{currentUserId}:
 *   get:
 *     tags: [Users]
 *     summary: Get friendship status between two users
 *     description: Check the friendship status between the specified user and current user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Target user's unique identifier
 *         example: user-123-abc
 *       - in: path
 *         name: currentUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: Current user's unique identifier
 *         example: user-456-def
 *     responses:
 *       200:
 *         description: Friendship status information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [none, pending, accepted, rejected]
 *                   description: Current friendship status
 *                   example: accepted
 *                 friendship:
 *                   $ref: '#/components/schemas/Friendship'
 *                   description: Friendship object if one exists
 *       404:
 *         description: No friendship found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: none
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
router.get('/:userId/friendship-status/:currentUserId', checkDatabaseConfig, async (req, res) => {
  try {
    const { userId, currentUserId } = req.params;

    // Check if friendship exists between the two users
    const friendshipResult = await friendshipService.checkFriendship(userId, currentUserId);
    
    if (friendshipResult.success) {
      res.json({
        status: friendshipResult.data.status,
        friendship: friendshipResult.data
      });
    } else {
      res.json({ status: 'none' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;