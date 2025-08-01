import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import Header from './Header';
import UserOverview from './UserOverview';
import Notifications from './Notifications';
import MainContent from './MainContent';
import Footer from './Footer';
import DatabaseStatus from '../database/DatabaseStatus';
import Profile from '../Profile';
import Friends, { FriendSearchWrapper } from '../Friends';
import Groups from '../Groups';
import './Dashboard.css';

const Dashboard = () => {
  const { accounts } = useMsal();
  const account = accounts[0];
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock data for demonstration
  const mockData = {
    stats: {
      friends: 42,
      groups: 7,
      upcomingEvents: 3
    },
    notifications: [
      { id: 1, type: 'friend_request', message: 'Sarah Johnson sent you a friend request', time: '2 hours ago' },
      { id: 2, type: 'group_invitation', message: 'You were invited to join "Hiking Enthusiasts"', time: '5 hours ago' },
      { id: 3, type: 'event_update', message: 'Coffee Meetup has been updated', time: '1 day ago' },
      { id: 4, type: 'comment', message: 'Mike commented on your post in "Book Club"', time: '2 days ago' }
    ],
    friendRequests: [
      { id: 1, name: 'Sarah Johnson', mutualFriends: 5, profilePic: null },
      { id: 2, name: 'Alex Chen', mutualFriends: 2, profilePic: null }
    ],
    groups: [
      { id: 1, name: 'Book Club', members: 156, recentActivity: 'New post by Emma' },
      { id: 2, name: 'Hiking Enthusiasts', members: 243, recentActivity: '3 new photos uploaded' },
      { id: 3, name: 'Tech Meetup', members: 89, recentActivity: 'Event scheduled for next week' }
    ],
    events: [
      { id: 1, name: 'Coffee Meetup', date: '2024-01-20', rsvp: 'yes', attendees: 12 },
      { id: 2, name: 'Book Discussion', date: '2024-01-25', rsvp: 'maybe', attendees: 8 },
      { id: 3, name: 'Weekend Hike', date: '2024-01-28', rsvp: 'pending', attendees: 15 }
    ]
  };

  if (!account) {
    // Provide mock account data for development mode
    const mockAccount = {
      name: 'John Doe',
      username: 'john.doe@example.com'
    };
    
    return (
      <Router>
        <div className="dashboard">
          <Header 
            onNotificationsToggle={() => setShowNotifications(!showNotifications)}
            notificationCount={mockData.notifications.length}
          />
          
          <div className="dashboard-content">
            <UserOverview 
              user={mockAccount} 
              stats={mockData.stats}
            />
            
            <DatabaseStatus />
            
            <Notifications 
              notifications={mockData.notifications}
              isVisible={showNotifications}
              onClose={() => setShowNotifications(false)}
            />
            
            <Routes>
              <Route path="/" element={
                <MainContent 
                  data={mockData}
                  user={mockAccount}
                />
              } />
              <Route path="/profile" element={<Profile />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/friends/search" element={<FriendSearchWrapper />} />
              <Route path="/groups" element={<Groups currentUserId={mockAccount.homeAccountId} />} />
              <Route path="/events" element={<div className="coming-soon">Events feature coming soon...</div>} />
              <Route path="/settings" element={<div className="coming-soon">Settings feature coming soon...</div>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          
          <Footer />
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className="dashboard">
        <Header 
          onNotificationsToggle={() => setShowNotifications(!showNotifications)}
          notificationCount={mockData.notifications.length}
        />
        
        <div className="dashboard-content">
          <UserOverview 
            user={account} 
            stats={mockData.stats}
          />
          
          <DatabaseStatus />
          
          <Notifications 
            notifications={mockData.notifications}
            isVisible={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
          
          <Routes>
            <Route path="/" element={
              <MainContent 
                data={mockData}
                user={account}
              />
            } />
            <Route path="/profile" element={<Profile />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/friends/search" element={<FriendSearchWrapper />} />
            <Route path="/groups" element={<Groups currentUserId={account.homeAccountId} />} />
            <Route path="/events" element={<div className="coming-soon">Events feature coming soon...</div>} />
            <Route path="/settings" element={<div className="coming-soon">Settings feature coming soon...</div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        
        <Footer />
      </div>
    </Router>
  );
};

export default Dashboard;