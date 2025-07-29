# Crispy Goggles - Social Networking Platform

A privacy-focused social networking platform focused on groups and events, built with modern web technologies.

## 🏗️ Architecture

This project uses a clean separation between frontend and backend:

```
crispy-goggles/
├── client/          # React frontend with Vite
├── server/          # Node.js Express backend  
├── .github/         # GitHub workflows and documentation
└── package.json     # Root-level scripts and configuration
```

## 🚀 Technology Stack

### Frontend
- **Framework**: React 19 with Vite (modern replacement for Create React App)
- **Build Tool**: Vite for fast development and optimized builds
- **Testing**: Vitest with React Testing Library
- **State Management**: Context API (with Redux consideration for complex state)
- **UI Components**: Planned Material-UI or Ant Design integration

### Backend  
- **Framework**: Node.js with Express.js
- **Authentication**: Microsoft Entra External ID integration (planned)
- **Database**: Azure Cosmos DB (planned)
- **Environment**: dotenv for configuration management

### Infrastructure (Planned)
- **Hosting**: Azure App Service
- **Security**: HTTPS enforcement, Azure Key Vault for secrets
- **Deployment**: Azure DevOps CI/CD pipeline
- **Data Center**: Azure Central Sweden for compliance

## 🎯 MVP Features

### User Management
- Sign up with email/password or social accounts (Microsoft Entra External ID)
- User roles: Global admin, group admin, and member
- Profile management with name, bio, and contact details

### Social Features
- **Friendship Management**: Send/accept friend requests
- **Group Management**: Create, find, and join groups with tag-based search
- **Event Management**: Create events, invite friends/groups, RSVP functionality
- **Content Sharing**: Post and comment within groups and events

## 🛠️ Installation

### Quick Start with GitHub Codespaces ⚡

The fastest way to get started is using GitHub Codespaces:

1. Click the green **"Code"** button on the GitHub repository
2. Select the **"Codespaces"** tab
3. Click **"Create codespace on main"**

The development environment will be automatically configured with:
- Node.js 20 runtime
- All dependencies pre-installed
- VS Code extensions for React/Node.js development
- Port forwarding for frontend (3000) and backend (5000)

### Traditional Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/msfe/crispy-goggles.git
   cd crispy-goggles
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

   This command installs dependencies for:
   - Root level workspace
   - Client (React frontend)  
   - Server (Express backend)

## 🚀 Usage

### Development Mode

**Start the backend server:**
```bash
npm run dev:backend
# Server runs on http://localhost:5000 with auto-restart
```

**Start the frontend development server:**
```bash  
npm run start:frontend
# React app runs on http://localhost:3000 with hot-reload
```

**Alternative development commands:**
```bash
npm run dev:frontend    # Same as start:frontend
npm run dev            # Starts backend only
```

### Production

**Build the frontend:**
```bash
npm run build
# Creates optimized production build in client/dist/
```

**Start production backend:**
```bash
npm run start:backend
# Runs Express server in production mode
```

### Testing

**Run frontend tests:**
```bash
npm test
# Runs Vitest test suite with React Testing Library
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=5000
NODE_ENV=development
# Database connection strings (when implemented)
# Authentication secrets (when implemented)
```

### Available API Endpoints

- `GET /health` - Health check endpoint returning server status

## 🧪 Testing

The project includes a comprehensive testing setup:

- **Frontend**: Vitest with React Testing Library for component testing
- **Coverage**: Built-in coverage reporting with Vitest
- **CI/CD**: Planned integration with Azure DevOps

Run tests with:
```bash
npm test                    # Run all tests once
cd client && npm test       # Interactive test mode
```

## 🔒 Security Features

- Rate limiting on API endpoints (planned)
- Input validation and sanitization (planned)  
- Audit logging for monitoring (planned)
- HTTPS enforcement (planned)
- Azure Key Vault integration (planned)

## 📈 Scalability Considerations

- Stateless application design for horizontal scaling
- Azure Load Balancer integration (planned)
- Efficient NoSQL data modeling with Cosmos DB (planned)

## 🤝 Contributing

1. Follow the development guidelines in `.github/copilot-instructions.md`
2. Run tests before submitting changes
3. Use the provided npm scripts for consistent development experience

## 📄 License

ISC License - see LICENSE file for details.

---

**Note**: This project has migrated from Create React App to Vite for improved performance and future-proofing, following React team's recommendation to use modern build tools.