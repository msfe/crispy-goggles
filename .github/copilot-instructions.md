# GitHub Copilot Instructions
 
This document outlines the key features, architecture, and development guidelines for the project. It serves as a reference for developers and contributors to understand the project's scope and technical details.
 
## MVP Features
 
User Authentication and Management:
Sign Up: Users can sign up using email/password or social accounts supported by Microsoft Entra External ID.
User Roles: Global admin, group admin, and member roles.
Profile Management: Users can set up profiles with name, bio, and optional contact details (visible to friends).
Friendship Management:
Add Friend: Users can send friend requests.
Accept Friend: Users can accept or reject incoming friend requests.
Group Management:
Create Group: Users (or admins) can create groups.
Find Group: Users can search or browse groups by tags.
Apply for Group Membership: Users can apply to join a group.
Accept or Reject New Member: Group admins can manage membership requests.
Post in Group: Members can post content within the group.
Comment on Post in Group: Members can comment on posts.
Event Management:
Create Event: Users can create events with details.
Invite Friends and Group to Event: Users can invite friends or group members.
RSVP to Event: Users can RSVP to events.
Post in Event: Members can post content on the event's wall.
Comment on Post in Event: Members can comment on event posts.
Architecture and Technology Stack
 

Frontend:
Framework: React.js for building a dynamic and responsive user interface.
State Management: Consider using Redux or Context API for state management.
UI Components: Use libraries like Material-UI or Ant Design for consistent and reusable UI components.
Backend:
Framework: Node.js with Express.js for handling HTTP requests and building APIs.
Authentication: Integrate Microsoft Entra External ID for secure authentication and user management.
Database:
Database Choice: Azure Cosmos DB for scalable and globally distributed data storage.
Data Model: Consider using a NoSQL data model to handle user profiles, friendships, groups, posts, comments, and events efficiently.
Infrastructure:
Hosting: Azure App Service for deploying and managing your Node.js application.
Security: Ensure HTTPS is enforced for client-server communication. Use Azure Key Vault to manage sensitive information like API keys and connection strings.
Deployment:
Deploy your application in Azure's Central Sweden data center for compliance and latency considerations.
Additional Security Measures
 
Given the focus on privacy and security, here are some recommended measures:

Rate Limiting: Implement rate limiting on API endpoints to prevent abuse.
Input Validation: Validate and sanitize inputs to prevent injection attacks.
Audit Logging: Log key actions for monitoring and auditing purposes.
Scalability Considerations
 

Horizontal Scaling: Design the application to be stateless where possible to enable horizontal scaling easily.
Load Balancing: Use Azure Load Balancer or Azure Front Door for efficient distribution of traffic.
Development Guidelines
 

Version Control: Use Git and set up a CI/CD pipeline with Azure DevOps for automated testing and deployment.
Testing: Implement unit and integration tests to ensure code quality and functionality.

## Colors

Primary Color
Lavender Purple: #a861ba
Usage: Primary buttons, highlights, and key interactive elements.
Secondary Color
Soft Lilac: #c8a2c8
Usage: Backgrounds for cards, secondary buttons, and hover effects.
Accent Color
Cool Teal: #4ecca3
Usage: Links, icons, and notification badges to add a pop of interest.
Neutral Base Colors
Light Gray: #f5f5f5
Usage: General background color for a clean and calming canvas.
Medium Gray: #b0b0b0
Usage: Text color for secondary information, borders, and dividers.
Dark Accent
Charcoal Black: #333333
Usage: Primary text color for strong contrast and readability.
Implementation Tips:
 

Balance: Use the lavender purple and soft lilac for large areas to maintain calmness while letting the teal accent add lively touches.
Contrast: Ensure text and critical elements have sufficient contrast against backgrounds for accessibility.
Consistency: Apply colors consistently across components to maintain a cohesive look.
