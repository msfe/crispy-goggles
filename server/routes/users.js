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

// Get all users
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

// Get user by ID
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

// Create new user
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

// Update user
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

// Delete user
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

// Search users
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

// Get user by email
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

// Get user by Azure ID
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

module.exports = router;