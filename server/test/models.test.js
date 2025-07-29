/**
 * Tests for data models
 * These tests validate the model structure and validation logic
 */

const { User, Friendship, Group, Post, Comment, Event } = require('../models');

describe('Data Models', () => {
  describe('User Model', () => {
    test('should create a valid user', () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        bio: 'A test user',
        role: 'member'
      };
      
      const user = new User(userData);
      
      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.role).toBe('member');
      expect(user.type).toBe('user');
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    test('should validate required fields', () => {
      const user = new User();
      
      expect(() => user.validate()).toThrow('Email is required');
    });

    test('should validate role', () => {
      const user = new User({
        email: 'test@example.com',
        name: 'Test User',
        role: 'invalid_role'
      });
      
      expect(() => user.validate()).toThrow('Invalid role');
    });
  });

  describe('Group Model', () => {
    test('should create a valid group', () => {
      const groupData = {
        name: 'Test Group',
        description: 'A test group',
        tags: ['test', 'group'],
        adminIds: ['admin-id'],
        isPublic: true
      };
      
      const group = new Group(groupData);
      
      expect(group.id).toBeDefined();
      expect(group.name).toBe('Test Group');
      expect(group.tags).toEqual(['test', 'group']);
      expect(group.adminIds).toEqual(['admin-id']);
      expect(group.type).toBe('group');
    });

    test('should validate required admin', () => {
      const group = new Group({
        name: 'Test Group',
        adminIds: []
      });
      
      expect(() => group.validate()).toThrow('At least one admin is required');
    });

    test('should add and remove members', () => {
      const group = new Group({
        name: 'Test Group',
        adminIds: ['admin-id']
      });
      
      group.addMember('user-1');
      expect(group.memberIds).toContain('user-1');
      
      group.removeMember('user-1');
      expect(group.memberIds).not.toContain('user-1');
    });
  });

  describe('Friendship Model', () => {
    test('should create a valid friendship', () => {
      const friendshipData = {
        userId: 'user1',
        friendId: 'user2',
        requestedBy: 'user1',
        status: 'pending'
      };
      
      const friendship = new Friendship(friendshipData);
      
      expect(friendship.userId).toBe('user1');
      expect(friendship.friendId).toBe('user2');
      expect(friendship.status).toBe('pending');
      expect(friendship.type).toBe('friendship');
    });

    test('should not allow self-friendship', () => {
      const friendship = new Friendship({
        userId: 'user1',
        friendId: 'user1',
        requestedBy: 'user1'
      });
      
      expect(() => friendship.validate()).toThrow('User cannot befriend themselves');
    });
  });

  describe('Event Model', () => {
    test('should create a valid event', () => {
      const eventData = {
        organizerId: 'organizer-id',
        title: 'Test Event',
        startDate: '2024-06-15T18:00:00Z',
        endDate: '2024-06-15T22:00:00Z'
      };
      
      const event = new Event(eventData);
      
      expect(event.title).toBe('Test Event');
      expect(event.organizerId).toBe('organizer-id');
      expect(event.type).toBe('event');
    });

    test('should validate date order', () => {
      const event = new Event({
        organizerId: 'organizer-id',
        title: 'Test Event',
        startDate: '2024-06-15T18:00:00Z',
        endDate: '2024-06-15T10:00:00Z' // Before start date
      });
      
      expect(() => event.validate()).toThrow('End date cannot be before start date');
    });

    test('should manage RSVPs', () => {
      const event = new Event({
        organizerId: 'organizer-id',
        title: 'Test Event',
        startDate: '2024-06-15T18:00:00Z'
      });
      
      event.updateRSVP('user1', 'attending');
      expect(event.getRSVP('user1').status).toBe('attending');
      
      event.updateRSVP('user1', 'not_attending');
      expect(event.getRSVP('user1').status).toBe('not_attending');
    });
  });
});

// Mock console methods to avoid noise in tests
global.console = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};