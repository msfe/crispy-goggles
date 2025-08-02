const express = require('express');
const router = express.Router();
const { Event, Post, Comment } = require('../models');
const databaseService = require('../services/databaseService');
const { isConfigured } = require('../config/cosmosConfig');

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management endpoints
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     tags: [Events]
 *     summary: Get all events
 *     description: Retrieve a list of all events with optional filtering
 *     parameters:
 *       - in: query
 *         name: organizerId
 *         schema:
 *           type: string
 *         description: Filter events by organizer ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter events where user is invited or attending
 *     responses:
 *       200:
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    // Check if database is configured
    if (!isConfigured) {
      return res.status(503).json({ 
        error: 'Database not configured. Please configure Cosmos DB.' 
      });
    }

    const { organizerId, userId } = req.query;
    
    let queryFilter = { type: 'event' };
    
    if (organizerId) {
      queryFilter.organizerId = organizerId;
    }
    
    const events = await databaseService.getItems('events', queryFilter);
    
    // Filter by user invitation or attendance if userId provided
    let filteredEvents = events;
    if (userId) {
      filteredEvents = events.filter(event => 
        (event.invitedUserIds && event.invitedUserIds.includes(userId)) || 
        (event.rsvps && event.rsvps.some(rsvp => rsvp.userId === userId))
      );
    }
    
    res.json(filteredEvents);
  } catch (error) {
    console.error('Error getting events:', error);
    
    // Handle specific database connection errors
    if (error.message.includes('Database not configured') || error.message.includes('not initialized')) {
      return res.status(503).json({ error: 'Database not configured. Please configure Cosmos DB.' });
    }
    
    res.status(500).json({ error: 'Failed to get events' });
  }
});

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     tags: [Events]
 *     summary: Get event by ID
 *     description: Retrieve a specific event by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    // Check if database is configured
    if (!isConfigured) {
      return res.status(503).json({ 
        error: 'Database not configured. Please configure Cosmos DB.' 
      });
    }

    const { id } = req.params;
    const event = await databaseService.getItem('events', id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error getting event:', error);
    
    // Handle specific database connection errors
    if (error.message.includes('Database not configured') || error.message.includes('not initialized')) {
      return res.status(503).json({ error: 'Database not configured. Please configure Cosmos DB.' });
    }
    
    res.status(500).json({ error: 'Failed to get event' });
  }
});

/**
 * @swagger
 * /api/events:
 *   post:
 *     tags: [Events]
 *     summary: Create a new event
 *     description: Create a new event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizerId
 *               - title
 *               - startDate
 *             properties:
 *               organizerId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               invitedUserIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               invitedGroupIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  try {
    // Check if database is configured
    if (!isConfigured) {
      return res.status(503).json({ 
        error: 'Database not configured. Please configure Cosmos DB.' 
      });
    }

    const eventData = req.body;
    const event = new Event(eventData);
    
    // Validate the event
    event.validate();
    
    const savedEvent = await databaseService.createItem('events', event.toJSON());
    
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    
    // Handle specific database connection errors
    if (error.message.includes('Database not configured') || error.message.includes('not initialized')) {
      return res.status(503).json({ error: 'Database not configured. Please configure Cosmos DB.' });
    }
    
    if (error.message.includes('required') || error.message.includes('Invalid')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to create event' });
  }
});

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     tags: [Events]
 *     summary: Update an event
 *     description: Update an existing event
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               invitedUserIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               invitedGroupIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const existingEvent = await databaseService.getItem('events', id);
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Create updated event object
    const updatedEventData = { ...existingEvent, ...updateData };
    const updatedEvent = new Event(updatedEventData);
    updatedEvent.touch(); // Update the updatedAt timestamp
    
    // Validate the updated event
    updatedEvent.validate();
    
    const savedEvent = await databaseService.updateItem('events', id, updatedEvent.toJSON());
    
    res.json(savedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    
    if (error.message.includes('required') || error.message.includes('Invalid')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to update event' });
  }
});

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     tags: [Events]
 *     summary: Delete an event
 *     description: Delete an existing event
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       204:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingEvent = await databaseService.getItem('events', id);
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    await databaseService.deleteItem('events', id);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

/**
 * @swagger
 * /api/events/{id}/rsvp:
 *   post:
 *     tags: [Events]
 *     summary: RSVP to an event
 *     description: Update or create RSVP for an event
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - status
 *             properties:
 *               userId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [attending, not_attending, maybe]
 *     responses:
 *       200:
 *         description: RSVP updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 *       400:
 *         description: Invalid RSVP status
 *       500:
 *         description: Server error
 */
router.post('/:id/rsvp', async (req, res) => {
  try {
    // Check if database is configured
    if (!isConfigured) {
      return res.status(503).json({ 
        error: 'Database not configured. Please configure Cosmos DB.' 
      });
    }

    const { id } = req.params;
    const { userId, status } = req.body;
    
    if (!userId || !status) {
      return res.status(400).json({ error: 'User ID and status are required' });
    }
    
    const existingEvent = await databaseService.getItem('events', id);
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const event = new Event(existingEvent);
    
    try {
      event.updateRSVP(userId, status);
    } catch (rsvpError) {
      return res.status(400).json({ error: rsvpError.message });
    }
    
    const savedEvent = await databaseService.updateItem('events', id, event.toJSON());
    
    res.json(savedEvent);
  } catch (error) {
    console.error('Error updating RSVP:', error);
    
    // Handle specific database connection errors
    if (error.message.includes('Database not configured') || error.message.includes('not initialized')) {
      return res.status(503).json({ error: 'Database not configured. Please configure Cosmos DB.' });
    }
    
    res.status(500).json({ error: 'Failed to update RSVP' });
  }
});

/**
 * @swagger
 * /api/events/{id}/posts:
 *   get:
 *     tags: [Events]
 *     summary: Get posts for an event
 *     description: Retrieve all posts for a specific event
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: List of posts for the event
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
router.get('/:id/posts', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if event exists
    const event = await databaseService.getItem('events', id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const posts = await databaseService.getItems('posts', { eventId: id, type: 'post' });
    
    res.json(posts);
  } catch (error) {
    console.error('Error getting event posts:', error);
    res.status(500).json({ error: 'Failed to get event posts' });
  }
});

/**
 * @swagger
 * /api/events/{id}/posts:
 *   post:
 *     tags: [Events]
 *     summary: Create a post in an event
 *     description: Create a new post on the event wall
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - authorId
 *               - content
 *             properties:
 *               authorId:
 *                 type: string
 *               content:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Event not found
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/:id/posts', async (req, res) => {
  try {
    const { id } = req.params;
    const { authorId, content, attachments = [] } = req.body;
    
    // Check if event exists
    const event = await databaseService.getItem('events', id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const postData = {
      authorId,
      eventId: id,
      content,
      attachments
    };
    
    const post = new Post(postData);
    post.validate();
    
    const savedPost = await databaseService.createItem('posts', post.toJSON());
    
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Error creating event post:', error);
    
    if (error.message.includes('required') || error.message.includes('Invalid')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to create event post' });
  }
});

module.exports = router;