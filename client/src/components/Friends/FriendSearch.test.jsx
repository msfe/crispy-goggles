import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import FriendSearch from './FriendSearch';
import { AlertProvider } from '../Alert';

// Mock MSAL provider
vi.mock('@azure/msal-react', () => ({
  useMsal: () => ({
    accounts: [{ homeAccountId: 'mock-account-id' }]
  })
}));

// Mock the API service
vi.mock('../../services/apiService', () => ({
  UserApiService: {
    initializeUser: vi.fn().mockResolvedValue('mock-user-id'),
    searchUsers: vi.fn(),
    sendFriendRequest: vi.fn().mockResolvedValue({ success: true, message: 'Friend request sent successfully!' })
  },
  FriendshipApiService: {
    getUserFriendships: vi.fn()
  }
}));

// Test wrapper with necessary providers
const TestWrapper = ({ children, searchQuery = 'test' }) => (
  <MemoryRouter>
    <AlertProvider>
      <FriendSearch searchQuery={searchQuery} onBack={vi.fn()} />
    </AlertProvider>
  </MemoryRouter>
);

describe('FriendSearch Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('handles empty search results gracefully', async () => {
    const { UserApiService, FriendshipApiService } = await import('../../services/apiService');
    
    // Mock empty responses
    UserApiService.searchUsers.mockResolvedValue([]);
    FriendshipApiService.getUserFriendships.mockResolvedValue({
      friends: [],
      pendingRequests: [],
      sentRequests: []
    });

    render(<TestWrapper searchQuery="nonexistent" />);

    await waitFor(() => {
      expect(screen.getByText(/No users found matching/)).toBeInTheDocument();
    });
  });

  test('handles null/undefined API responses gracefully', async () => {
    const { UserApiService, FriendshipApiService } = await import('../../services/apiService');
    
    // Mock null/undefined responses
    UserApiService.searchUsers.mockResolvedValue(null);
    FriendshipApiService.getUserFriendships.mockResolvedValue({
      friends: undefined,
      pendingRequests: null,
      sentRequests: []
    });

    render(<TestWrapper searchQuery="test" />);

    await waitFor(() => {
      expect(screen.getByText(/No users found matching/)).toBeInTheDocument();
    });
  });

  test('handles malformed user objects in search results', async () => {
    const { UserApiService, FriendshipApiService } = await import('../../services/apiService');
    
    // Mock malformed responses
    UserApiService.searchUsers.mockResolvedValue([
      { id: 'user1', name: 'Valid User', email: 'valid@example.com' },
      { id: null, name: 'Invalid User' }, // Missing email and null id
      undefined, // Completely undefined user
      { name: 'No ID User', email: 'noid@example.com' }, // Missing id
      { id: 'user2', name: 'Another Valid User', email: 'valid2@example.com' }
    ]);
    FriendshipApiService.getUserFriendships.mockResolvedValue({
      friends: [],
      pendingRequests: [],
      sentRequests: []
    });

    render(<TestWrapper searchQuery="test" />);

    await waitFor(() => {
      // Should only show valid users (user1 and user2)
      expect(screen.getByText('Valid User')).toBeInTheDocument();
      expect(screen.getByText('Another Valid User')).toBeInTheDocument();
      expect(screen.getByText('Found 2 users')).toBeInTheDocument();
    });
  });

  test('filters out current user and existing relationships correctly', async () => {
    const { UserApiService, FriendshipApiService } = await import('../../services/apiService');
    
    UserApiService.searchUsers.mockResolvedValue([
      { id: 'mock-user-id', name: 'Current User', email: 'current@example.com' },
      { id: 'friend1', name: 'Existing Friend', email: 'friend@example.com' },
      { id: 'pending1', name: 'Pending Request', email: 'pending@example.com' },
      { id: 'sent1', name: 'Sent Request', email: 'sent@example.com' },
      { id: 'new-user', name: 'New User', email: 'new@example.com' }
    ]);
    FriendshipApiService.getUserFriendships.mockResolvedValue({
      friends: ['friend1'],
      pendingRequests: ['pending1'],
      sentRequests: ['sent1']
    });

    render(<TestWrapper searchQuery="test" />);

    await waitFor(() => {
      // Should only show the new user
      expect(screen.getByText('New User')).toBeInTheDocument();
      expect(screen.getByText('Found 1 user')).toBeInTheDocument();
      expect(screen.queryByText('Current User')).not.toBeInTheDocument();
      expect(screen.queryByText('Existing Friend')).not.toBeInTheDocument();
      expect(screen.queryByText('Pending Request')).not.toBeInTheDocument();
      expect(screen.queryByText('Sent Request')).not.toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    const { UserApiService, FriendshipApiService } = await import('../../services/apiService');
    
    // Mock API errors
    UserApiService.searchUsers.mockRejectedValue(new Error('API Error'));
    FriendshipApiService.getUserFriendships.mockRejectedValue(new Error('Friendship API Error'));

    render(<TestWrapper searchQuery="test" />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to search users/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry/ })).toBeInTheDocument();
    });
  });
});