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
  render(<LoginForm />);
  
  const heading = screen.getByText(/login/i);
  const signInButton = screen.getByText(/sign in with microsoft/i);
  const helpText = screen.getByText(/don't have an account/i);
  
  expect(heading).toBeInTheDocument();
  expect(signInButton).toBeInTheDocument();
  expect(helpText).toBeInTheDocument();
});