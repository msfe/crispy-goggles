import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import SignupForm from './SignupForm';

// Mock the MSAL hook
vi.mock('@azure/msal-react', () => ({
  useMsal: () => ({
    instance: {
      loginPopup: vi.fn().mockResolvedValue({}),
    },
  }),
}));

test('renders signup form with Microsoft account creation button', () => {
  render(<SignupForm />);
  
  const heading = screen.getByRole('heading', { name: /create account/i });
  const signUpButton = screen.getByText(/sign up with microsoft/i);
  const backButton = screen.getByText(/back to sign in/i);
  
  expect(heading).toBeInTheDocument();
  expect(signUpButton).toBeInTheDocument();
  expect(backButton).toBeInTheDocument();
});