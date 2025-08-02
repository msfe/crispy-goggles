import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import Alert from './Alert';

describe('Alert Component', () => {
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders info alert with correct styling and content', () => {
    render(
      <Alert
        id="test-1"
        type="info"
        message="This is an info message"
        onDismiss={mockOnDismiss}
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('alert', 'alert--info');
    expect(screen.getByText('This is an info message')).toBeInTheDocument();
    expect(screen.getByText('🛈')).toBeInTheDocument();
  });

  it('renders warning alert with correct styling', () => {
    render(
      <Alert
        id="test-2"
        type="warning"
        message="This is a warning message"
        onDismiss={mockOnDismiss}
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('alert', 'alert--warning');
    expect(screen.getByText('This is a warning message')).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('renders error alert with correct styling', () => {
    render(
      <Alert
        id="test-3"
        type="error"
        message="This is an error message"
        onDismiss={mockOnDismiss}
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('alert', 'alert--error');
    expect(screen.getByText('This is an error message')).toBeInTheDocument();
    expect(screen.getByText('❌')).toBeInTheDocument();
  });

  it('shows dismiss button when dismissible is true', () => {
    render(
      <Alert
        id="test-4"
        type="info"
        message="Dismissible alert"
        dismissible={true}
        onDismiss={mockOnDismiss}
      />
    );

    const dismissButton = screen.getByRole('button', { name: /dismiss alert/i });
    expect(dismissButton).toBeInTheDocument();
  });

  it('hides dismiss button when dismissible is false', () => {
    render(
      <Alert
        id="test-5"
        type="info"
        message="Non-dismissible alert"
        dismissible={false}
        onDismiss={mockOnDismiss}
      />
    );

    const dismissButton = screen.queryByRole('button', { name: /dismiss alert/i });
    expect(dismissButton).not.toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', async () => {
    render(
      <Alert
        id="test-6"
        type="info"
        message="Clickable dismiss"
        onDismiss={mockOnDismiss}
      />
    );

    const dismissButton = screen.getByRole('button', { name: /dismiss alert/i });
    fireEvent.click(dismissButton);

    await waitFor(() => {
      expect(mockOnDismiss).toHaveBeenCalledWith("test-6");
    }, { timeout: 500 });
  });

  it('calls onDismiss when Enter key is pressed on alert', async () => {
    render(
      <Alert
        id="test-7"
        type="info"
        message="Keyboard dismissible"
        onDismiss={mockOnDismiss}
      />
    );

    const alert = screen.getByRole('alert');
    fireEvent.keyDown(alert, { key: 'Enter' });

    await waitFor(() => {
      expect(mockOnDismiss).toHaveBeenCalledWith("test-7");
    }, { timeout: 500 });
  });

  it('calls onDismiss when Space key is pressed on alert', async () => {
    render(
      <Alert
        id="test-8"
        type="info"
        message="Space dismissible"
        onDismiss={mockOnDismiss}
      />
    );

    const alert = screen.getByRole('alert');
    fireEvent.keyDown(alert, { key: ' ' });

    await waitFor(() => {
      expect(mockOnDismiss).toHaveBeenCalledWith("test-8");
    }, { timeout: 500 });
  });

  it('auto-dismisses after specified duration', async () => {
    render(
      <Alert
        id="test-9"
        type="info"
        message="Auto dismiss"
        duration={100}
        onDismiss={mockOnDismiss}
      />
    );

    await waitFor(() => {
      expect(mockOnDismiss).toHaveBeenCalledWith("test-9");
    }, { timeout: 500 });
  });

  it('does not auto-dismiss when duration is 0', async () => {
    render(
      <Alert
        id="test-10"
        type="info"
        message="No auto dismiss"
        duration={0}
        onDismiss={mockOnDismiss}
      />
    );

    // Wait a bit to ensure it doesn't auto-dismiss
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(mockOnDismiss).not.toHaveBeenCalled();
  });

  it('has proper accessibility attributes', () => {
    render(
      <Alert
        id="test-11"
        type="info"
        message="Accessible alert"
        onDismiss={mockOnDismiss}
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
    expect(alert).toHaveAttribute('tabIndex', '0');
  });
});