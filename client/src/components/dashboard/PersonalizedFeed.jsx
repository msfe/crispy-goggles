import React from 'react';

const PersonalizedFeed = ({ data, user }) => {
  // Enhanced activity feed with more context and interactions
  const recentActivity = [
    {
      id: 1,
      type: 'group_post',
      user: 'Emma Wilson',
      group: 'Book Club',
      action: 'shared a new book recommendation',
      content: '"The Seven Husbands of Evelyn Hugo" - amazing read!',
      time: '2 hours ago',
      engagement: { likes: 12, comments: 3 }
    },
    {
      id: 2,
      type: 'event_update',
      user: 'Mike Chen',
      group: 'Tech Meetup',
      action: 'updated the upcoming event',
      content: 'Added new speakers and workshop details',
      time: '4 hours ago',
      engagement: { likes: 8, comments: 5 }
    },
    {
      id: 3,
      type: 'group_photo',
      user: 'Sarah Johnson',
      group: 'Hiking Enthusiasts',
      action: 'uploaded photos from weekend hike',
      content: '5 new photos from Mount Washington trail',
      time: '1 day ago',
      engagement: { likes: 24, comments: 7 }
    }
  ];

  const upcomingEvents = data.events.filter(event => event.rsvp && event.rsvp !== 'no').slice(0, 2);
  const activeGroups = data.groups.slice(0, 3);

  return (
    <div className="personalized-feed">
      {/* Recent Activity Stream */}
      <section className="activity-stream">
        <h3>What's Happening</h3>
        <div className="activity-items">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="activity-card">
              <div className="activity-header">
                <div className="activity-avatar">
                  {activity.user.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="activity-info">
                  <p className="activity-text">
                    <strong>{activity.user}</strong> {activity.action} in{' '}
                    <span className="group-link">{activity.group}</span>
                  </p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
              {activity.content && (
                <div className="activity-content">
                  <p>{activity.content}</p>
                </div>
              )}
              <div className="activity-engagement">
                <button className="engagement-btn">
                  👍 {activity.engagement.likes}
                </button>
                <button className="engagement-btn">
                  💬 {activity.engagement.comments}
                </button>
                <button className="engagement-btn">🔗 Share</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Event Preview */}
      <section className="upcoming-events-preview">
        <h3>Your Upcoming Events</h3>
        {upcomingEvents.length > 0 ? (
          <div className="events-preview-list">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="event-preview-card">
                <div className="event-date">
                  {new Date(event.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="event-details">
                  <h4>{event.name}</h4>
                  <p>{event.attendees} attendees</p>
                  <span className={`rsvp-badge ${event.rsvp}`}>
                    {event.rsvp === 'yes' ? 'Going' : 'Maybe'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No upcoming events</p>
        )}
      </section>

      {/* Active Groups Summary */}
      <section className="active-groups-summary">
        <h3>Your Active Groups</h3>
        <div className="groups-summary-list">
          {activeGroups.map((group) => (
            <div key={group.id} className="group-summary-card">
              <div className="group-icon">📋</div>
              <div className="group-summary-info">
                <h4>{group.name}</h4>
                <p className="group-activity">{group.recentActivity}</p>
                <span className="group-members">{group.members} members</span>
              </div>
              <button className="view-group-btn">View</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PersonalizedFeed;