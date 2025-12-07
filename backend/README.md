# Muminbook Backend

The backend API for Muminbook, built with Node.js, Express, and TypeScript.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Zod** - Schema validation
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Resend** - Email service
- **node-cron** - Scheduled jobs

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB 6+

### Installation

```bash
# From the project root
npm run install:backend

# Or from this directory
npm install
```

### Configuration

Create a `.env` file in this directory:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/muminbook

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Email
RESEND_API_KEY=your-resend-api-key

# CORS
FRONTEND_URL=http://localhost:5173
```

See `sample.env` for a complete template.

### Development

```bash
# From the project root
npm run dev:backend

# Or from this directory
npm run backend
```

The API will be available at http://localhost:5000

### Building

```bash
# From the project root
npm run build:backend

# Or from this directory
npm run build
```

### Production

```bash
# Build first
npm run build

# Start production server
npm start
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── constants/       # Constants and enums
│   ├── controllers/     # Request handlers
│   ├── data/           # Static data files
│   ├── jobs/           # Scheduled jobs
│   ├── middleware/     # Express middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   ├── app.ts          # Express app setup
│   └── index.ts        # Application entry point
├── dist/               # Compiled JavaScript (after build)
├── copy-file.js        # Build utility script
├── index.d.ts          # TypeScript declarations
├── tsconfig.json       # TypeScript configuration
├── sample.env          # Environment variables template
└── package.json
```

## API Endpoints

See [docs/API.md](../docs/API.md) for complete API documentation.

### Base URL

- Development: `http://localhost:5000/api`
- Production: `https://api.yourdomain.com/api`

### Example Endpoints

```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
GET    /api/users/me         - Get current user
GET    /api/content/daily-verse    - Get daily verse
GET    /api/resources        - Get resources
POST   /api/resources        - Create resource
```

## Available Scripts

- `npm run backend` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server (requires build)

## Development Guidelines

### Creating a New Endpoint

1. **Define Model** (if needed):
```typescript
// src/models/Resource.ts
import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  createdAt: { type: Date, default: Date.now },
});

export const Resource = mongoose.model('Resource', resourceSchema);
```

2. **Create Service**:
```typescript
// src/services/resourceService.ts
import { Resource } from '../models/Resource';

export const createResource = async (data: ResourceData) => {
  return await Resource.create(data);
};

export const getResources = async () => {
  return await Resource.find();
};
```

3. **Create Controller**:
```typescript
// src/controllers/resourceController.ts
import { Request, Response } from 'express';
import { createResource } from '../services/resourceService';

export const createResourceController = async (req: Request, res: Response) => {
  try {
    const resource = await createResource(req.body);
    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

4. **Define Route**:
```typescript
// src/routes/resourceRoutes.ts
import express from 'express';
import { createResourceController } from '../controllers/resourceController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/resources', authenticateToken, createResourceController);

export default router;
```

### Input Validation with Zod

```typescript
import { z } from 'zod';

const resourceSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().optional(),
  category: z.enum(['quran', 'hadith', 'article']),
});

// In controller
const validated = resourceSchema.parse(req.body);
```

### Authentication Middleware

```typescript
import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment | No | development |
| `PORT` | Server port | No | 5000 |
| `MONGO_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | JWT signing key | Yes | - |
| `JWT_EXPIRES_IN` | Token expiration | No | 7d |
| `RESEND_API_KEY` | Email service API key | Yes | - |
| `FRONTEND_URL` | Frontend URL for CORS | Yes | - |

## Database

### Connecting to MongoDB

The application automatically connects to MongoDB on startup using the `MONGO_URI` from `.env`.

### Using MongoDB Atlas

1. Create a cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Replace password in connection string
4. Set as `MONGO_URI` in `.env`

### Local MongoDB

```bash
# Start MongoDB
mongod

# Or with Homebrew on macOS
brew services start mongodb-community
```

## Testing

Testing infrastructure should be added. Recommended setup:

```bash
npm install --save-dev jest @types/jest supertest
```

See [docs/TESTING.md](../docs/TESTING.md) for testing guidelines.

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### MongoDB Connection Fails

- Verify MongoDB is running: `mongosh`
- Check connection string in `.env`
- For Atlas, verify IP whitelist and credentials

### TypeScript Errors

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Clean and rebuild
rm -rf dist
npm run build
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Deployment

See [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) for production deployment instructions.

## Security

- Never commit `.env` files
- Use strong JWT secrets in production
- Keep dependencies updated
- Validate all user input
- Use HTTPS in production
- Set proper CORS origins

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) in the root directory.

## License

MIT License - see [LICENSE](../LICENSE) for details.
