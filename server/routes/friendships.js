const express = require('express');
const { FriendshipService } = require('../services/databaseService');
const { Friendship } = require('../models');
const router = express.Router();

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
 * /api/friendships:
 *   post:
 *     tags: [Friendships]
 *     summary: Send friend request
 *     description: Sends a friend request from one user to another
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, friendId]
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user sending the request
 *                 example: user-123-abc
 *               friendId:
 *                 type: string
 *                 description: ID of the user to be friended
 *                 example: user-456-def
 *     responses:
 *       201:
 *         description: Friend request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Friendship'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         description: Friendship already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
router.post('/', checkDatabaseConfig, async (req, res) => {
  try {
    const { userId, friendId } = req.body;
    
    // Check if friendship already exists
    const existingFriendship = await friendshipService.checkFriendship(userId, friendId);
    if (existingFriendship.success) {
      return res.status(409).json({ error: 'Friendship request already exists' });
    }

    // Create new friendship request
    const friendshipData = {
      userId,
      friendId,
      requestedBy: userId,
      status: 'pending'
    };
    
    const friendship = new Friendship(friendshipData);
    friendship.validate();

    const result = await friendshipService.create(friendship.toJSON());
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
 * /api/friendships/{id}:
 *   put:
 *     tags: [Friendships]
 *     summary: Update friendship status
 *     description: Accept or reject a friend request
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Friendship unique identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected]
 *                 description: New status for the friendship
 *                 example: accepted
 *     responses:
 *       200:
 *         description: Friendship status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Friendship'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
router.put('/:id', checkDatabaseConfig, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "accepted" or "rejected"' });
    }

    const result = await friendshipService.update(req.params.id, { status });
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
 * /api/friendships/user/{userId}:
 *   get:
 *     tags: [Friendships]
 *     summary: Get user's friendships
 *     description: Get all friendships for a specific user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User unique identifier
 *         example: user-123-abc
 *     responses:
 *       200:
 *         description: List of user's friendships
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 friendships:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Friendship'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
router.get('/user/:userId', checkDatabaseConfig, async (req, res) => {
  try {
    const result = await friendshipService.getFriendshipsForUser(req.params.userId);
    if (result.success) {
      res.json({ friendships: result.data });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/friendships/pending/{userId}:
 *   get:
 *     tags: [Friendships]
 *     summary: Get pending friend requests
 *     description: Get all pending friend requests for a specific user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User unique identifier
 *         example: user-123-abc
 *     responses:
 *       200:
 *         description: List of pending friend requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 requests:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Friendship'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
router.get('/pending/:userId', checkDatabaseConfig, async (req, res) => {
  try {
    const result = await friendshipService.getPendingRequests(req.params.userId);
    if (result.success) {
      res.json({ requests: result.data });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;