# crispy-goggles
**Stay in contact with friends and family without getting tracked.**

This open-source project aims to create a social networking platform focused on groups and events without tracking users. The project is designed to be simple, privacy-focused, and scalable.

## Table of Contents
 

* Project Overview
* Features
* Technology Stack
* Getting Started
* Prerequisites
* Installation
* Usage
* Contributing

## Project Overview
 
This project is a prototype of a social network platform similar to Facebook, with a primary focus on groups and events. It is designed to respect user privacy by avoiding tracking. Core functionalities include group creation, event management, and friendship interactions, with future scalability in mind.

## Features
 
User Authentication: Secure sign-up and login using Azure CIAM.
Friendship Management: Add and accept friend requests.
Groups: Create, find, join, post, and comment within groups.
Events: Create events, invite users, RSVP, post, and comment on event walls.


## Technology Stack

Frontend: React.js
Backend: Node.js with Express.js
Database: Azure Cosmos DB
Authentication: Azure CIAM
Deployment: Azure App Service

## Getting Started
 
Follow these instructions to set up the project on your local machine for development and testing purposes.

### Prerequisites
 
Node.js: Install Node.js from nodejs.org (V22 LTS)
Azure Account: Set up an Azure account to access Azure services.

### Installation
 
1. Clone the Repository


```
git clone https://github.com/msfe/crispy-googles.git  
cd crispy-googles
```
 
2. Install Dependencies

```
npm install
```

3. Configure Environment Variables

Create a .env file in the root of the project with the following keys:

```
AZURE_CIAM_CLIENT_ID=your_client_id  
AZURE_CIAM_SECRET=your_secret  
AZURE_COSMOS_DB_URI=your_cosmos_db_uri  
AZURE_COSMOS_DB_KEY=your_cosmos_db_key
```

4. Run the Application

```
npm start  
Your application should now be running on http://localhost:3000.
```

## Usage
 

Frontend: Access the application via a web browser at `http://localhost:3000`.
Backend API: Interact with the backend through RESTful API endpoints.

## Contributing
 
We welcome contributions from the community! Please follow these steps to contribute:

1. Fork the repository.
1. Create a feature branch (git checkout -b feature/your-feature).
1. Commit your changes (git commit -m 'Add your feature').
1. Push to the branch (git push origin feature/your-feature).
1. Open a Pull Request.
