import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from '../components/Profile/Profile';

// Mock MSAL hook
vi.mock('@azure/msal-react', () => ({
  useMsal: () => ({
    accounts: []
  })
}));

// Mock fetch
global.fetch = vi.fn();

const renderProfile = () => {
  return render(
    <BrowserRouter>
      <Profile />
    </BrowserRouter>
  );
};

describe('Profile Component', () => {
  it('renders profile view with mock data', async () => {
    renderProfile();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('My Profile')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
  });

  it('switches to edit mode when Edit Profile button is clicked', async () => {
    renderProfile();
    
    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Edit Profile'));
    
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Save Profile')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('cancels edit mode when Cancel button is clicked', async () => {
    renderProfile();
    
    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Edit Profile'));
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.queryByText('Save Profile')).not.toBeInTheDocument();
  });
});