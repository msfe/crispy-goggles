import React from 'react';

const DiscoverySection = ({ onJoin, onExplore }) => {
  // Mock trending data - in real app this would come from backend
  const trendingGroups = [
    {
      id: 10,
      name: 'Photography Enthusiasts',
      members: 892,
      growth: '+47 this week',
      category: 'Creative',
      description: 'Share and learn photography techniques'
    },
    {
      id: 11,
      name: 'Local Food Lovers',
      members: 654,
      growth: '+32 this week',
      category: 'Food & Drink',
      description: 'Discover the best local restaurants and recipes'
    },
    {
      id: 12,
      name: 'Weekend Warriors',
      members: 423,
      growth: '+28 this week',
      category: 'Fitness',
      description: 'Active outdoor adventures every weekend'
    }
  ];

  const popularEvents = [
    {
      id: 10,
      name: 'Spring Photography Walk',
      date: '2024-02-15',
      location: 'Central Park',
      attendees: 45,
      category: 'Photography'
    },
    {
      id: 11,
      name: 'Local Restaurant Tour',
      date: '2024-02-18',
      location: 'Downtown',
      attendees: 32,
      category: 'Food'
    }
  ];

  return (
    <div className="discovery-section">
      {/* Trending Groups */}
      <section className="trending-groups">
        <div className="section-header">
          <h3>🔥 Trending Groups</h3>
          <button className="explore-more-btn" onClick={() => onExplore('groups')}>
            Explore All
          </button>
        </div>
        <div className="trending-list">
          {trendingGroups.map((group) => (
            <div key={group.id} className="trending-card">
              <div className="trending-header">
                <div className="trending-info">
                  <h4>{group.name}</h4>
                  <span className="category-tag">{group.category}</span>
                </div>
                <div className="trending-stats">
                  <span className="member-count">{group.members} members</span>
                  <span className="growth-indicator">{group.growth}</span>
                </div>
              </div>
              <p className="trending-description">{group.description}</p>
              <button 
                className="join-btn"
                onClick={() => onJoin('group', group.id)}
              >
                Join Group
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Events */}
      <section className="popular-events">
        <div className="section-header">
          <h3>📅 Popular Events</h3>
          <button className="explore-more-btn" onClick={() => onExplore('events')}>
            See More
          </button>
        </div>
        <div className="popular-events-list">
          {popularEvents.map((event) => (
            <div key={event.id} className="popular-event-card">
              <div className="event-date-badge">
                {new Date(event.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <div className="event-info">
                <h4>{event.name}</h4>
                <p className="event-location">📍 {event.location}</p>
                <span className="event-attendees">{event.attendees} attending</span>
              </div>
              <button 
                className="rsvp-btn"
                onClick={() => onJoin('event', event.id)}
              >
                RSVP
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Community Highlights */}
      <section className="community-highlights">
        <h3>✨ Community Highlights</h3>
        <div className="highlights-grid">
          <div className="highlight-card">
            <div className="highlight-icon">🏆</div>
            <div className="highlight-content">
              <h4>Group of the Month</h4>
              <p><strong>Book Club</strong> - Most active discussions</p>
            </div>
          </div>
          <div className="highlight-card">
            <div className="highlight-icon">⭐</div>
            <div className="highlight-content">
              <h4>Top Event</h4>
              <p><strong>Tech Meetup</strong> - Highest rated last month</p>
            </div>
          </div>
          <div className="highlight-card">
            <div className="highlight-icon">🎉</div>
            <div className="highlight-content">
              <h4>New Milestone</h4>
              <p><strong>1000+</strong> active community members!</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DiscoverySection;