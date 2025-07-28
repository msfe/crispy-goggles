# Crispy Goggles

An open-source social networking platform for groups and events, focused on privacy and scalability.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

Crispy Goggles is a privacy-focused, open-source social networking platform designed to help people stay connected with friends and family without compromising their personal data. Built with privacy by design, the platform enables users to create groups, organize events, and communicate securely without being tracked by third parties.

Our mission is to provide a scalable, secure, and user-friendly alternative to traditional social media platforms, putting user privacy and data ownership at the forefront of the experience.

## Features

- **Privacy-First Design**: No tracking, no data mining, no targeted advertising
- **Group Management**: Create and manage private groups for different communities
- **Event Organization**: Plan and coordinate events with seamless scheduling tools
- **Secure Messaging**: End-to-end encrypted communication between users
- **User-Controlled Data**: Full control over personal data with export/delete options
- **Open Source**: Transparent development with community contributions
- **Scalable Architecture**: Built to handle growing communities efficiently
- **Cross-Platform Support**: Accessible via web and mobile applications
- **Self-Hosting Options**: Deploy on your own infrastructure for maximum control

## Technology Stack

- **Frontend**: React.js, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Redis for caching
- **Authentication**: JWT with secure session management
- **Real-time Communication**: Socket.io for live messaging
- **File Storage**: AWS S3 compatible storage
- **Containerization**: Docker and Docker Compose
- **Testing**: Jest, Cypress for end-to-end testing
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus and Grafana

## Getting Started

Follow these instructions to get Crispy Goggles running on your local machine for development and testing purposes.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 16.0 or higher)
- **npm** or **yarn** package manager
- **PostgreSQL** (version 12.0 or higher)
- **Redis** (version 6.0 or higher)
- **Git** for version control

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/msfe/crispy-goggles.git
   cd crispy-goggles
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/crispy_goggles
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your-super-secret-jwt-key
   PORT=3000
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Usage

### Frontend Access

- **Web Application**: Navigate to `http://localhost:3000` in your browser
- **User Registration**: Create a new account using the sign-up form
- **Group Creation**: Use the dashboard to create and manage groups
- **Event Planning**: Access the events section to organize gatherings

### Backend Access

- **API Documentation**: Available at `http://localhost:3000/api/docs`
- **Health Check**: Monitor server status at `http://localhost:3000/health`
- **Admin Panel**: Access administrative functions at `http://localhost:3000/admin`

## Contributing

We welcome contributions from the community! Please follow these steps to contribute:

1. **Fork the repository**
   - Click the "Fork" button at the top right of the repository page

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, documented code
   - Follow the existing code style and conventions
   - Add tests for new functionality

4. **Run tests**
   ```bash
   npm run test
   npm run test:e2e
   ```

5. **Commit your changes**
   ```bash
   git commit -m "Add: description of your changes"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to the original repository and click "New Pull Request"
   - Provide a clear description of your changes
   - Link any relevant issues

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) and [Contributing Guidelines](CONTRIBUTING.md) for more details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Stay connected, stay private, stay in control.**
