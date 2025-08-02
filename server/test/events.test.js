const request = require('supertest');
const express = require('express');
const eventRoutes = require('../routes/events');
const { Event } = require('../models');

// Mock the database service
jest.mock('../services/databaseService', () => ({
  getItems: jest.fn(),
  getItem: jest.fn(),
  createItem: jest.fn(),
  updateItem: jest.fn(),
  deleteItem: jest.fn()
}));

const databaseService = require('../services/databaseService');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/events', eventRoutes);

describe('Event Routes', () => {
  const mockEvent = {
    id: 'event-123',
    type: 'event',
    organizerId: 'user-123',
    title: 'Test Event',
    description: 'Test event description',
    location: 'Test Location',
    startDate: new Date(Date.now() + 86400000).toISOString(), // tomorrow
    endDate: new Date(Date.now() + 90000000).toISOString(), // tomorrow + 1 hour
    invitedUserIds: ['user-456'],
    invitedGroupIds: ['group-789'],
    rsvps: [
      { userId: 'user-456', status: 'attending', respondedAt: new Date().toISOString() }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockPost = {
    id: 'post-123',
    type: 'post',
    authorId: 'user-123',
    eventId: 'event-123',
    content: 'Test post content',
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/events', () => {
    it('should return all events', async () => {
      databaseService.getItems.mockResolvedValue([mockEvent]);

      const response = await request(app)
        .get('/api/events')
        .expect(200);

      expect(response.body).toEqual([mockEvent]);
      expect(databaseService.getItems).toHaveBeenCalledWith('events', { type: 'event' });
    });

    it('should filter events by organizer ID', async () => {
      databaseService.getItems.mockResolvedValue([mockEvent]);

      const response = await request(app)
        .get('/api/events?organizerId=user-123')
        .expect(200);

      expect(response.body).toEqual([mockEvent]);
      expect(databaseService.getItems).toHaveBeenCalledWith('events', { 
        type: 'event', 
        organizerId: 'user-123' 
      });
    });

    it('should filter events by user invitation', async () => {
      databaseService.getItems.mockResolvedValue([mockEvent]);

      const response = await request(app)
        .get('/api/events?userId=user-456')
        .expect(200);

      expect(response.body).toEqual([mockEvent]);
    });

    it('should handle database errors', async () => {
      databaseService.getItems.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/events')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to get events' });
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return event by ID', async () => {
      databaseService.getItem.mockResolvedValue(mockEvent);

      const response = await request(app)
        .get('/api/events/event-123')
        .expect(200);

      expect(response.body).toEqual(mockEvent);
      expect(databaseService.getItem).toHaveBeenCalledWith('events', 'event-123');
    });

    it('should return 404 for non-existent event', async () => {
      databaseService.getItem.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/events/non-existent')
        .expect(404);

      expect(response.body).toEqual({ error: 'Event not found' });
    });

    it('should handle database errors', async () => {
      databaseService.getItem.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/events/event-123')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to get event' });
    });
  });

  describe('POST /api/events', () => {
    const validEventData = {
      organizerId: 'user-123',
      title: 'New Event',
      description: 'New event description',
      location: 'New Location',
      startDate: new Date(Date.now() + 86400000).toISOString(),
      invitedUserIds: ['user-456'],
      invitedGroupIds: []
    };

    it('should create a new event', async () => {
      const createdEvent = { ...validEventData, id: 'event-new' };
      databaseService.createItem.mockResolvedValue(createdEvent);

      const response = await request(app)
        .post('/api/events')
        .send(validEventData)
        .expect(201);

      expect(response.body).toEqual(createdEvent);
      expect(databaseService.createItem).toHaveBeenCalledWith('events', expect.objectContaining({
        organizerId: validEventData.organizerId,
        title: validEventData.title,
        type: 'event'
      }));
    });

    it('should validate required fields', async () => {
      const invalidEventData = {
        description: 'Missing required fields'
      };

      const response = await request(app)
        .post('/api/events')
        .send(invalidEventData)
        .expect(400);

      expect(response.body.error).toContain('required');
    });

    it('should validate start date requirement', async () => {
      const invalidEventData = {
        ...validEventData,
        startDate: undefined, // missing start date
      };

      const response = await request(app)
        .post('/api/events')
        .send(invalidEventData)
        .expect(400);

      expect(response.body.error).toContain('required');
    });

    it('should handle database errors', async () => {
      databaseService.createItem.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/events')
        .send(validEventData)
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to create event' });
    });
  });

  describe('PUT /api/events/:id', () => {
    const updateData = {
      title: 'Updated Event Title',
      description: 'Updated description'
    };

    it('should update an existing event', async () => {
      const updatedEvent = { ...mockEvent, ...updateData };
      databaseService.getItem.mockResolvedValue(mockEvent);
      databaseService.updateItem.mockResolvedValue(updatedEvent);

      const response = await request(app)
        .put('/api/events/event-123')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(updatedEvent);
      expect(databaseService.updateItem).toHaveBeenCalledWith('events', 'event-123', expect.objectContaining({
        title: updateData.title,
        description: updateData.description
      }));
    });

    it('should return 404 for non-existent event', async () => {
      databaseService.getItem.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/events/non-existent')
        .send(updateData)
        .expect(404);

      expect(response.body).toEqual({ error: 'Event not found' });
    });

    it('should handle database errors', async () => {
      databaseService.getItem.mockResolvedValue(mockEvent);
      databaseService.updateItem.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/api/events/event-123')
        .send(updateData)
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to update event' });
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('should delete an existing event', async () => {
      databaseService.getItem.mockResolvedValue(mockEvent);
      databaseService.deleteItem.mockResolvedValue();

      const response = await request(app)
        .delete('/api/events/event-123')
        .expect(204);

      expect(response.body).toEqual({});
      expect(databaseService.deleteItem).toHaveBeenCalledWith('events', 'event-123');
    });

    it('should return 404 for non-existent event', async () => {
      databaseService.getItem.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/events/non-existent')
        .expect(404);

      expect(response.body).toEqual({ error: 'Event not found' });
    });

    it('should handle database errors', async () => {
      databaseService.getItem.mockResolvedValue(mockEvent);
      databaseService.deleteItem.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .delete('/api/events/event-123')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to delete event' });
    });
  });

  describe('POST /api/events/:id/rsvp', () => {
    const rsvpData = {
      userId: 'user-789',
      status: 'attending'
    };

    it('should update RSVP for an event', async () => {
      const updatedEvent = { ...mockEvent };
      updatedEvent.rsvps.push({
        userId: rsvpData.userId,
        status: rsvpData.status,
        respondedAt: expect.any(String)
      });

      databaseService.getItem.mockResolvedValue(mockEvent);
      databaseService.updateItem.mockResolvedValue(updatedEvent);

      const response = await request(app)
        .post('/api/events/event-123/rsvp')
        .send(rsvpData)
        .expect(200);

      expect(response.body.rsvps).toContainEqual(expect.objectContaining({
        userId: rsvpData.userId,
        status: rsvpData.status
      }));
    });

    it('should validate RSVP data', async () => {
      const invalidRsvpData = {
        userId: 'user-789'
        // missing status
      };

      const response = await request(app)
        .post('/api/events/event-123/rsvp')
        .send(invalidRsvpData)
        .expect(400);

      expect(response.body.error).toContain('required');
    });

    it('should validate RSVP status', async () => {
      databaseService.getItem.mockResolvedValue(mockEvent);

      const invalidRsvpData = {
        userId: 'user-789',
        status: 'invalid-status'
      };

      const response = await request(app)
        .post('/api/events/event-123/rsvp')
        .send(invalidRsvpData)
        .expect(400);

      expect(response.body.error).toContain('Invalid RSVP status');
    });

    it('should return 404 for non-existent event', async () => {
      databaseService.getItem.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/events/non-existent/rsvp')
        .send(rsvpData)
        .expect(404);

      expect(response.body).toEqual({ error: 'Event not found' });
    });
  });

  describe('GET /api/events/:id/posts', () => {
    it('should return posts for an event', async () => {
      databaseService.getItem.mockResolvedValue(mockEvent);
      databaseService.getItems.mockResolvedValue([mockPost]);

      const response = await request(app)
        .get('/api/events/event-123/posts')
        .expect(200);

      expect(response.body).toEqual([mockPost]);
      expect(databaseService.getItems).toHaveBeenCalledWith('posts', { 
        eventId: 'event-123', 
        type: 'post' 
      });
    });

    it('should return 404 for non-existent event', async () => {
      databaseService.getItem.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/events/non-existent/posts')
        .expect(404);

      expect(response.body).toEqual({ error: 'Event not found' });
    });
  });

  describe('POST /api/events/:id/posts', () => {
    const postData = {
      authorId: 'user-123',
      content: 'New post content'
    };

    it('should create a post for an event', async () => {
      const createdPost = { ...mockPost, ...postData };
      databaseService.getItem.mockResolvedValue(mockEvent);
      databaseService.createItem.mockResolvedValue(createdPost);

      const response = await request(app)
        .post('/api/events/event-123/posts')
        .send(postData)
        .expect(201);

      expect(response.body).toEqual(createdPost);
      expect(databaseService.createItem).toHaveBeenCalledWith('posts', expect.objectContaining({
        authorId: postData.authorId,
        content: postData.content,
        eventId: 'event-123',
        type: 'post'
      }));
    });

    it('should validate post data', async () => {
      databaseService.getItem.mockResolvedValue(mockEvent);

      const invalidPostData = {
        authorId: 'user-123'
        // missing content
      };

      const response = await request(app)
        .post('/api/events/event-123/posts')
        .send(invalidPostData)
        .expect(400);

      expect(response.body.error).toContain('required');
    });

    it('should return 404 for non-existent event', async () => {
      databaseService.getItem.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/events/non-existent/posts')
        .send(postData)
        .expect(404);

      expect(response.body).toEqual({ error: 'Event not found' });
    });
  });
});