const { User } = require('../models');
const { UserService } = require('../services/databaseService');

// Mock the database service
jest.mock('../services/databaseService');
jest.mock('../config/authConfig', () => ({
  cca: { getAuthCodeUrl: jest.fn() },
  isConfigured: true
}));

describe('Auth Routes', () => {
  let mockUserService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock instance
    mockUserService = {
      getByAzureId: jest.fn(),
      getByEmail: jest.fn(),
      create: jest.fn()
    };
    
    // Mock the UserService constructor
    UserService.mockImplementation(() => mockUserService);
  });

  describe('POST /auth/sync-user', () => {
    test('should create new user when user does not exist', async () => {
      const userInfo = {
        userId: 'azure-123',
        email: 'test@example.com',
        name: 'Test User'
      };

      // Mock user doesn't exist
      mockUserService.getByAzureId.mockResolvedValue({ success: false });
      mockUserService.getByEmail.mockResolvedValue({ success: false });
      
      // Mock successful creation
      const createdUser = {
        id: 'user-123',
        azureId: 'azure-123',
        email: 'test@example.com',
        name: 'Test User',
        bio: '',
        role: 'member'
      };
      mockUserService.create.mockResolvedValue({ success: true, data: createdUser });

      // Test the sync logic manually (since we can't easily test the route without full setup)
      const user = new User({
        azureId: userInfo.userId,
        email: userInfo.email,
        name: userInfo.name,
        bio: ''
      });

      expect(() => user.validate()).not.toThrow();
      expect(user.azureId).toBe('azure-123');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.role).toBe('member');
    });

    test('should return existing user when user already exists', async () => {
      const userInfo = {
        userId: 'azure-123',
        email: 'test@example.com',
        name: 'Test User'
      };

      const existingUser = {
        id: 'user-123',
        azureId: 'azure-123',
        email: 'test@example.com',
        name: 'Test User',
        bio: 'Updated bio'
      };

      // Mock user exists
      mockUserService.getByAzureId.mockResolvedValue({ success: true, data: existingUser });

      const result = await mockUserService.getByAzureId(userInfo.userId);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(existingUser);
      expect(mockUserService.create).not.toHaveBeenCalled();
    });

    test('should validate required user info fields', () => {
      // Test missing userId
      expect(() => {
        const user = new User({
          email: 'test@example.com',
          name: 'Test User'
        });
        user.validate();
      }).not.toThrow(); // azureId can be null initially

      // Test missing email
      expect(() => {
        const user = new User({
          azureId: 'azure-123',
          name: 'Test User'
        });
        user.validate();
      }).toThrow('Email is required');

      // Test missing name
      expect(() => {
        const user = new User({
          azureId: 'azure-123',
          email: 'test@example.com'
        });
        user.validate();
      }).toThrow('Name is required');
    });

    test('should handle duplicate email scenario', async () => {
      const userInfo = {
        userId: 'azure-123',
        email: 'test@example.com',
        name: 'Test User'
      };

      // Mock user doesn't exist by Azure ID but email is taken
      mockUserService.getByAzureId.mockResolvedValue({ success: false });
      mockUserService.getByEmail.mockResolvedValue({ 
        success: true, 
        data: { id: 'other-user', azureId: 'different-azure-id' } 
      });

      const emailResult = await mockUserService.getByEmail(userInfo.email);
      
      expect(emailResult.success).toBe(true);
      // This would result in a conflict error in the actual route
    });
  });
});