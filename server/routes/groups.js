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

// Get all public groups
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

// Get group by ID
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

// Create new group
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

// Update group
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

// Delete group
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

// Search groups
router.get('/search/:term', checkDatabaseConfig, async (req, res) => {
  try {
    const result = await groupService.search(req.params.term);
    if (result.success) {
      res.json({ groups: result.data });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get groups for a user
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

// Apply for group membership
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

// Accept/reject membership request
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