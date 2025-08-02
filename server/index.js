const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const { spec } = require('./config/openapi');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Cosmos DB configuration
require('./config/cosmosConfig');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const groupRoutes = require('./routes/groups');
const friendshipRoutes = require('./routes/friendships');
const eventRoutes = require('./routes/events');
const databaseRoutes = require('./routes/database');

// Middleware
app.use(cors());
app.use(express.json());

/**
 * @swagger
 * /:
 *   get:
 *     tags: [System]
 *     summary: Get API information
 *     description: Returns basic information about the Crispy Goggles Backend API
 *     responses:
 *       200:
 *         description: API information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiInfo'
 */
app.get('/', (req, res) => {
  res.json({ 
    message: 'Crispy Goggles Backend API', 
    version: '1.0.0',
    status: 'running'
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [System]
 *     summary: Health check
 *     description: Returns the health status of the API server
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// OpenAPI/Swagger endpoints
/**
 * @swagger
 * /api-docs:
 *   get:
 *     tags: [System]
 *     summary: Interactive API documentation
 *     description: Serves the Swagger UI interface for exploring the API
 *     responses:
 *       200:
 *         description: Swagger UI interface
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec, {
  customSiteTitle: 'Crispy Goggles API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    displayRequestDuration: true,
    tryItOutEnabled: true,
    filter: true,
    docExpansion: 'list'
  }
}));

/**
 * @swagger
 * /api-spec:
 *   get:
 *     tags: [System]
 *     summary: Get OpenAPI specification
 *     description: Returns the OpenAPI 3.0 specification in JSON format
 *     responses:
 *       200:
 *         description: OpenAPI specification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: OpenAPI 3.0 specification document
 */
app.get('/api-spec', (req, res) => {
  res.json(spec);
});

// Authentication routes
app.use('/auth', authRoutes);

// Database status routes
app.use('/database', databaseRoutes);

// API routes
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/friendships', friendshipRoutes);
app.use('/api/events', eventRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});