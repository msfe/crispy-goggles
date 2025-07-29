import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import App from './App.jsx';

test('renders authentication interface', () => {
  render(<App />);
  const appTitle = screen.getByText(/crispy goggles/i);
  const microsoftSignInButton = screen.getByText(/sign in with microsoft/i);
  const signUpTab = screen.getByRole('button', { name: /sign up/i });
  
  expect(appTitle).toBeInTheDocument();
  expect(microsoftSignInButton).toBeInTheDocument();
  expect(signUpTab).toBeInTheDocument();
});
