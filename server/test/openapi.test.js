const request = require('supertest');
const express = require('express');
const { spec } = require('../config/openapi');
const OpenAPIValidator = require('express-openapi-validator');

// Create a test app with the same routes as the main app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Import the main routes
  const authRoutes = require('../routes/auth');
  const userRoutes = require('../routes/users');
  const groupRoutes = require('../routes/groups');
  const databaseRoutes = require('../routes/database');

  // Add routes
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Crispy Goggles Backend API', 
      version: '1.0.0',
      status: 'running'
    });
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  app.get('/api-spec', (req, res) => {
    res.json(spec);
  });

  app.use('/auth', authRoutes);
  app.use('/database', databaseRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/groups', groupRoutes);

  return app;
};

describe('OpenAPI Specification', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('OpenAPI Spec Generation', () => {
    test('should generate valid OpenAPI 3.0 specification', () => {
      expect(spec).toBeDefined();
      expect(spec.openapi).toBe('3.0.0');
      expect(spec.info).toBeDefined();
      expect(spec.info.title).toBe('Crispy Goggles Backend API');
      expect(spec.info.version).toBe('1.0.0');
      expect(spec.paths).toBeDefined();
    });

    test('should include all main endpoints', () => {
      const paths = Object.keys(spec.paths);
      
      // System endpoints
      expect(paths).toContain('/');
      expect(paths).toContain('/health');
      expect(paths).toContain('/api-spec');
      
      // Authentication endpoints
      expect(paths).toContain('/auth/login');
      expect(paths).toContain('/auth/signup');
      expect(paths).toContain('/auth/validate-token');
      expect(paths).toContain('/auth/status');
      expect(paths).toContain('/auth/logout');
      
      // Database endpoints
      expect(paths).toContain('/database/status');
      
      // User endpoints
      expect(paths).toContain('/api/users');
      expect(paths).toContain('/api/users/{id}');
      expect(paths).toContain('/api/users/search/{term}');
      expect(paths).toContain('/api/users/email/{email}');
      expect(paths).toContain('/api/users/azure/{azureId}');
      
      // Group endpoints
      expect(paths).toContain('/api/groups');
      expect(paths).toContain('/api/groups/{id}');
      expect(paths).toContain('/api/groups/user/{userId}');
      expect(paths).toContain('/api/groups/{id}/apply');
      expect(paths).toContain('/api/groups/{id}/membership');
    });

    test('should include all required HTTP methods', () => {
      // Test a few key endpoints have the right methods
      expect(spec.paths['/']['get']).toBeDefined();
      expect(spec.paths['/health']['get']).toBeDefined();
      
      expect(spec.paths['/auth/login']['get']).toBeDefined();
      expect(spec.paths['/auth/validate-token']['post']).toBeDefined();
      
      expect(spec.paths['/api/users']['get']).toBeDefined();
      expect(spec.paths['/api/users']['post']).toBeDefined();
      expect(spec.paths['/api/users/{id}']['get']).toBeDefined();
      expect(spec.paths['/api/users/{id}']['put']).toBeDefined();
      expect(spec.paths['/api/users/{id}']['delete']).toBeDefined();
      
      expect(spec.paths['/api/groups']['get']).toBeDefined();
      expect(spec.paths['/api/groups']['post']).toBeDefined();
      expect(spec.paths['/api/groups/{id}']['get']).toBeDefined();
      expect(spec.paths['/api/groups/{id}']['put']).toBeDefined();
      expect(spec.paths['/api/groups/{id}']['delete']).toBeDefined();
    });

    test('should include proper response schemas', () => {
      expect(spec.components.schemas).toBeDefined();
      expect(spec.components.schemas.User).toBeDefined();
      expect(spec.components.schemas.Group).toBeDefined();
      expect(spec.components.schemas.Error).toBeDefined();
      expect(spec.components.schemas.HealthCheck).toBeDefined();
      expect(spec.components.schemas.ApiInfo).toBeDefined();
      expect(spec.components.schemas.DatabaseStatus).toBeDefined();
      expect(spec.components.schemas.AuthStatus).toBeDefined();
      expect(spec.components.schemas.AuthUrl).toBeDefined();
      expect(spec.components.schemas.AuthValidation).toBeDefined();
    });

    test('should include proper tags', () => {
      expect(spec.tags).toBeDefined();
      const tagNames = spec.tags.map(tag => tag.name);
      expect(tagNames).toContain('System');
      expect(tagNames).toContain('Authentication');
      expect(tagNames).toContain('Database');
      expect(tagNames).toContain('Users');
      expect(tagNames).toContain('Groups');
    });
  });

  describe('API Endpoint Availability', () => {
    test('should serve OpenAPI specification at /api-spec', async () => {
      const response = await request(app)
        .get('/api-spec')
        .expect(200);

      expect(response.body.openapi).toBe('3.0.0');
      expect(response.body.info.title).toBe('Crispy Goggles Backend API');
    });

    test('should serve basic system endpoints', async () => {
      // Test root endpoint
      const rootResponse = await request(app)
        .get('/')
        .expect(200);
      
      expect(rootResponse.body.message).toBe('Crispy Goggles Backend API');
      expect(rootResponse.body.version).toBe('1.0.0');
      expect(rootResponse.body.status).toBe('running');

      // Test health endpoint
      const healthResponse = await request(app)
        .get('/health')
        .expect(200);
      
      expect(healthResponse.body.status).toBe('OK');
      expect(healthResponse.body.timestamp).toBeDefined();
    });
  });

  describe('Schema Validation', () => {
    test('User schema should have all required fields', () => {
      const userSchema = spec.components.schemas.User;
      expect(userSchema.required).toContain('name');
      expect(userSchema.required).toContain('email');
      expect(userSchema.required).toContain('role');
      
      expect(userSchema.properties.id).toBeDefined();
      expect(userSchema.properties.azureId).toBeDefined();
      expect(userSchema.properties.name).toBeDefined();
      expect(userSchema.properties.email).toBeDefined();
      expect(userSchema.properties.bio).toBeDefined();
      expect(userSchema.properties.role).toBeDefined();
      expect(userSchema.properties.contactDetails).toBeDefined();
      expect(userSchema.properties.createdAt).toBeDefined();
      expect(userSchema.properties.updatedAt).toBeDefined();
    });

    test('Group schema should have all required fields', () => {
      const groupSchema = spec.components.schemas.Group;
      expect(groupSchema.required).toContain('name');
      expect(groupSchema.required).toContain('description');
      expect(groupSchema.required).toContain('adminId');
      
      expect(groupSchema.properties.id).toBeDefined();
      expect(groupSchema.properties.name).toBeDefined();
      expect(groupSchema.properties.description).toBeDefined();
      expect(groupSchema.properties.adminId).toBeDefined();
      expect(groupSchema.properties.members).toBeDefined();
      expect(groupSchema.properties.membershipRequests).toBeDefined();
      expect(groupSchema.properties.tags).toBeDefined();
      expect(groupSchema.properties.privacy).toBeDefined();
      expect(groupSchema.properties.createdAt).toBeDefined();
    });

    test('Error schema should have proper structure', () => {
      const errorSchema = spec.components.schemas.Error;
      expect(errorSchema.required).toContain('error');
      expect(errorSchema.properties.error).toBeDefined();
      expect(errorSchema.properties.details).toBeDefined();
      expect(errorSchema.properties.documentation).toBeDefined();
    });
  });
});