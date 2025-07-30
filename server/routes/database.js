const express = require('express');
const { testConnection, isConfigured, cosmosConfig } = require('../config/cosmosConfig');
const router = express.Router();

/**
 * @swagger
 * /database/status:
 *   get:
 *     tags: [Database]
 *     summary: Get database status
 *     description: Returns the configuration and connection status of the Cosmos DB database
 *     responses:
 *       200:
 *         description: Database status information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DatabaseStatus'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/status', async (req, res) => {
  try {
    const connectionTest = await testConnection();
    
    res.json({
      configured: isConfigured,
      connection: connectionTest,
      config: {
        endpoint: cosmosConfig.endpoint ? 'Configured' : 'Not set',
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