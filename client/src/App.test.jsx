import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import App from './App.jsx';

test('renders authentication interface', () => {
  render(<App />);
  const appTitle = screen.getAllByText(/crispy goggles/i)[0]; // Get the first occurrence (main title)
  const microsoftSignInButton = screen.getByText(/continue with microsoft/i);
  const createAccountButton = screen.getByText(/create account/i);
  
  expect(appTitle).toBeInTheDocument();
  expect(microsoftSignInButton).toBeInTheDocument();
  expect(createAccountButton).toBeInTheDocument();
});
