import React, { useState, useEffect } from 'react';
import { useAlert } from '../Alert/useAlert';
import EventRSVP from './EventRSVP';

const EventDetails = ({ eventId, onBack }) => {
  const [event, setEvent] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [postingLoading, setPostingLoading] = useState(false);
  const { showError, showSuccess } = useAlert();

  // Mock current user - in real app this would come from auth context
  const currentUserId = 'current-user-123';

  useEffect(() => {
    loadEventDetails();
    loadEventPosts();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      // In real implementation, this would call the API
      // For now, using mock data
      const mockEvent = {
        id: eventId,
        organizerId: 'user-2',
        title: 'React Workshop',
        description: 'A comprehensive hands-on workshop covering React hooks, context API, state management, and modern development patterns. Perfect for developers looking to enhance their React skills.',
        location: 'Online via Zoom',
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        invitedUserIds: [currentUserId, 'user-3', 'user-4'],
        invitedGroupIds: ['group-1'],
        rsvps: [
          { userId: currentUserId, status: 'attending', respondedAt: new Date().toISOString() },
          { userId: 'user-3', status: 'maybe', respondedAt: new Date().toISOString() },
          { userId: 'user-4', status: 'attending', respondedAt: new Date().toISOString() }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setEvent(mockEvent);
    } catch (err) {
      setError('Failed to load event details');
      showError('Failed to load event details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadEventPosts = async () => {
    try {
      // Mock posts data
      const mockPosts = [
        {
          id: 'post-1',
          authorId: 'user-2',
          authorName: 'Workshop Organizer',
          eventId: eventId,
          content: 'Looking forward to seeing everyone at the workshop! We\'ll be covering some exciting new features.',
          attachments: [],
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'post-2',
          authorId: currentUserId,
          authorName: 'You',
          eventId: eventId,
          content: 'Can\'t wait! Any specific topics we should prepare for in advance?',
          attachments: [],
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setPosts(mockPosts);
    } catch (err) {
      console.error('Failed to load posts:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getUserRSVP = () => {
    return event?.rsvps.find(rsvp => rsvp.userId === currentUserId);
  };

  const getRSVPCounts = () => {
    if (!event) return { attending: 0, maybe: 0, notAttending: 0 };
    
    return event.rsvps.reduce((counts, rsvp) => {
      switch (rsvp.status) {
        case 'attending':
          counts.attending++;
          break;
        case 'maybe':
          counts.maybe++;
          break;
        case 'not_attending':
          counts.notAttending++;
          break;
      }
      return counts;
    }, { attending: 0, maybe: 0, notAttending: 0 });
  };

  const handleRSVPChange = async (eventId, status) => {
    try {
      // Update local state
      setEvent(prevEvent => {
        const updatedRsvps = prevEvent.rsvps.filter(rsvp => rsvp.userId !== currentUserId);
        updatedRsvps.push({
          userId: currentUserId,
          status,
          respondedAt: new Date().toISOString()
        });
        return { ...prevEvent, rsvps: updatedRsvps };
      });
      
      showSuccess(`RSVP updated to "${status}"`);
    } catch (err) {
      showError('Failed to update RSVP. Please try again.');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setPostingLoading(true);
    
    try {
      // In real implementation, this would call the API
      const newPost = {
        id: `post-${Date.now()}`,
        authorId: currentUserId,
        authorName: 'You',
        eventId: eventId,
        content: newPostContent.trim(),
        attachments: [],
        createdAt: new Date().toISOString()
      };

      setPosts(prevPosts => [newPost, ...prevPosts]);
      setNewPostContent('');
      showSuccess('Post created successfully!');
    } catch (err) {
      showError('Failed to create post. Please try again.');
    } finally {
      setPostingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <p>Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="empty-state">
        <h3>❌ Error Loading Event</h3>
        <p>{error || 'Event not found'}</p>
        <button className="btn btn-primary" onClick={onBack}>
          ← Back to Events
        </button>
      </div>
    );
  }

  const rsvpCounts = getRSVPCounts();
  const userRSVP = getUserRSVP();
  const isOrganizer = event.organizerId === currentUserId;

  return (
    <div className="event-details">
      <div className="event-details-header">
        <button 
          className="btn btn-outline" 
          onClick={onBack}
          style={{ 
            marginBottom: '20px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderColor: 'rgba(255,255,255,0.5)',
            color: 'white'
          }}
        >
          ← Back to Events
        </button>
        
        <h1 className="event-details-title">{event.title}</h1>
        
        <div className="event-details-meta">
          <span>📅 {formatDate(event.startDate)}</span>
          {event.location && <span>📍 {event.location}</span>}
          {isOrganizer && <span>👑 You're organizing this event</span>}
        </div>
      </div>

      <div className="event-details-content">
        <div className="event-description-full">
          <p>{event.description}</p>
        </div>

        <div className="event-stats">
          <div className="event-stat">
            <span className="event-stat-number">{rsvpCounts.attending}</span>
            <span className="event-stat-label">Attending</span>
          </div>
          <div className="event-stat">
            <span className="event-stat-number">{rsvpCounts.maybe}</span>
            <span className="event-stat-label">Maybe</span>
          </div>
          <div className="event-stat">
            <span className="event-stat-number">{event.invitedUserIds.length + event.invitedGroupIds.length}</span>
            <span className="event-stat-label">Invited</span>
          </div>
        </div>

        {!isOrganizer && (
          <EventRSVP
            eventId={event.id}
            currentStatus={userRSVP?.status}
            onRSVPChange={handleRSVPChange}
          />
        )}

        {/* Event Wall */}
        <div className="event-wall">
          <h3>💬 Event Wall</h3>
          
          {/* Create Post Form */}
          <form className="create-post-form" onSubmit={handleCreatePost}>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Share something with other attendees..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--soft-lilac, #c8a2c8)',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                marginBottom: '10px'
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!newPostContent.trim() || postingLoading}
              style={{ marginBottom: '20px' }}
            >
              {postingLoading ? 'Posting...' : 'Post'}
            </button>
          </form>

          {/* Posts List */}
          <div className="posts-list">
            {posts.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <p>No posts yet. Be the first to share something!</p>
              </div>
            ) : (
              posts.map(post => (
                <div key={post.id} className="post-card" style={{
                  background: 'var(--light-gray, #f5f5f5)',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '15px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <strong style={{ color: 'var(--deep-indigo, #5c3c92)' }}>
                      {post.authorName}
                    </strong>
                    <span style={{ 
                      color: 'var(--medium-gray, #b0b0b0)', 
                      fontSize: '12px' 
                    }}>
                      {formatTimeAgo(post.createdAt)}
                    </span>
                  </div>
                  <p style={{ 
                    color: 'var(--charcoal-black, #333333)',
                    lineHeight: '1.5',
                    margin: 0 
                  }}>
                    {post.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;