# Development Guide

This guide will help you set up your local development environment for Muminbook.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Running the Application](#running-the-application)
- [Development Workflow](#development-workflow)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

### Required

- **Node.js** (v18.0.0 or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify: `node --version`

- **npm** (v9.0.0 or higher)
  - Comes with Node.js
  - Verify: `npm --version`

- **MongoDB** (v6.0 or higher)
  - Download from [mongodb.com](https://www.mongodb.com/try/download/community)
  - Or use MongoDB Atlas (cloud database)
  - Verify: `mongod --version`

- **Git**
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify: `git --version`

### Recommended

- **MongoDB Compass** - GUI for MongoDB
- **Postman** or **Insomnia** - API testing
- **VS Code** - Code editor with extensions:
  - ESLint
  - Prettier
  - MongoDB for VS Code
  - Thunder Client (API testing)

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Shahtr1/muminbook.git
cd muminbook
```

### 2. Install Dependencies

Install dependencies for both frontend and backend:

```bash
# Install root dependencies and all workspace dependencies
npm install
```

Or install individually:

```bash
# Backend dependencies
npm run install:backend

# Frontend dependencies
npm run install:frontend
```

### 3. Set Up MongoDB

#### Option A: Local MongoDB

1. Start MongoDB service:
   ```bash
   # On macOS/Linux
   sudo systemctl start mongod
   
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Windows
   net start MongoDB
   ```

2. Verify MongoDB is running:
   ```bash
   mongosh
   # You should see a MongoDB shell prompt
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Set up database user and password
4. Whitelist your IP address or use `0.0.0.0/0` for development
5. Get your connection string (looks like `mongodb+srv://...`)

### 4. Configure Environment Variables

#### Backend Environment

```bash
cd backend
cp sample.env .env
```

Edit `backend/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/muminbook
# Or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/muminbook

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email Configuration (for Resend)
RESEND_API_KEY=your-resend-api-key

# CORS
FRONTEND_URL=http://localhost:5173

# Other configurations as needed
```

#### Frontend Environment

```bash
cd frontend
cp sample.env .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

### Development Mode

#### Run Both Backend and Frontend Simultaneously

```bash
# From the root directory
npm run dev
```

This will start:
- Backend server at `http://localhost:5000`
- Frontend dev server at `http://localhost:5173`

#### Run Individually

**Backend Only:**
```bash
npm run dev:backend
# or
cd backend
npm run backend
```

**Frontend Only:**
```bash
npm run dev:frontend
# or
cd frontend
npm run frontend
```

### Production Build

#### Build Both Applications

```bash
npm run build
```

#### Build Individually

```bash
# Backend
npm run build:backend

# Frontend
npm run build:frontend
```

#### Run Production Build

```bash
# Backend
cd backend
npm start

# Frontend (serve the built files)
cd frontend
npm run preview
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

Edit files in your preferred code editor.

### 3. Test Your Changes

```bash
# Lint the code
npm run lint

# Run frontend tests
npm run test
```

### 4. Check Your Code

```bash
# Verify backend builds
npm run build:backend

# Verify frontend builds
npm run build:frontend
```

### 5. Commit Your Changes

```bash
git add .
git commit -m "feat: description of your changes"
```

### 6. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Database Setup

### Seed Data (if available)

If seed scripts are provided:

```bash
cd backend
npm run seed
```

### Manual Data Setup

1. Open MongoDB Compass or `mongosh`
2. Connect to your database
3. Create collections as needed
4. Insert sample data for testing

### Database Migrations

Database schema changes should be:
1. Documented in migration files (future implementation)
2. Applied carefully to existing data
3. Tested on a copy of production data

## Environment Variables

### Backend Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 5000 |
| `NODE_ENV` | Environment | No | development |
| `MONGO_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | JWT signing key | Yes | - |
| `JWT_EXPIRES_IN` | Token expiration | No | 7d |
| `RESEND_API_KEY` | Email service API key | Yes | - |
| `FRONTEND_URL` | Frontend URL for CORS | Yes | - |

### Frontend Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | Yes | - |

**Note:** Vite requires all environment variables to be prefixed with `VITE_` to be exposed to the client.

## Common Tasks

### Add a New Package

**Backend:**
```bash
cd backend
npm install package-name
```

**Frontend:**
```bash
cd frontend
npm install package-name
```

### Update Dependencies

```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Or for specific packages
npm install package-name@latest
```

### Clear Cache and Reinstall

```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json

# Reinstall
npm install
```

### Database Operations

**Backup Database:**
```bash
mongodump --db muminbook --out ./backup
```

**Restore Database:**
```bash
mongorestore --db muminbook ./backup/muminbook
```

**Drop Database (Careful!):**
```bash
mongosh
use muminbook
db.dropDatabase()
```

### Debugging

#### Backend Debugging

Add debugger statements or use Node.js debugging:

```bash
# In VS Code, add a launch configuration
# Or use Chrome DevTools
node --inspect src/index.ts
```

#### Frontend Debugging

- Use React DevTools browser extension
- Use browser Developer Tools (F12)
- Console.log debugging
- React Query DevTools (already integrated)

### Running Specific Tests

**Frontend:**
```bash
cd frontend
npm test -- path/to/test-file.test.jsx
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>
```

### MongoDB Connection Issues

1. Verify MongoDB is running:
   ```bash
   mongosh
   ```

2. Check connection string in `.env`
3. Verify network connectivity (for Atlas)
4. Check IP whitelist (for Atlas)
5. Verify credentials

### Module Not Found Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

1. Check Node.js version: `node --version`
2. Clear build cache:
   ```bash
   rm -rf backend/dist
   rm -rf frontend/dist
   ```
3. Rebuild:
   ```bash
   npm run build
   ```

### TypeScript Errors (Backend)

1. Check `tsconfig.json` configuration
2. Verify all type definitions are installed
3. Run type checking:
   ```bash
   cd backend
   npx tsc --noEmit
   ```

### Frontend Hot Reload Not Working

1. Check Vite configuration
2. Verify file watcher limits (Linux):
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

### Environment Variables Not Loading

1. Verify `.env` files exist
2. Restart development servers
3. Check variable names (must start with `VITE_` for frontend)
4. Verify no syntax errors in `.env` files

### CORS Errors

1. Check `FRONTEND_URL` in backend `.env`
2. Verify CORS middleware configuration in `backend/src/app.ts`
3. Clear browser cache
4. Check browser console for specific error

## Getting Help

If you encounter issues not covered here:

1. Check [GitHub Issues](https://github.com/Shahtr1/muminbook/issues)
2. Search existing documentation
3. Ask in team discussions
4. Create a new issue with:
   - Detailed description
   - Steps to reproduce
   - Environment details
   - Error messages/logs

## Useful Commands Cheat Sheet

```bash
# Development
npm run dev                # Run both backend and frontend
npm run dev:backend        # Run backend only
npm run dev:frontend       # Run frontend only

# Building
npm run build              # Build both
npm run build:backend      # Build backend
npm run build:frontend     # Build frontend

# Testing & Linting
npm run lint               # Lint frontend
npm run test               # Run frontend tests

# Dependencies
npm install                # Install all dependencies
npm run install:backend    # Install backend deps
npm run install:frontend   # Install frontend deps

# Git
git status                 # Check status
git log --oneline          # View commit history
git diff                   # View changes
```

---

Happy coding! 🚀
