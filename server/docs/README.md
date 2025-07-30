# OpenAPI Specification for Crispy Goggles Backend

This directory contains the OpenAPI (Swagger) specification and related tooling for the Crispy Goggles Backend API.

## 📖 Overview

The OpenAPI specification provides comprehensive documentation for all backend API endpoints, including:

- **System endpoints**: Health checks and API information
- **Authentication endpoints**: Azure CIAM integration for login/signup
- **Database endpoints**: Database status and configuration
- **User endpoints**: Complete user management CRUD operations
- **Group endpoints**: Group management and membership operations

## 🔗 Quick Access

When the server is running, you can access:

- **Interactive API Documentation (Swagger UI)**: `http://localhost:5000/api-docs`
- **OpenAPI Specification (JSON)**: `http://localhost:5000/api-spec`

## 🛠️ Available Scripts

```bash
# Validate the OpenAPI specification
npm run validate:openapi

# Generate OpenAPI specification file
npm run openapi:generate

# Run OpenAPI-specific tests
npm run test:openapi

# Lint OpenAPI specification (requires redocly config)
npm run openapi:lint

# Bundle OpenAPI specification
npm run openapi:bundle
```

## 🔄 Automatic Validation

The OpenAPI specification is automatically validated in several ways:

### 1. Pre-test Validation
Every time you run `npm test`, the OpenAPI specification is validated first via the `pretest` script.

### 2. CI/CD Validation
GitHub Actions automatically validates the specification on every push and pull request that affects the server code.

### 3. Test Coverage
Comprehensive Jest tests ensure:
- All endpoints are documented
- All schemas are properly defined
- All responses are specified
- OpenAPI 3.0 compliance

## 📊 Specification Structure

### Generated from Code
The specification is generated from JSDoc comments in the actual route files, ensuring it stays in sync with the implementation.

### Schema Definitions
All data models are defined with proper types, required fields, and examples:
- `User`: User account information
- `Group`: Group details and membership
- `Error`: Standardized error responses
- `HealthCheck`: System health status
- `DatabaseStatus`: Database connection status
- `AuthStatus`: Authentication configuration status

### Response Definitions
Standardized response patterns for:
- Success responses (200, 201)
- Client errors (400, 401, 404, 409)
- Server errors (500, 503)

## 🏷️ Endpoint Organization

Endpoints are organized by functional tags:

- **System**: Basic API information and health checks
- **Authentication**: Azure CIAM authentication flow
- **Database**: Database configuration and status
- **Users**: User management operations
- **Groups**: Group and membership management

## 🚀 Adding New Endpoints

To add a new endpoint to the OpenAPI specification:

1. **Add JSDoc comments** to your route handler:
```javascript
/**
 * @swagger
 * /api/new-endpoint:
 *   get:
 *     tags: [YourTag]
 *     summary: Brief description
 *     description: Detailed description
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/YourSchema'
 */
router.get('/new-endpoint', (req, res) => {
  // Your implementation
});
```

2. **Add schema definitions** if needed in `config/openapi.js`

3. **Update validation script** in `scripts/validate-openapi.js` to include the new endpoint

4. **Run validation** to ensure everything is correct:
```bash
npm run validate:openapi
npm run test:openapi
```

## 🔧 Configuration

The OpenAPI configuration is in `config/openapi.js` and includes:

- API metadata (title, version, description)
- Server definitions (development and production)
- Security schemes (Bearer and OAuth2)
- Component schemas and responses
- Tag definitions

## ✅ Validation Checks

The validation script performs comprehensive checks:

- **Structure validation**: Ensures valid OpenAPI 3.0 format
- **Endpoint coverage**: Verifies all expected endpoints are documented
- **Schema validation**: Confirms all required schemas are defined
- **Response validation**: Ensures all endpoints have response definitions
- **Tag validation**: Verifies all expected tags are present

## 🔄 Continuous Sync

The specification stays automatically synchronized with the actual API through:

1. **JSDoc comments**: Documentation is embedded in the code
2. **Automatic generation**: Specification is generated from the actual routes
3. **Pre-test validation**: Ensures spec is always current before tests run
4. **CI validation**: Prevents breaking changes from being merged

## 📈 Benefits

This approach provides:

- **Always up-to-date documentation**: Generated from actual code
- **Interactive exploration**: Swagger UI for easy testing
- **Type safety**: Comprehensive schema definitions
- **CI integration**: Automated validation prevents drift
- **Developer experience**: Easy to discover and test APIs
- **Client generation**: Can be used to generate client SDKs

## 🤝 Contributing

When adding new endpoints or modifying existing ones:

1. Always add comprehensive JSDoc comments
2. Define proper schemas for request/response bodies
3. Include appropriate error responses
4. Add validation tests if needed
5. Run the validation script before committing

The OpenAPI specification is a living document that grows with the API, ensuring developers always have accurate, up-to-date documentation.