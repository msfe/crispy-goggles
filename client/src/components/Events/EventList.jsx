import React, { useState, useEffect } from 'react';
import { useAlert } from '../Alert/useAlert';
import EventRSVP from './EventRSVP';

const EventList = ({ filter = 'my-events', onEventClick }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showError, showSuccess } = useAlert();

  // Mock current user ID - in real app this would come from auth context
  const currentUserId = 'current-user-123';

  useEffect(() => {
    loadEvents();
  }, [filter]);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In real implementation, this would call the API
      // For now, using mock data to demonstrate functionality
      const mockEvents = generateMockEvents();
      
      // Filter events based on active tab
      let filteredEvents = mockEvents;
      
      switch (filter) {
        case 'my-events':
          filteredEvents = mockEvents.filter(event => 
            event.organizerId === currentUserId || 
            event.rsvps.some(rsvp => rsvp.userId === currentUserId)
          );
          break;
        case 'discover':
          filteredEvents = mockEvents.filter(event => 
            event.organizerId !== currentUserId &&
            !event.invitedUserIds.includes(currentUserId) &&
            !event.rsvps.some(rsvp => rsvp.userId === currentUserId)
          );
          break;
        case 'invitations':
          filteredEvents = mockEvents.filter(event => 
            event.invitedUserIds.includes(currentUserId) &&
            !event.rsvps.some(rsvp => rsvp.userId === currentUserId)
          );
          break;
        default:
          filteredEvents = mockEvents;
      }
      
      setEvents(filteredEvents);
    } catch (err) {
      setError('Failed to load events');
      showError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateMockEvents = () => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return [
      {
        id: 'event-1',
        organizerId: currentUserId,
        title: 'Stockholm Tech Meetup',
        description: 'Monthly gathering of tech enthusiasts to share ideas, network, and learn about the latest technologies.',
        location: 'Stockholm Convention Center',
        startDate: nextWeek.toISOString(),
        endDate: new Date(nextWeek.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        invitedUserIds: ['user-2', 'user-3'],
        invitedGroupIds: ['group-1'],
        rsvps: [
          { userId: 'user-2', status: 'attending', respondedAt: now.toISOString() },
          { userId: 'user-3', status: 'maybe', respondedAt: now.toISOString() }
        ]
      },
      {
        id: 'event-2',
        organizerId: 'user-2',
        title: 'React Workshop',
        description: 'Hands-on workshop covering React hooks, context, and modern development patterns.',
        location: 'Online',
        startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        invitedUserIds: [currentUserId, 'user-3'],
        invitedGroupIds: [],
        rsvps: [
          { userId: currentUserId, status: 'attending', respondedAt: now.toISOString() }
        ]
      },
      {
        id: 'event-3',
        organizerId: 'user-3',
        title: 'Privacy & Security Summit',
        description: 'A comprehensive summit discussing privacy-focused technologies and security best practices.',
        location: 'Göteborg University',
        startDate: nextMonth.toISOString(),
        endDate: new Date(nextMonth.getTime() + 6 * 60 * 60 * 1000).toISOString(),
        invitedUserIds: [currentUserId],
        invitedGroupIds: ['group-1', 'group-2'],
        rsvps: []
      },
      {
        id: 'event-4',
        organizerId: 'user-4',
        title: 'Open Source Hackathon',
        description: 'Weekend hackathon focused on contributing to open source projects and building community tools.',
        location: 'Malmö Innovation Hub',
        startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000).toISOString(),
        invitedUserIds: [],
        invitedGroupIds: [],
        rsvps: [
          { userId: 'user-5', status: 'attending', respondedAt: now.toISOString() },
          { userId: 'user-6', status: 'attending', respondedAt: now.toISOString() }
        ]
      }
    ];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserRSVP = (event) => {
    return event.rsvps.find(rsvp => rsvp.userId === currentUserId);
  };

  const getAttendeeCount = (event) => {
    return event.rsvps.filter(rsvp => rsvp.status === 'attending').length;
  };

  const handleRSVPChange = async (eventId, status) => {
    try {
      // In real implementation, this would call the API
      setEvents(prevEvents => 
        prevEvents.map(event => {
          if (event.id === eventId) {
            const updatedRsvps = event.rsvps.filter(rsvp => rsvp.userId !== currentUserId);
            updatedRsvps.push({
              userId: currentUserId,
              status,
              respondedAt: new Date().toISOString()
            });
            return { ...event, rsvps: updatedRsvps };
          }
          return event;
        })
      );
      
      showSuccess(`RSVP updated to "${status}"`);
    } catch (err) {
      showError('Failed to update RSVP. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <p>Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <h3>❌ Error Loading Events</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={loadEvents}>
          Try Again
        </button>
      </div>
    );
  }

  if (events.length === 0) {
    const emptyMessages = {
      'my-events': {
        title: '📅 No Events Yet',
        message: 'You haven\'t created or joined any events yet. Create your first event or browse available events to get started!'
      },
      'discover': {
        title: '🔍 No Events to Discover',
        message: 'There are no public events available at the moment. Check back later or create your own event!'
      },
      'invitations': {
        title: '✉️ No Pending Invitations',
        message: 'You don\'t have any pending event invitations. When friends invite you to events, they\'ll appear here.'
      }
    };

    const emptyMessage = emptyMessages[filter] || emptyMessages['my-events'];

    return (
      <div className="empty-state">
        <h3>{emptyMessage.title}</h3>
        <p>{emptyMessage.message}</p>
      </div>
    );
  }

  return (
    <div className="event-list">
      {events.map(event => {
        const userRSVP = getUserRSVP(event);
        const attendeeCount = getAttendeeCount(event);
        const isOrganizer = event.organizerId === currentUserId;

        return (
          <div
            key={event.id}
            className="event-card"
            onClick={() => onEventClick?.(event)}
          >
            <div className="event-card-header">
              <div>
                <h3 className="event-title">{event.title}</h3>
                <p className="event-date">📅 {formatDate(event.startDate)}</p>
              </div>
              {isOrganizer && (
                <span className="rsvp-status organizer">Organizer</span>
              )}
            </div>

            {event.location && (
              <p className="event-location">
                📍 {event.location}
              </p>
            )}

            <p className="event-description">{event.description}</p>

            <div className="event-card-footer">
              <div className="event-attendees">
                <span>👥 {attendeeCount} attending</span>
              </div>

              {!isOrganizer && (
                <EventRSVP
                  eventId={event.id}
                  currentStatus={userRSVP?.status}
                  onRSVPChange={handleRSVPChange}
                  compact={true}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EventList;