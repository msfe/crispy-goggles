# Devcontainer Configuration

This directory contains the devcontainer configuration for GitHub Codespaces and VS Code Remote Development.

## Features

- **Base Image**: Node.js 20 on Debian Bullseye
- **Pre-installed Extensions**: React/TypeScript development tools, ESLint, Prettier
- **Port Forwarding**: 
  - Port 3000: React frontend development server
  - Port 5000: Express backend server
- **Auto-setup**: Dependencies are automatically installed on container creation

## Usage

### GitHub Codespaces
1. Navigate to the repository on GitHub
2. Click the green "Code" button
3. Select "Codespaces" tab
4. Click "Create codespace on main"

### VS Code Remote Development
1. Install the "Remote - Containers" extension
2. Open the repository in VS Code  
3. When prompted, click "Reopen in Container"

## Development Commands

Once the container is ready, you can use the existing npm scripts:

```bash
# Start backend development server
npm run dev:backend

# Start frontend development server  
npm run start:frontend

# Run tests
npm test

# Build for production
npm run build
```

## Port Access

The devcontainer automatically forwards ports 3000 and 5000. You can access:
- Frontend: Click the forwarded port 3000 link or use the Ports panel
- Backend API: Click the forwarded port 5000 link or use curl/Postman

## Included VS Code Extensions

- TypeScript support
- React development tools
- ESLint and Prettier for code formatting
- Auto rename tags
- npm IntelliSense
- React snippets
- JSON language support
- JavaScript debugger