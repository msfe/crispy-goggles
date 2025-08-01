const express = require('express');
const { GroupService } = require('../services/databaseService');
const { Group } = require('../models');
const router = express.Router();

const groupService = new GroupService();

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
 * /api/groups:
 *   get:
 *     tags: [Groups]
 *     summary: Get all public groups
 *     description: Retrieves a list of all public groups in the system
 *     responses:
 *       200:
 *         description: List of public groups
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groups:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Group'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
router.get('/', checkDatabaseConfig, async (req, res) => {
  try {
    const result = await groupService.getPublicGroups();
    if (result.success) {
      res.json({ groups: result.data });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/groups/{id}:
 *   get:
 *     tags: [Groups]
 *     summary: Get group by ID
 *     description: Retrieves a specific group by its unique identifier
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group unique identifier
 *         example: group-789-xyz
 *     responses:
 *       200:
 *         description: Group information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
router.get('/:id', checkDatabaseConfig, async (req, res) => {
  try {
    const result = await groupService.getById(req.params.id);
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
 * /api/groups:
 *   post:
 *     tags: [Groups]
 *     summary: Create new group
 *     description: Creates a new group in the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, adminId]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Stockholm Tech Meetup
 *               description:
 *                 type: string
 *                 example: A community for technology enthusiasts in Stockholm
 *               adminId:
 *                 type: string
 *                 example: user-123-abc
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [technology, meetup, stockholm]
 *               privacy:
 *                 type: string
 *                 enum: [public, private]
 *                 example: public
 *     responses:
 *       201:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
router.post('/', checkDatabaseConfig, async (req, res) => {
  try {
    const groupData = req.body;
    const group = new Group(groupData);
    
    // Validate group data
    group.validate();

    const result = await groupService.create(group.toJSON());
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
 * /api/groups/{id}:
 *   put:
 *     tags: [Groups]
 *     summary: Update group
 *     description: Updates an existing group's information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group unique identifier
 *         example: group-789-xyz
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Group Name
 *               description:
 *                 type: string
 *                 example: Updated group description
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [technology, community, updated]
 *               privacy:
 *                 type: string
 *                 enum: [public, private]
 *                 example: private
 *     responses:
 *       200:
 *         description: Group updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
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

    const result = await groupService.update(req.params.id, updates);
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
 * /api/groups/{id}:
 *   delete:
 *     tags: [Groups]
 *     summary: Delete group
 *     description: Deletes a group from the system
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group unique identifier
 *         example: group-789-xyz
 *     responses:
 *       200:
 *         description: Group deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Group deleted successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
router.delete('/:id', checkDatabaseConfig, async (req, res) => {
  try {
    const result = await groupService.delete(req.params.id);
    if (result.success) {
      res.json({ message: 'Group deleted successfully' });
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/groups/search:
 *   get:
 *     tags: [Groups]
 *     summary: Search groups by tags
 *     description: Searches for groups that contain any of the specified tags
 *     parameters:
 *       - in: query
 *         name: tags
 *         required: true
 *         schema:
 *           type: string
 *         description: Comma-separated list of tags to search for
 *         example: technology,meetup,stockholm
 *     responses:
 *       200:
 *         description: List of matching groups
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groups:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Group'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
router.get('/search', checkDatabaseConfig, async (req, res) => {
  try {
    const { tags } = req.query;
    if (!tags) {
      return res.status(400).json({ error: 'Tags parameter is required' });
    }

    const tagsArray = tags.split(',').map(tag => tag.trim().toLowerCase());
    const result = await groupService.searchByTags(tagsArray);
    
    if (result.success) {
      res.json({ groups: result.data });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/groups/user/{userId}:
 *   get:
 *     tags: [Groups]
 *     summary: Get groups for a user
 *     description: Retrieves all groups that a user is a member of
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
 *         description: List of user's groups
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groups:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Group'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
router.get('/user/:userId', checkDatabaseConfig, async (req, res) => {
  try {
    const result = await groupService.getGroupsForUser(req.params.userId);
    if (result.success) {
      res.json({ groups: result.data });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/groups/{id}/apply:
 *   post:
 *     tags: [Groups]
 *     summary: Apply for group membership
 *     description: Submits a membership request to join a group
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group unique identifier
 *         example: group-789-xyz
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user requesting membership
 *                 example: user-123-abc
 *     responses:
 *       200:
 *         description: Membership request submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Membership request submitted
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
router.post('/:id/apply', checkDatabaseConfig, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get the group
    const groupResult = await groupService.getById(req.params.id);
    if (!groupResult.success) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const group = new Group(groupResult.data);
    group.addMembershipRequest(userId);

    const result = await groupService.update(req.params.id, group.toJSON());
    if (result.success) {
      res.json({ message: 'Membership request submitted' });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/groups/{id}/membership:
 *   post:
 *     tags: [Groups]
 *     summary: Accept or reject membership request
 *     description: Allows group admins to accept or reject pending membership requests
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group unique identifier
 *         example: group-789-xyz
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, action]
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user whose membership request is being processed
 *                 example: user-456-def
 *               action:
 *                 type: string
 *                 enum: [accept, reject]
 *                 description: Action to take on the membership request
 *                 example: accept
 *     responses:
 *       200:
 *         description: Membership request processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Membership request accepted
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */
router.post('/:id/membership', checkDatabaseConfig, async (req, res) => {
  try {
    const { userId, action } = req.body; // action: 'accept' or 'reject'
    
    if (!userId || !action) {
      return res.status(400).json({ error: 'User ID and action are required' });
    }

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Use "accept" or "reject"' });
    }

    // Get the group
    const groupResult = await groupService.getById(req.params.id);
    if (!groupResult.success) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const group = new Group(groupResult.data);
    
    // Remove from membership requests
    group.membershipRequests = group.membershipRequests.filter(id => id !== userId);
    
    // If accepting, add to members
    if (action === 'accept') {
      group.addMember(userId);
    }

    const result = await groupService.update(req.params.id, group.toJSON());
    if (result.success) {
      res.json({ message: `Membership request ${action}ed` });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;