import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserProfilePage from './UserProfilePage';

// Mock the MSAL React hooks
vi.mock('@azure/msal-react', () => ({
  useMsal: () => ({
    accounts: [{ homeAccountId: 'test-account-id' }]
  })
}));

// Mock the API service
vi.mock('../../services/apiService', () => ({
  UserApiService: {
    initializeUser: vi.fn().mockResolvedValue('mock-user-id-123'),
    getUserById: vi.fn().mockResolvedValue({
      id: 'friend-1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      bio: 'Passionate about technology and coffee.',
      contactDetails: {
        phone: '+1-555-123-4567',
        location: 'Stockholm, Sweden'
      },
      createdAt: '2023-01-15T10:30:00Z'
    }),
    sendFriendRequest: vi.fn().mockResolvedValue({
      success: true,
      message: 'Friend request sent successfully!'
    })
  }
}));

// Mock fetch for mutual friends and friendship status
global.fetch = vi.fn();

const renderWithRouter = (userId = 'friend-1') => {
  return render(
    <MemoryRouter initialEntries={[`/user/${userId}`]}>
      <Routes>
        <Route path="/user/:userId" element={<UserProfilePage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('UserProfilePage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock fetch responses
    global.fetch.mockImplementation((url) => {
      if (url.includes('mutual-friends')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            mutualFriends: [
              { id: 'friend-2', name: 'Bob Wilson' },
              { id: 'friend-3', name: 'Charlie Brown' }
            ],
            count: 2
          })
        });
      }
      if (url.includes('friendship-status')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'none' })
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  it('renders user profile page with loading state initially', () => {
    renderWithRouter();
    
    expect(screen.getByText('Loading user profile...')).toBeDefined();
  });

  it('displays user profile information after loading', async () => {
    renderWithRouter();
    
    // Wait for the profile to load
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeDefined();
    }, { timeout: 3000 });
    
    expect(screen.getByText('alice@example.com')).toBeDefined();
    expect(screen.getByText('Passionate about technology and coffee.')).toBeDefined();
  });

  it('shows back button', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('← Back')).toBeDefined();
    }, { timeout: 3000 });
  });

  it('shows Add Friend button for non-friends', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeDefined();
    }, { timeout: 3000 });
    
    expect(screen.getByText('Add Friend')).toBeDefined();
  });

  it('shows contact details section', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeDefined();
    }, { timeout: 3000 });
    
    expect(screen.getByText('Contact Information')).toBeDefined();
    expect(screen.getByText('phone:')).toBeDefined();
    expect(screen.getByText('+1-555-123-4567')).toBeDefined();
  });

  it('shows mutual friends section', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeDefined();
    }, { timeout: 3000 });
    
    expect(screen.getByText('Mutual Friends (2)')).toBeDefined();
    expect(screen.getByText('Bob Wilson')).toBeDefined();
    expect(screen.getByText('Charlie Brown')).toBeDefined();
  });
});