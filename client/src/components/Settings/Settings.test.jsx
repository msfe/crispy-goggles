import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Settings from './Settings';

// Mock fetch for API calls
global.fetch = vi.fn();

describe('Settings Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders settings page with correct title', async () => {
    render(<Settings />);
    
    // Initially shows loading
    expect(screen.getByText('Loading settings...')).toBeInTheDocument();
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('displays privacy settings section', async () => {
    render(<Settings />);
    
    await waitFor(() => {
      expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    expect(screen.getByText('Control who can see different parts of your profile and how discoverable you are on the platform.')).toBeInTheDocument();
  });

  it('shows all required privacy setting cards', async () => {
    render(<Settings />);
    
    await waitFor(() => {
      expect(screen.getByText('Profile Picture Visibility')).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(screen.getByText('Bio Visibility')).toBeInTheDocument();
    expect(screen.getByText('Contact Details Visibility')).toBeInTheDocument();
    expect(screen.getByText('Friends List Visibility')).toBeInTheDocument();
    expect(screen.getByText('Profile Discoverability')).toBeInTheDocument();
  });

  it('has save changes button', async () => {
    render(<Settings />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('shows radio button options for each setting', async () => {
    render(<Settings />);
    
    await waitFor(() => {
      const radios = screen.getAllByRole('radio');
      expect(radios.length).toBeGreaterThan(0);
    }, { timeout: 2000 });
  });
});