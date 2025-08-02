# Enhanced Alert System Documentation

## Overview

The Enhanced Alert System replaces browser `alert()` calls with custom, visually appealing, and accessible alerts that follow the application's design guidelines.

## Features

### Alert Types

1. **Info Alerts** - For general information and success messages
   - Background: Soft Lilac (#c8a2c8)
   - Text/Icons: Cool Teal (#4ecca3)
   - Icon: 🛈

2. **Warning Alerts** - For warnings and advisories
   - Background: Warm Beige (#e0d7d7)
   - Text/Icons: Muted Mauve (#9c67b1)
   - Icon: ⚠️

3. **Error Alerts** - For errors and critical messages
   - Background: Lavender Purple (#a861ba)
   - Text/Icons: Charcoal Black (#333333)
   - Icon: ❌

### Key Features

- **Auto-dismiss**: Alerts automatically disappear after 5 seconds (customizable)
- **Manual dismiss**: Users can click the × button or press Enter/Space
- **Animations**: Smooth slide-in and slide-out transitions
- **Responsive**: Works perfectly on mobile, tablet, and desktop
- **Accessible**: WCAG compliant with proper ARIA attributes
- **Keyboard navigation**: Full keyboard support

## Usage

### Basic Usage

```javascript
import { useAlert } from '../components/Alert';

const MyComponent = () => {
  const { showInfo, showWarning, showError } = useAlert();

  const handleSuccess = () => {
    showInfo('Operation completed successfully!');
  };

  const handleWarning = () => {
    showWarning('Please review your input before proceeding.');
  };

  const handleError = () => {
    showError('Failed to save changes. Please try again.');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Success Action</button>
      <button onClick={handleWarning}>Warning Action</button>
      <button onClick={handleError}>Error Action</button>
    </div>
  );
};
```

### Advanced Usage

```javascript
import { useAlert } from '../components/Alert';

const MyComponent = () => {
  const { addAlert } = useAlert();

  const handleCustomAlert = () => {
    addAlert({
      type: 'info',
      message: 'This alert will stay for 10 seconds',
      duration: 10000, // 10 seconds
      dismissible: true
    });
  };

  const handlePersistentAlert = () => {
    addAlert({
      type: 'error',
      message: 'This alert requires manual dismissal',
      duration: 0, // No auto-dismiss
      dismissible: true
    });
  };

  return (
    <div>
      <button onClick={handleCustomAlert}>Custom Duration</button>
      <button onClick={handlePersistentAlert}>Persistent Alert</button>
    </div>
  );
};
```

## Configuration Options

### Alert Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | string | 'info' | Alert type: 'info', 'warning', or 'error' |
| `message` | string | Required | The message to display |
| `duration` | number | 5000 | Auto-dismiss duration in milliseconds (0 = no auto-dismiss) |
| `dismissible` | boolean | true | Whether the alert can be manually dismissed |

### Available Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `showInfo(message, options)` | message: string, options: object | Shows an info alert |
| `showWarning(message, options)` | message: string, options: object | Shows a warning alert |
| `showError(message, options)` | message: string, options: object | Shows an error alert |
| `addAlert(alertConfig)` | alertConfig: object | Shows a custom alert with full configuration |
| `removeAlert(id)` | id: string/number | Manually removes a specific alert |
| `clearAllAlerts()` | none | Removes all current alerts |

## Setup and Installation

### 1. AlertProvider Integration

The AlertProvider is already integrated at the App level, so all components have access to the alert system.

```javascript
// App.jsx (already implemented)
import { AlertProvider, AlertContainer } from './components/Alert';

function App() {
  return (
    <AlertProvider>
      {/* Your app content */}
      <Dashboard />
      <AlertContainer />
    </AlertProvider>
  );
}
```

### 2. Using in Components

Simply import the `useAlert` hook and use it in your components:

```javascript
import { useAlert } from '../components/Alert';
// or
import { useAlert } from '../components/Alert/useAlert';
```

## Migration from Browser Alerts

### Before (Browser Alert)
```javascript
// Old way - browser alert
alert('Friend request sent!');
alert('Error: Failed to send request');
```

### After (Enhanced Alert System)
```javascript
// New way - enhanced alerts
const { showInfo, showError } = useAlert();

showInfo('Friend request sent!');
showError('Error: Failed to send request');
```

## Best Practices

1. **Use appropriate alert types**:
   - Info: Success messages, confirmations, general information
   - Warning: Cautions, advisories, things that need attention
   - Error: Failures, critical issues, things that went wrong

2. **Keep messages concise**: Alert messages should be clear and brief

3. **Consider duration**: Use longer durations for important messages, shorter for simple confirmations

4. **Don't overuse**: Too many alerts can overwhelm users

5. **Test accessibility**: Ensure alerts work with screen readers and keyboard navigation

## Accessibility Features

- **ARIA attributes**: Proper `role="alert"` and `aria-live="polite"`
- **Keyboard navigation**: Tab to focus, Enter/Space to dismiss
- **Color contrast**: All color combinations meet WCAG AA standards
- **Focus management**: Clear focus indicators for interactive elements
- **Screen reader friendly**: Alerts are announced to assistive technologies

## Browser Support

The alert system works on all modern browsers including:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Troubleshooting

### Alert not showing?
- Ensure AlertProvider wraps your component
- Check console for any JavaScript errors
- Verify AlertContainer is rendered

### Alert styling issues?
- Check if CSS is properly imported
- Ensure no conflicting styles override alert styles
- Verify responsive design on different screen sizes

### Need custom styling?
- Override CSS variables in the Alert.css file
- Create additional alert types by extending the component
- Use the existing color palette for consistency

## Examples in the Codebase

The alert system is already implemented in these components:
- `Friends.jsx` - Friend request responses
- `FriendSearch.jsx` - Friend request sending
- `MainContent.jsx` - Quick action notifications

These serve as real-world examples of how to integrate the alert system into your components.