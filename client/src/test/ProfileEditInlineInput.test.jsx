import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfileEdit from '../components/Profile/ProfileEdit';

// Mock profile data
const mockProfile = {
  name: 'John Doe',
  bio: 'Software developer',
  contactDetails: {
    email: 'john@example.com'
  }
};

describe('ProfileEdit - Inline Contact Field Input', () => {
  let mockOnSave, mockOnCancel;

  beforeEach(() => {
    mockOnSave = vi.fn().mockResolvedValue({ success: true });
    mockOnCancel = vi.fn();
  });

  it('shows inline input field when Add Contact Field is clicked', async () => {
    render(
      <ProfileEdit 
        profile={mockProfile} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    // Initially, should show the Add Contact Field button
    const addButton = screen.getByText('+ Add Contact Field');
    expect(addButton).toBeInTheDocument();

    // Click the button
    fireEvent.click(addButton);

    // Should now show the inline input field
    expect(screen.getByPlaceholderText('Enter field name (e.g., phone, website)')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
    
    // Check that there are now 2 Cancel buttons (form cancel + contact input cancel)
    const cancelButtons = screen.getAllByText('Cancel');
    expect(cancelButtons).toHaveLength(2);

    // The original button should be hidden
    expect(screen.queryByText('+ Add Contact Field')).not.toBeInTheDocument();
  });

  it('adds a new contact field when valid input is provided', async () => {
    render(
      <ProfileEdit 
        profile={mockProfile} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    // Click Add Contact Field button
    fireEvent.click(screen.getByText('+ Add Contact Field'));

    // Type a field name
    const input = screen.getByPlaceholderText('Enter field name (e.g., phone, website)');
    fireEvent.change(input, { target: { value: 'phone' } });

    // Click Add button
    fireEvent.click(screen.getByText('Add'));

    // Should see the new contact field
    expect(screen.getByDisplayValue('phone')).toBeInTheDocument();
    
    // Should hide the inline input and show the Add button again
    expect(screen.getByText('+ Add Contact Field')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Enter field name (e.g., phone, website)')).not.toBeInTheDocument();
  });

  it('cancels adding field when Cancel button is clicked', async () => {
    render(
      <ProfileEdit 
        profile={mockProfile} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    // Click Add Contact Field button
    fireEvent.click(screen.getByText('+ Add Contact Field'));

    // Type something
    const input = screen.getByPlaceholderText('Enter field name (e.g., phone, website)');
    fireEvent.change(input, { target: { value: 'phone' } });

    // Click Cancel button - find the one inside the contact input row
    const cancelButtons = screen.getAllByText('Cancel');
    // The second cancel button is the one for the contact input (first is for the form)
    fireEvent.click(cancelButtons[0]); // Should be the contact input cancel button

    // Should not add the field and should show the Add button again
    expect(screen.queryByDisplayValue('phone')).not.toBeInTheDocument();
    expect(screen.getByText('+ Add Contact Field')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Enter field name (e.g., phone, website)')).not.toBeInTheDocument();
  });

  it('prevents adding empty or whitespace-only field names', async () => {
    render(
      <ProfileEdit 
        profile={mockProfile} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    // Click Add Contact Field button
    fireEvent.click(screen.getByText('+ Add Contact Field'));

    // Try to add empty field
    fireEvent.click(screen.getByText('Add'));

    // Should still show the input (not add the field)
    expect(screen.getByPlaceholderText('Enter field name (e.g., phone, website)')).toBeInTheDocument();

    // Try with whitespace only
    const input = screen.getByPlaceholderText('Enter field name (e.g., phone, website)');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(screen.getByText('Add'));

    // Should still show the input (not add the field)
    expect(screen.getByPlaceholderText('Enter field name (e.g., phone, website)')).toBeInTheDocument();
  });

  it('prevents adding duplicate field names', async () => {
    render(
      <ProfileEdit 
        profile={mockProfile} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    // Try to add a field that already exists
    fireEvent.click(screen.getByText('+ Add Contact Field'));
    
    const input = screen.getByPlaceholderText('Enter field name (e.g., phone, website)');
    fireEvent.change(input, { target: { value: 'email' } });
    fireEvent.click(screen.getByText('Add'));

    // Should still show the input with an error or prevent addition
    expect(screen.getByPlaceholderText('Enter field name (e.g., phone, website)')).toBeInTheDocument();
  });

  it('supports keyboard navigation (Enter to add, Escape to cancel)', async () => {
    render(
      <ProfileEdit 
        profile={mockProfile} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    // Click Add Contact Field button
    fireEvent.click(screen.getByText('+ Add Contact Field'));

    // Type a field name and press Enter
    const input = screen.getByPlaceholderText('Enter field name (e.g., phone, website)');
    fireEvent.change(input, { target: { value: 'phone' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    // Should add the field
    expect(screen.getByDisplayValue('phone')).toBeInTheDocument();
    expect(screen.getByText('+ Add Contact Field')).toBeInTheDocument();
  });
});