import React, { useState } from 'react';
import { useAlert } from '../Alert/useAlert';
import EventList from './EventList';
import EventForm from './EventForm';
import './Events.css';

const Events = () => {
  const [activeTab, setActiveTab] = useState('my-events');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { showInfo } = useAlert();

  const tabs = [
    { id: 'my-events', label: 'My Events', description: 'Events you\'re organizing or attending' },
    { id: 'discover', label: 'Discover', description: 'Find events to join' },
    { id: 'invitations', label: 'Invitations', description: 'Events you\'ve been invited to' }
  ];

  const handleCreateEvent = () => {
    setShowCreateForm(true);
  };

  const handleEventCreated = (eventData) => {
    setShowCreateForm(false);
    showInfo(`Event "${eventData.title}" created successfully!`);
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
  };

  return (
    <div className="events-container">
      <header className="events-header">
        <div>
          <h1>📅 Events</h1>
          <p>Create, discover, and manage events in your communities</p>
        </div>
        {!showCreateForm && (
          <button
            className="btn btn-primary"
            onClick={handleCreateEvent}
          >
            ➕ Create Event
          </button>
        )}
      </header>

      {showCreateForm ? (
        <EventForm
          onEventCreated={handleEventCreated}
          onCancel={handleCancelCreate}
        />
      ) : (
        <>
          <nav className="events-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`events-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                title={tab.description}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <main className="events-content">
            <EventList
              filter={activeTab}
              onEventClick={(event) => {
                showInfo(`Event details for "${event.title}" would open here`);
              }}
            />
          </main>
        </>
      )}
    </div>
  );
};

export default Events;