#!/usr/bin/env node

const { spec } = require('../config/openapi');
const fs = require('fs');
const path = require('path');

/**
 * Validates the OpenAPI specification for completeness and correctness
 */
async function validateOpenAPISpec() {
  console.log('🔍 Starting OpenAPI specification validation...\n');

  try {
    // Step 1: Write spec to temporary file for validation
    const tempSpecPath = path.join(__dirname, '../tmp/openapi-spec.json');
    const tempDir = path.dirname(tempSpecPath);
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    fs.writeFileSync(tempSpecPath, JSON.stringify(spec, null, 2));
    console.log('✅ Generated OpenAPI specification file');

    // Step 2: Validate spec structure
    console.log('\n📋 Validating specification structure...');
    
    if (!spec.openapi || !spec.info || !spec.paths) {
      throw new Error('Invalid OpenAPI specification structure');
    }
    
    if (spec.openapi !== '3.0.0') {
      throw new Error(`Expected OpenAPI version 3.0.0, got ${spec.openapi}`);
    }
    
    console.log('✅ Specification structure is valid');

    // Step 3: Check endpoint coverage
    console.log('\n🌐 Checking endpoint coverage...');
    
    const expectedEndpoints = [
      { path: '/', methods: ['get'] },
      { path: '/health', methods: ['get'] },
      { path: '/api-spec', methods: ['get'] },
      { path: '/auth/login', methods: ['get'] },
      { path: '/auth/signup', methods: ['get'] },
      { path: '/auth/validate-token', methods: ['post'] },
      { path: '/auth/status', methods: ['get'] },
      { path: '/auth/logout', methods: ['post'] },
      { path: '/database/status', methods: ['get'] },
      { path: '/api/users', methods: ['get', 'post'] },
      { path: '/api/users/{id}', methods: ['get', 'put', 'delete'] },
      { path: '/api/users/search/{term}', methods: ['get'] },
      { path: '/api/users/email/{email}', methods: ['get'] },
      { path: '/api/users/azure/{azureId}', methods: ['get'] },
      { path: '/api/groups', methods: ['get', 'post'] },
      { path: '/api/groups/{id}', methods: ['get', 'put', 'delete'] },
      { path: '/api/groups/user/{userId}', methods: ['get'] },
      { path: '/api/groups/{id}/apply', methods: ['post'] },
      { path: '/api/groups/{id}/membership', methods: ['post'] }
    ];

    let missingEndpoints = [];
    
    for (const endpoint of expectedEndpoints) {
      if (!spec.paths[endpoint.path]) {
        missingEndpoints.push(`${endpoint.path} (all methods)`);
        continue;
      }
      
      for (const method of endpoint.methods) {
        if (!spec.paths[endpoint.path][method]) {
          missingEndpoints.push(`${method.toUpperCase()} ${endpoint.path}`);
        }
      }
    }
    
    if (missingEndpoints.length > 0) {
      throw new Error(`Missing endpoints in specification:\n${missingEndpoints.join('\n')}`);
    }
    
    console.log(`✅ All ${expectedEndpoints.length} expected endpoint groups are documented`);

    // Step 4: Check schema definitions
    console.log('\n📊 Checking schema definitions...');
    
    const expectedSchemas = [
      'User', 'Group', 'Error', 'HealthCheck', 'ApiInfo', 
      'DatabaseStatus', 'AuthStatus', 'AuthUrl', 'AuthValidation'
    ];
    
    let missingSchemas = [];
    
    for (const schema of expectedSchemas) {
      if (!spec.components?.schemas?.[schema]) {
        missingSchemas.push(schema);
      }
    }
    
    if (missingSchemas.length > 0) {
      throw new Error(`Missing schema definitions:\n${missingSchemas.join('\n')}`);
    }
    
    console.log(`✅ All ${expectedSchemas.length} expected schemas are defined`);

    // Step 5: Check response definitions
    console.log('\n📤 Checking response definitions...');
    
    let endpointsWithoutResponses = [];
    
    for (const [path, pathObj] of Object.entries(spec.paths)) {
      for (const [method, methodObj] of Object.entries(pathObj)) {
        if (!methodObj.responses || Object.keys(methodObj.responses).length === 0) {
          endpointsWithoutResponses.push(`${method.toUpperCase()} ${path}`);
        }
      }
    }
    
    if (endpointsWithoutResponses.length > 0) {
      throw new Error(`Endpoints without response definitions:\n${endpointsWithoutResponses.join('\n')}`);
    }
    
    console.log('✅ All endpoints have response definitions');

    // Step 6: Check tags
    console.log('\n🏷️  Checking tags...');
    
    const expectedTags = ['System', 'Authentication', 'Database', 'Users', 'Groups'];
    const definedTags = spec.tags?.map(tag => tag.name) || [];
    
    let missingTags = expectedTags.filter(tag => !definedTags.includes(tag));
    
    if (missingTags.length > 0) {
      throw new Error(`Missing tag definitions:\n${missingTags.join('\n')}`);
    }
    
    console.log(`✅ All ${expectedTags.length} expected tags are defined`);

    // Step 7: Generate summary report
    console.log('\n📈 Specification summary:');
    console.log(`   - OpenAPI version: ${spec.openapi}`);
    console.log(`   - API title: ${spec.info.title}`);
    console.log(`   - API version: ${spec.info.version}`);
    console.log(`   - Total endpoints: ${Object.keys(spec.paths).length}`);
    console.log(`   - Total schemas: ${Object.keys(spec.components?.schemas || {}).length}`);
    console.log(`   - Total tags: ${(spec.tags || []).length}`);
    console.log(`   - Total servers: ${(spec.servers || []).length}`);

    // Clean up
    fs.unlinkSync(tempSpecPath);

    console.log('\n🎉 OpenAPI specification validation completed successfully!');
    return true;

  } catch (error) {
    console.error('\n❌ OpenAPI specification validation failed:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateOpenAPISpec();
}

module.exports = { validateOpenAPISpec };