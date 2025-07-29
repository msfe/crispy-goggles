import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import LoginForm from './LoginForm';

// Mock the MSAL hook
vi.mock('@azure/msal-react', () => ({
  useMsal: () => ({
    instance: {
      loginPopup: vi.fn().mockResolvedValue({}),
    },
  }),
}));

test('renders login form with Microsoft and Google sign-in buttons', () => {
  const mockProps = {
    showSignUp: false,
    setShowSignUp: vi.fn()
  };
  
  render(<LoginForm {...mockProps} />);
  
  const welcomeText = screen.getByText(/welcome back/i);
  const microsoftSignInButton = screen.getByText(/continue with microsoft/i);
  const googleSignInButton = screen.getByText(/continue with google/i);
  const createAccountButton = screen.getByText(/create account/i);
  const securityText = screen.getByText(/secure authentication powered by microsoft entra/i);
  
  expect(welcomeText).toBeInTheDocument();
  expect(microsoftSignInButton).toBeInTheDocument();
  expect(googleSignInButton).toBeInTheDocument();
  expect(createAccountButton).toBeInTheDocument();
  expect(securityText).toBeInTheDocument();
});