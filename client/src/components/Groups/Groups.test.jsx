import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Groups from './Groups.jsx';
import { AlertProvider } from '../Alert/AlertProvider';
import * as apiService from '../../services/apiService';

// Mock the API service
vi.mock('../../services/apiService', () => ({
  GroupApiService: {
    getPublicGroups: vi.fn(),
    getUserGroups: vi.fn(),
    searchByTags: vi.fn(),
    createGroup: vi.fn(),
    applyForMembership: vi.fn()
  }
}));

const mockGroups = [
  {
    id: 'group-1',
    name: 'Test Group 1',
    description: 'A test group for testing',
    tags: ['test', 'group'],
    adminIds: ['admin-1'],
    memberIds: ['admin-1', 'user-1'],
    membershipRequests: [],
    isPublic: true,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'group-2',
    name: 'Test Group 2',
    description: 'Another test group',
    tags: ['test', 'example'],
    adminIds: ['admin-2'],
    memberIds: ['admin-2'],
    membershipRequests: ['test-user'],
    isPublic: true,
    createdAt: '2024-01-20T14:30:00Z'
  }
];

const renderWithProvider = (component) => {
  return render(
    <AlertProvider>
      {component}
    </AlertProvider>
  );
};

describe('Groups Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiService.GroupApiService.getPublicGroups.mockResolvedValue(mockGroups);
    apiService.GroupApiService.getUserGroups.mockResolvedValue([]);
  });

  test('renders groups interface', async () => {
    renderWithProvider(<Groups currentUserId="test-user" />);
    
    // Check for main elements
    expect(screen.getByText('Groups')).toBeInTheDocument();
    expect(screen.getByText('Create Group')).toBeInTheDocument();
    expect(screen.getByText('Discover Groups')).toBeInTheDocument();
    expect(screen.getByText(/My Groups/)).toBeInTheDocument();
    
    // Wait for groups to load
    await waitFor(() => {
      expect(screen.getByText('Test Group 1')).toBeInTheDocument();
    });
  });

  test('displays loading state initially', () => {
    renderWithProvider(<Groups currentUserId="test-user" />);
    expect(screen.getByText('Loading groups...')).toBeInTheDocument();
  });

  test('switches between tabs', async () => {
    renderWithProvider(<Groups currentUserId="test-user" />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test Group 1')).toBeInTheDocument();
    });

    // Switch to My Groups tab
    fireEvent.click(screen.getByText(/My Groups/));
    
    // Should show empty state for user groups
    await waitFor(() => {
      expect(screen.getByText(/You haven't joined any groups yet/)).toBeInTheDocument();
    });
  });

  test('performs search by tags', async () => {
    apiService.GroupApiService.searchByTags.mockResolvedValue([mockGroups[0]]);
    
    renderWithProvider(<Groups currentUserId="test-user" />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test Group 1')).toBeInTheDocument();
    });

    // Enter search tags
    const searchInput = screen.getByPlaceholderText(/Search by tags/);
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Click search button
    fireEvent.click(screen.getByText('Search'));
    
    await waitFor(() => {
      expect(apiService.GroupApiService.searchByTags).toHaveBeenCalledWith(['test'], 'test-user');
    });
  });

  test('opens create group modal', async () => {
    renderWithProvider(<Groups currentUserId="test-user" />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test Group 1')).toBeInTheDocument();
    });

    // Click create group button
    fireEvent.click(screen.getByText('Create Group'));
    
    // Check if modal opens
    expect(screen.getByText('Create New Group')).toBeInTheDocument();
    expect(screen.getByLabelText('Group Name *')).toBeInTheDocument();
  });

  test('creates a new group', async () => {
    apiService.GroupApiService.createGroup.mockResolvedValue({
      success: true,
      message: 'Group created successfully!'
    });

    renderWithProvider(<Groups currentUserId="test-user" />);
    
    // Wait for initial load and open modal
    await waitFor(() => {
      expect(screen.getByText('Test Group 1')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Create Group'));
    
    // Fill in form
    fireEvent.change(screen.getByLabelText('Group Name *'), {
      target: { value: 'New Test Group' }
    });
    fireEvent.change(screen.getByLabelText('Description *'), {
      target: { value: 'A new test group' }
    });
    fireEvent.change(screen.getByLabelText('Tags'), {
      target: { value: 'test, new' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Create Group' }));
    
    await waitFor(() => {
      expect(apiService.GroupApiService.createGroup).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Test Group',
          description: 'A new test group',
          tags: ['test', 'new'],
          adminId: 'test-user'
        }),
        'test-user'
      );
    });
  });

  test('applies for group membership', async () => {
    apiService.GroupApiService.applyForMembership.mockResolvedValue({
      success: true,
      message: 'Membership request submitted!'
    });

    renderWithProvider(<Groups currentUserId="test-user" />);
    
    // Wait for groups to load
    await waitFor(() => {
      expect(screen.getByText('Test Group 1')).toBeInTheDocument();
    });

    // Find and click join button for a group the user is not a member of
    const joinButtons = screen.getAllByText('Join Group');
    fireEvent.click(joinButtons[0]);
    
    await waitFor(() => {
      expect(apiService.GroupApiService.applyForMembership).toHaveBeenCalledWith(
        'group-1',
        'test-user'
      );
    });
  });

  test('shows correct status for different group memberships', async () => {
    // Mock user groups - user is member of group-1
    apiService.GroupApiService.getUserGroups.mockResolvedValue([mockGroups[0]]);
    
    renderWithProvider(<Groups currentUserId="user-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Group 1')).toBeInTheDocument();
    });

    // User should see "Member" status for group-1
    expect(screen.getByText('Member')).toBeInTheDocument();
    
    // User should see "Request Pending" for group-2 (has pending request)
    expect(screen.getByText('Request Pending')).toBeInTheDocument();
  });
});