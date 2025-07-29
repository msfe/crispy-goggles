import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import App from './App.jsx';

test('renders authentication interface', () => {
  render(<App />);
  const appTitle = screen.getByText(/crispy goggles/i);
  const microsoftSignInButton = screen.getByText(/sign in with microsoft/i);
  const createAccountButton = screen.getByText(/create new account/i);
  
  expect(appTitle).toBeInTheDocument();
  expect(microsoftSignInButton).toBeInTheDocument();
  expect(createAccountButton).toBeInTheDocument();
});
