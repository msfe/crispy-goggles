const swaggerJSDoc = require('swagger-jsdoc');

// OpenAPI specification configuration
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Crispy Goggles Backend API',
      version: '1.0.0',
      description: 'A privacy-focused social networking platform focused on groups and events',
      contact: {
        name: 'Crispy Goggles Team',
        url: 'https://github.com/msfe/crispy-goggles'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://crispy-goggles-backend.azurewebsites.net',
        description: 'Production server (Azure)'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        AzureAuth: {
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
              tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
              scopes: {
                'openid': 'OpenID Connect',
                'profile': 'User profile information',
                'email': 'User email address'
              }
            }
          }
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'role'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique user identifier',
              example: 'user-123-abc'
            },
            azureId: {
              type: 'string',
              description: 'Azure Active Directory user ID',
              example: 'azure-user-456-def'
            },
            name: {
              type: 'string',
              description: 'User display name',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john.doe@example.com'
            },
            bio: {
              type: 'string',
              description: 'User biography',
              example: 'Software developer passionate about privacy and social networking'
            },
            role: {
              type: 'string',
              enum: ['member', 'group_admin', 'global_admin'],
              description: 'User role in the system',
              example: 'member'
            },
            contactDetails: {
              type: 'object',
              description: 'Optional contact information visible to friends',
              properties: {
                phone: { type: 'string', example: '+1-555-123-4567' },
                location: { type: 'string', example: 'Stockholm, Sweden' }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User account creation timestamp',
              example: '2024-01-15T10:30:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last user update timestamp',
              example: '2024-01-20T14:22:00Z'
            }
          }
        },
        Group: {
          type: 'object',
          required: ['name', 'description', 'adminId'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique group identifier',
              example: 'group-789-xyz'
            },
            name: {
              type: 'string',
              description: 'Group name',
              example: 'Stockholm Tech Meetup'
            },
            description: {
              type: 'string',
              description: 'Group description',
              example: 'A community for technology enthusiasts in Stockholm'
            },
            adminId: {
              type: 'string',
              description: 'ID of the group administrator',
              example: 'user-123-abc'
            },
            members: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of member user IDs',
              example: ['user-123-abc', 'user-456-def']
            },
            membershipRequests: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of pending membership request user IDs',
              example: ['user-789-ghi']
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tags for group discovery',
              example: ['technology', 'meetup', 'stockholm']
            },
            privacy: {
              type: 'string',
              enum: ['public', 'private'],
              description: 'Group privacy setting',
              example: 'public'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Group creation timestamp',
              example: '2024-01-15T10:30:00Z'
            }
          }
        },
        Friendship: {
          type: 'object',
          required: ['userId', 'friendId', 'requestedBy', 'status'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique friendship identifier',
              example: 'friendship-123-abc'
            },
            userId: {
              type: 'string',
              description: 'ID of the first user in the friendship',
              example: 'user-123-abc'
            },
            friendId: {
              type: 'string',
              description: 'ID of the second user in the friendship',
              example: 'user-456-def'
            },
            requestedBy: {
              type: 'string',
              description: 'ID of the user who initiated the friend request',
              example: 'user-123-abc'
            },
            status: {
              type: 'string',
              enum: ['pending', 'accepted', 'rejected'],
              description: 'Current status of the friendship',
              example: 'pending'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Friendship creation timestamp',
              example: '2024-01-15T10:30:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last friendship update timestamp',
              example: '2024-01-20T14:22:00Z'
            }
          }
        },
        Error: {
          type: 'object',
          required: ['error'],
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Resource not found'
            },
            details: {
              type: 'string',
              description: 'Additional error details',
              example: 'The requested user ID does not exist'
            },
            documentation: {
              type: 'string',
              description: 'Link to relevant documentation',
              example: 'See docs/API.md for more information'
            }
          }
        },
        HealthCheck: {
          type: 'object',
          required: ['status', 'timestamp'],
          properties: {
            status: {
              type: 'string',
              example: 'OK'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-20T14:22:00Z'
            }
          }
        },
        ApiInfo: {
          type: 'object',
          required: ['message', 'version', 'status'],
          properties: {
            message: {
              type: 'string',
              example: 'Crispy Goggles Backend API'
            },
            version: {
              type: 'string',
              example: '1.0.0'
            },
            status: {
              type: 'string',
              example: 'running'
            }
          }
        },
        DatabaseStatus: {
          type: 'object',
          required: ['configured', 'connection'],
          properties: {
            configured: {
              type: 'boolean',
              description: 'Whether the database is properly configured',
              example: true
            },
            connection: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: true
                },
                error: {
                  type: 'string',
                  example: 'Connection timeout'
                }
              }
            },
            config: {
              type: 'object',
              properties: {
                endpoint: {
                  type: 'string',
                  example: 'Configured'
                },
                database: {
                  type: 'string',
                  example: 'crispy-goggles-db'
                },
                hasKey: {
                  type: 'boolean',
                  example: true
                }
              }
            },
            message: {
              type: 'string',
              example: 'Cosmos DB is configured'
            }
          }
        },
        AuthStatus: {
          type: 'object',
          required: ['configured'],
          properties: {
            configured: {
              type: 'boolean',
              description: 'Whether Azure CIAM authentication is properly configured',
              example: true
            },
            message: {
              type: 'string',
              example: 'Azure CIAM authentication is properly configured'
            }
          }
        },
        AuthUrl: {
          type: 'object',
          required: ['authUrl'],
          properties: {
            authUrl: {
              type: 'string',
              format: 'uri',
              description: 'Authorization URL for Azure CIAM authentication',
              example: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?...'
            }
          }
        },
        AuthValidation: {
          type: 'object',
          required: ['success', 'user'],
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            user: {
              type: 'object',
              properties: {
                userId: {
                  type: 'string',
                  description: 'Unique Azure user identifier',
                  example: 'azure-user-456-def'
                },
                username: {
                  type: 'string',
                  description: 'Username (typically email)',
                  example: 'john.doe@example.com'
                },
                name: {
                  type: 'string',
                  description: 'User display name',
                  example: 'John Doe'
                },
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'User email address',
                  example: 'john.doe@example.com'
                }
              }
            }
          }
        }
      },
      responses: {
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        Unauthorized: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        BadRequest: {
          description: 'Invalid request parameters',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        ServiceUnavailable: {
          description: 'Service temporarily unavailable',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'System',
        description: 'System health and information endpoints'
      },
      {
        name: 'Authentication',
        description: 'Azure CIAM authentication endpoints'
      },
      {
        name: 'Database',
        description: 'Database status and configuration endpoints'
      },
      {
        name: 'Users',
        description: 'User management operations'
      },
      {
        name: 'Groups',
        description: 'Group management and membership operations'
      },
      {
        name: 'Friendships',
        description: 'Friend request and friendship management operations'
      }
    ]
  },
  apis: [
    './index.js',
    './routes/*.js'
  ]
};

// Generate OpenAPI specification
const spec = swaggerJSDoc(options);

module.exports = { spec, options };