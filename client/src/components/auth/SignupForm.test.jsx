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
  
  const heading = screen.getByText(/sign up/i);
  const signUpButton = screen.getByText(/create microsoft account/i);
  const helpText = screen.getByText(/already have an account/i);
  
  expect(heading).toBeInTheDocument();
  expect(signUpButton).toBeInTheDocument();
  expect(helpText).toBeInTheDocument();
});