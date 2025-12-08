# 🚀 Setup Guide

This guide will help you set up Muminbook for local development.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Email Service Setup](#email-service-setup)
- [Running the Application](#running-the-application)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

## ✅ Prerequisites

### Required Software

1. **Node.js** (v18.20.5 or higher)

   ```bash
   # Check your version
   node --version

   # Install using nvm (recommended)
   nvm install 18.20.5
   nvm use
   ```

2. **npm** (v9.0.0 or higher)

   ```bash
   npm --version
   ```

3. **Git**

   ```bash
   git --version
   ```

4. **MongoDB** (Choose one option below)

### IDE Recommendations

- **VS Code** with extensions:
  - ESLint
  - Prettier
  - EditorConfig
  - MongoDB for VS Code
  - Thunder Client (API testing)

## 📥 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Shahtr1/muminbook.git
cd muminbook
```

### 2. Use Correct Node Version

```bash
# If using nvm
nvm use
```

### 3. Install Dependencies

```bash
# Install all packages (backend + frontend)
npm install
```

This will install dependencies for both packages using NPM workspaces. You should see:

- Root dependencies (concurrently)
- Backend dependencies (Express, Mongoose, etc.)
- Frontend dependencies (React, Vite, Chakra UI, etc.)

## 🗄️ Database Setup

### Option 1: MongoDB Atlas (Recommended for Development)

**Free Tier:** 512 MB storage, no credit card required

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free account

2. **Create Cluster**
   - Choose "Shared" (FREE tier)
   - Select closest region
   - Click "Create Cluster"

3. **Database Access**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Set username and password (save these!)
   - Select "Built-in Role: Read and write to any database"

4. **Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

   Example:

   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/muminbook?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB

1. **Install MongoDB Community Edition**

   **macOS (Homebrew):**

   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community
   ```

   **Windows:**
   - Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Run installer
   - MongoDB Compass is included

   **Linux (Ubuntu):**

   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   sudo systemctl start mongod
   ```

2. **Verify Installation**

   ```bash
   mongo --version
   # or
   mongosh --version
   ```

3. **Connection String**
   ```
   mongodb://localhost:27017/muminbook
   ```

## ⚙️ Environment Configuration

### Backend Environment

1. **Copy Sample File**

   ```bash
   cp packages/backend/sample.env packages/backend/.env
   ```

2. **Edit `packages/backend/.env`**

   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000

   # Database
   MONGO_URI=mongodb://localhost:27017/muminbook
   # OR for MongoDB Atlas:
   # MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/muminbook?retryWrites=true&w=majority

   # JWT Secrets (Generate secure random strings)
   JWT_ACCESS_SECRET=your_super_secret_access_token_key_here
   JWT_REFRESH_SECRET=your_super_secret_refresh_token_key_here

   # JWT Expiration
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d

   # Email Service (Resend)
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
   EMAIL_SENDER=noreply@yourdomain.com
   EMAIL_FROM_NAME=Muminbook

   # Frontend URL (for CORS and email links)
   APP_ORIGIN=http://localhost:5173

   # Admin User (First user with admin role)
   ADMIN_EMAIL=admin@muminbook.com
   ADMIN_PASSWORD=changeme123
   ```

### Generating Secure Secrets

**JWT Secrets:**

```bash
# Generate random string (Node.js)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or use OpenSSL
openssl rand -hex 64
```

### Frontend Environment

1. **Copy Sample File**

   ```bash
   cp packages/frontend/sample.env packages/frontend/.env
   ```

2. **Edit `packages/frontend/.env`**

   ```env
   # Backend API URL
   VITE_API_URL=http://localhost:5000

   # App Configuration
   VITE_APP_NAME=Muminbook
   VITE_APP_VERSION=1.0.0
   ```

## 📧 Email Service Setup

Muminbook uses [Resend](https://resend.com) for transactional emails (registration, password reset, etc.).

### Getting Resend API Key

1. **Create Account**
   - Go to [Resend.com](https://resend.com)
   - Sign up for free account
   - Free tier: 100 emails/day, 3,000/month

2. **Add Domain** (Optional for production)
   - For development, use test domain
   - For production: verify your domain

3. **Generate API Key**
   - Go to "API Keys"
   - Click "Create API Key"
   - Name it (e.g., "Muminbook Development")
   - Copy the key (starts with `re_`)
   - Add to `packages/backend/.env`

4. **Test Email** (Development)
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
   EMAIL_SENDER=onboarding@resend.dev
   ```

### Alternative: Email Disabled (Development Only)

If you don't need email verification during development:

```typescript
// packages/backend/src/config/resend.ts
// Comment out or modify to skip email sending
```

## 🚀 Running the Application

### Start Both Servers

```bash
npm run dev
```

This starts:

- **Backend:** http://localhost:5000
- **Frontend:** http://localhost:5173

### Start Individually

```bash
# Backend only
npm run backend

# Frontend only
npm run frontend
```

### Expected Output

**Backend:**

```
> ts-node-dev --files src/index.ts index.d.ts

[INFO] Server started on http://localhost:5000
[INFO] Database connected successfully
[INFO] Scheduled jobs initialized
```

**Frontend:**

```
VITE v6.0.5  ready in 1234 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.x:5173/
```

## ✓ Verification

### 1. Backend Health Check

```bash
curl http://localhost:5000/
# Expected: {"status":"healthy"}
```

Or visit http://localhost:5000/ in browser.

### 2. Database Connection

Check backend console for:

```
[INFO] Database connected successfully
```

### 3. Frontend Access

Open http://localhost:5173/ in browser. You should see the Muminbook homepage.

### 4. API Test

Try registering a new user:

```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "name": "Test User"
  }'
```

## 🔧 Troubleshooting

### "Cannot find module" Errors

```bash
# Clean and reinstall
npm run clean:install
```

### Port Already in Use

```bash
# Find and kill process on port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Or change port in .env
PORT=5001
```

### MongoDB Connection Failed

**Local MongoDB:**

```bash
# Check if MongoDB is running
# macOS
brew services list

# Linux
sudo systemctl status mongod

# Windows - check Services app
```

**MongoDB Atlas:**

- Verify IP address is whitelisted
- Check username/password in connection string
- Ensure network connectivity

### CORS Errors

Make sure `APP_ORIGIN` in backend `.env` matches frontend URL:

```env
APP_ORIGIN=http://localhost:5173
```

### Email Sending Fails

- Verify RESEND_API_KEY is correct
- Check Resend dashboard for rate limits
- For development, email verification can be skipped

### Frontend Can't Connect to Backend

1. Check backend is running on port 5000
2. Verify `VITE_API_URL` in frontend `.env`
3. Check browser console for specific errors

### Build Errors

```bash
# Backend TypeScript errors
cd packages/backend
npm run build

# Frontend build errors
cd packages/frontend
npm run build
```

## 📚 Next Steps

Once setup is complete:

1. **Read the docs:**
   - [API Documentation](API.md)
   - [Development Guide](DEVELOPMENT.md)
   - [Architecture Overview](ARCHITECTURE.md)

2. **Explore the code:**
   - Backend: `packages/backend/src/`
   - Frontend: `packages/frontend/src/`

3. **Start contributing:**
   - See [CONTRIBUTING.md](../CONTRIBUTING.md)

## 🆘 Still Having Issues?

- Check [GitHub Issues](https://github.com/Shahtr1/muminbook/issues)
- Start a [Discussion](https://github.com/Shahtr1/muminbook/discussions)
- Review [Common Errors](DEVELOPMENT.md#common-errors)

---

**Happy coding! May your development be smooth and your bugs be few. 🚀**
