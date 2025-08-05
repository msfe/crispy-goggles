const { v4: uuidv4 } = require('uuid');

/**
 * Base model class with common properties and methods
 */
class BaseModel {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  /**
   * Update the updatedAt timestamp
   */
  touch() {
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Convert to plain object for database storage
   */
  toJSON() {
    return { ...this };
  }

  /**
   * Validate required fields
   * Override in child classes
   */
  validate() {
    if (!this.id) {
      throw new Error('ID is required');
    }
    return true;
  }
}

/**
 * User model
 */
class User extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.type = 'user';
    this.azureId = data.azureId || null;
    this.email = data.email || '';
    this.name = data.name || '';
    this.bio = data.bio || '';
    this.contactDetails = data.contactDetails || {};
    this.role = data.role || 'member'; // global_admin, group_admin, member
    this.privacySettings = data.privacySettings || {
      profilePictureVisibility: 'friends',
      bioVisibility: 'friends',
      contactDetailsVisibility: 'friends',
      friendsListVisibility: 'friends',
      userDiscoverability: 'friends_of_friends'
    };
  }

  validate() {
    super.validate();
    if (!this.email) {
      throw new Error('Email is required');
    }
    if (!this.name) {
      throw new Error('Name is required');
    }
    if (!['global_admin', 'group_admin', 'member'].includes(this.role)) {
      throw new Error('Invalid role');
    }
    return true;
  }
}

/**
 * Friendship model
 */
class Friendship extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.type = 'friendship';
    this.userId = data.userId || '';
    this.friendId = data.friendId || '';
    this.status = data.status || 'pending'; // pending, accepted, rejected
    this.requestedBy = data.requestedBy || '';
  }

  validate() {
    super.validate();
    if (!this.userId) {
      throw new Error('User ID is required');
    }
    if (!this.friendId) {
      throw new Error('Friend ID is required');
    }
    if (!this.requestedBy) {
      throw new Error('Requested by is required');
    }
    if (!['pending', 'accepted', 'rejected'].includes(this.status)) {
      throw new Error('Invalid status');
    }
    if (this.userId === this.friendId) {
      throw new Error('User cannot befriend themselves');
    }
    return true;
  }
}

/**
 * Group model
 */
class Group extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.type = 'group';
    this.name = data.name || '';
    this.description = data.description || '';
    this.tags = data.tags || [];
    this.adminIds = data.adminIds || [];
    this.memberIds = data.memberIds || [];
    this.membershipRequests = data.membershipRequests || [];
    
    // Handle both isPublic boolean and privacy string fields
    if (data.isPublic !== undefined) {
      this.isPublic = data.isPublic;
    } else if (data.privacy !== undefined) {
      this.isPublic = data.privacy === 'public';
    } else {
      this.isPublic = true; // default to public
    }
  }

  validate() {
    super.validate();
    if (!this.name) {
      throw new Error('Group name is required');
    }
    if (!Array.isArray(this.tags)) {
      throw new Error('Tags must be an array');
    }
    if (!Array.isArray(this.adminIds) || this.adminIds.length === 0) {
      throw new Error('At least one admin is required');
    }
    return true;
  }

  /**
   * Add a member to the group
   */
  addMember(userId) {
    if (!this.memberIds.includes(userId)) {
      this.memberIds.push(userId);
      this.touch();
    }
  }

  /**
   * Remove a member from the group
   */
  removeMember(userId) {
    this.memberIds = this.memberIds.filter(id => id !== userId);
    this.membershipRequests = this.membershipRequests.filter(id => id !== userId);
    this.touch();
  }

  /**
   * Add a membership request
   */
  addMembershipRequest(userId) {
    if (!this.membershipRequests.includes(userId) && !this.memberIds.includes(userId)) {
      this.membershipRequests.push(userId);
      this.touch();
    }
  }
}

/**
 * Post model
 */
class Post extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.type = 'post';
    this.authorId = data.authorId || '';
    this.groupId = data.groupId || null;
    this.eventId = data.eventId || null;
    this.content = data.content || '';
    this.attachments = data.attachments || [];
  }

  validate() {
    super.validate();
    if (!this.authorId) {
      throw new Error('Author ID is required');
    }
    if (!this.content) {
      throw new Error('Content is required');
    }
    if (!this.groupId && !this.eventId) {
      throw new Error('Either group ID or event ID is required');
    }
    if (this.groupId && this.eventId) {
      throw new Error('Post cannot belong to both group and event');
    }
    return true;
  }
}

/**
 * Comment model
 */
class Comment extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.type = 'comment';
    this.postId = data.postId || '';
    this.authorId = data.authorId || '';
    this.content = data.content || '';
  }

  validate() {
    super.validate();
    if (!this.postId) {
      throw new Error('Post ID is required');
    }
    if (!this.authorId) {
      throw new Error('Author ID is required');
    }
    if (!this.content) {
      throw new Error('Content is required');
    }
    return true;
  }
}

/**
 * Event model
 */
class Event extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.type = 'event';
    this.organizerId = data.organizerId || '';
    this.title = data.title || '';
    this.description = data.description || '';
    this.location = data.location || '';
    this.startDate = data.startDate || '';
    this.endDate = data.endDate || '';
    this.invitedUserIds = data.invitedUserIds || [];
    this.invitedGroupIds = data.invitedGroupIds || [];
    this.rsvps = data.rsvps || [];
  }

  validate() {
    super.validate();
    if (!this.organizerId) {
      throw new Error('Organizer ID is required');
    }
    if (!this.title) {
      throw new Error('Title is required');
    }
    if (!this.startDate) {
      throw new Error('Start date is required');
    }
    if (this.endDate && new Date(this.endDate) < new Date(this.startDate)) {
      throw new Error('End date cannot be before start date');
    }
    return true;
  }

  /**
   * Add or update RSVP
   */
  updateRSVP(userId, status) {
    const validStatuses = ['attending', 'not_attending', 'maybe'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid RSVP status');
    }

    const existingRsvpIndex = this.rsvps.findIndex(rsvp => rsvp.userId === userId);
    
    if (existingRsvpIndex >= 0) {
      this.rsvps[existingRsvpIndex] = {
        userId,
        status,
        respondedAt: new Date().toISOString()
      };
    } else {
      this.rsvps.push({
        userId,
        status,
        respondedAt: new Date().toISOString()
      });
    }
    
    this.touch();
  }

  /**
   * Get RSVP for a user
   */
  getRSVP(userId) {
    return this.rsvps.find(rsvp => rsvp.userId === userId);
  }
}

module.exports = {
  BaseModel,
  User,
  Friendship,
  Group,
  Post,
  Comment,
  Event
};