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

test('renders login form with Microsoft sign-in button', () => {
  const mockProps = {
    showSignUp: false,
    setShowSignUp: vi.fn()
  };
  
  render(<LoginForm {...mockProps} />);
  
  const emailInput = screen.getByPlaceholderText(/email or phone number/i);
  const passwordInput = screen.getByPlaceholderText(/password/i);
  const signInButton = screen.getByText(/^sign in$/i);
  const microsoftSignInButton = screen.getByText(/sign in with microsoft/i);
  const createAccountButton = screen.getByText(/create new account/i);
  
  expect(emailInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();
  expect(signInButton).toBeInTheDocument();
  expect(microsoftSignInButton).toBeInTheDocument();
  expect(createAccountButton).toBeInTheDocument();
});