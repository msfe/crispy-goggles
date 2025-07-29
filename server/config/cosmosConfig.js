const { CosmosClient } = require('@azure/cosmos');

// Configuration for Cosmos DB
const cosmosConfig = {
  endpoint: process.env.COSMOS_DB_ENDPOINT,
  key: process.env.COSMOS_DB_KEY,
  databaseName: process.env.COSMOS_DB_DATABASE_NAME || 'CrispyGogglesDB'
};

// Check if Cosmos DB is configured
const isConfigured = !!(cosmosConfig.endpoint && cosmosConfig.key && cosmosConfig.databaseName);

let cosmosClient = null;
let database = null;

if (isConfigured) {
  try {
    // Create Cosmos DB client
    cosmosClient = new CosmosClient({
      endpoint: cosmosConfig.endpoint,
      key: cosmosConfig.key
    });

    // Get database reference
    database = cosmosClient.database(cosmosConfig.databaseName);
    
    console.log('✅ Cosmos DB client initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Cosmos DB client:', error.message);
  }
} else {
  console.warn('⚠️  Cosmos DB is not configured.');
  console.warn('Missing environment variables: COSMOS_DB_ENDPOINT, COSMOS_DB_KEY, COSMOS_DB_DATABASE_NAME');
  console.warn('Please refer to docs/COSMOS_DB_SETUP.md for setup instructions.');
}

// Collection names
const collections = {
  USERS: 'users',
  FRIENDSHIPS: 'friendships', 
  GROUPS: 'groups',
  POSTS: 'posts',
  COMMENTS: 'comments',
  EVENTS: 'events'
};

// Helper function to get a container reference
const getContainer = (collectionName) => {
  if (!database) {
    throw new Error('Database not initialized. Check Cosmos DB configuration.');
  }
  return database.container(collectionName);
};

// Connection test function
const testConnection = async () => {
  if (!isConfigured) {
    return { success: false, error: 'Cosmos DB not configured' };
  }

  try {
    // Test connection by reading database info
    const { resource: databaseInfo } = await database.read();
    return { 
      success: true, 
      database: databaseInfo.id,
      endpoint: cosmosConfig.endpoint.split('.')[0] + '.***'
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
};

module.exports = {
  cosmosClient,
  database,
  collections,
  getContainer,
  testConnection,
  isConfigured,
  cosmosConfig: {
    ...cosmosConfig,
    key: cosmosConfig.key ? '***' : undefined // Hide key in exports
  }
};