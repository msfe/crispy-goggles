import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Settings from './Settings';
import { AlertProvider } from '../Alert';

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock MSAL
vi.mock('@azure/msal-react', () => ({
  useMsal: () => ({
    accounts: [{ id: 'test-user', name: 'Test User' }]
  })
}));

// Mock UserApiService
vi.mock('../../services/apiService', () => ({
  UserApiService: {
    initializeUser: vi.fn().mockResolvedValue('mock-user-123')
  }
}));

const renderWithProviders = (component) => {
  return render(
    <AlertProvider>
      {component}
    </AlertProvider>
  );
};

describe('Settings Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful API responses
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        profilePictureVisibility: 'friends',
        bioVisibility: 'friends',
        contactDetailsVisibility: 'friends',
        friendsListVisibility: 'friends',
        userDiscoverability: 'friends_of_friends'
      })
    });
  });

  it('renders settings page with correct title', async () => {
    renderWithProviders(<Settings />);
    
    // Initially shows some form of loading
    expect(
      screen.queryByText('Initializing user...') || 
      screen.queryByText('Loading settings...')
    ).toBeInTheDocument();
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('displays privacy settings section', async () => {
    renderWithProviders(<Settings />);
    
    await waitFor(() => {
      expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    expect(screen.getByText('Control who can see different parts of your profile and how discoverable you are on the platform.')).toBeInTheDocument();
  });

  it('shows all required privacy setting cards', async () => {
    renderWithProviders(<Settings />);
    
    await waitFor(() => {
      expect(screen.getByText('Profile Picture Visibility')).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(screen.getByText('Bio Visibility')).toBeInTheDocument();
    expect(screen.getByText('Contact Details Visibility')).toBeInTheDocument();
    expect(screen.getByText('Friends List Visibility')).toBeInTheDocument();
    expect(screen.getByText('Profile Discoverability')).toBeInTheDocument();
  });

  it('has save changes button', async () => {
    renderWithProviders(<Settings />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('shows radio button options for each setting', async () => {
    renderWithProviders(<Settings />);
    
    await waitFor(() => {
      const radios = screen.getAllByRole('radio');
      expect(radios.length).toBeGreaterThan(0);
    }, { timeout: 2000 });
  });
});