const express = require('express');
const { testConnection, isConfigured, cosmosConfig } = require('../config/cosmosConfig');
const router = express.Router();

// Database status endpoint
router.get('/status', async (req, res) => {
  try {
    const connectionTest = await testConnection();
    
    res.json({
      configured: isConfigured,
      connection: connectionTest,
      config: {
        endpoint: cosmosConfig.endpoint ? cosmosConfig.endpoint.split('.')[0] + '.***' : 'Not set',
        database: cosmosConfig.databaseName || 'Not set',
        hasKey: !!cosmosConfig.key
      },
      message: isConfigured 
        ? 'Cosmos DB is configured' 
        : 'Cosmos DB requires configuration. See docs/COSMOS_DB_SETUP.md'
    });
  } catch (error) {
    res.status(500).json({
      configured: isConfigured,
      connection: { success: false, error: error.message },
      message: 'Error checking database status'
    });
  }
});

module.exports = router;