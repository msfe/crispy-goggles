import React, { useState } from 'react';

const EventRSVP = ({ 
  eventId, 
  currentStatus = null, 
  onRSVPChange, 
  compact = false,
  disabled = false 
}) => {
  const [loading, setLoading] = useState(false);

  const rsvpOptions = [
    { 
      value: 'attending', 
      label: compact ? '✓' : '✅ Attending', 
      fullLabel: 'Attending',
      icon: '✅'
    },
    { 
      value: 'maybe', 
      label: compact ? '?' : '🤔 Maybe', 
      fullLabel: 'Maybe',
      icon: '🤔'
    },
    { 
      value: 'not_attending', 
      label: compact ? '✗' : '❌ Can\'t Attend', 
      fullLabel: 'Can\'t Attend',
      icon: '❌'
    }
  ];

  const handleRSVPClick = async (status) => {
    if (disabled || loading) return;
    
    setLoading(true);
    
    try {
      await onRSVPChange?.(eventId, status);
    } catch (error) {
      console.error('Failed to update RSVP:', error);
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    // Compact version for event cards
    return (
      <div className="rsvp-compact">
        {currentStatus ? (
          <span 
            className={`rsvp-status ${currentStatus.replace('_', '-')}`}
            title={rsvpOptions.find(opt => opt.value === currentStatus)?.fullLabel}
          >
            {rsvpOptions.find(opt => opt.value === currentStatus)?.icon}
          </span>
        ) : (
          <div className="rsvp-options compact">
            {rsvpOptions.map(option => (
              <button
                key={option.value}
                className={`rsvp-option ${option.value} ${loading ? 'loading' : ''}`}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event card click
                  handleRSVPClick(option.value);
                }}
                disabled={disabled || loading}
                title={option.fullLabel}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  minWidth: '30px'
                }}
              >
                {loading ? '...' : option.icon}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Full version for event details
  return (
    <div className="rsvp-section">
      <h3>Your RSVP</h3>
      {currentStatus && (
        <p style={{ 
          marginBottom: '15px', 
          color: 'var(--medium-gray, #b0b0b0)',
          fontSize: '14px'
        }}>
          Current status: <strong>
            {rsvpOptions.find(opt => opt.value === currentStatus)?.fullLabel || 'Unknown'}
          </strong>
        </p>
      )}
      
      <div className="rsvp-options">
        {rsvpOptions.map(option => (
          <button
            key={option.value}
            className={`rsvp-option ${option.value} ${
              currentStatus === option.value ? 'selected' : ''
            } ${loading ? 'loading' : ''}`}
            onClick={() => handleRSVPClick(option.value)}
            disabled={disabled || loading}
          >
            {loading && currentStatus !== option.value ? (
              '...'
            ) : (
              option.label
            )}
          </button>
        ))}
      </div>
      
      {loading && (
        <p style={{ 
          marginTop: '10px',
          color: 'var(--medium-gray, #b0b0b0)',
          fontSize: '14px'
        }}>
          Updating your RSVP...
        </p>
      )}
    </div>
  );
};

export default EventRSVP;