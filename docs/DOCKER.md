# Docker Guide

This guide covers containerization and deployment of the Muminbook application using Docker and Docker Compose.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Development Workflow](#development-workflow)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Prerequisites

Ensure you have the following installed:

- **Docker:** Version 20.10 or higher ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose:** Version 2.0 or higher (usually included with Docker Desktop)

Verify installation:

```bash
docker --version
docker compose version
```

## Quick Start

### 1. Setup Environment Variables

Copy the Docker environment template:

```bash
cp .env.docker .env
```

Edit `.env` and update the values (especially passwords and secrets):

```bash
# Required: Update these values
MONGO_ROOT_PASSWORD=your-secure-mongodb-password
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters
RESEND_API_KEY=your-resend-api-key
```

### 2. Build and Start All Services

```bash
# Build and start in detached mode
docker compose up -d --build

# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f backend
```

### 3. Access the Application

- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:4004
- **MongoDB:** localhost:27017

### 4. Stop Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (⚠️ deletes all data)
docker compose down -v
```

## Architecture

### Multi-Stage Docker Builds

Both frontend and backend use multi-stage builds for optimization:

**Backend (Node.js + Express):**

1. **deps:** Install production dependencies
2. **builder:** Install all deps + build TypeScript
3. **runner:** Copy built app + production deps only

**Frontend (React + Vite + Nginx):**

1. **deps:** Install dependencies
2. **builder:** Build React app
3. **runner:** Serve with Nginx

### Services Overview

```
┌─────────────────────────────────────────────────────┐
│                  Docker Network                      │
│                                                      │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐ │
│  │ Frontend │─────▶│ Backend  │─────▶│ MongoDB  │ │
│  │  Nginx   │      │ Express  │      │          │ │
│  │  :8080   │      │  :4004   │      │  :27017  │ │
│  └──────────┘      └──────────┘      └──────────┘ │
│                                                      │
│  Optional:                                          │
│  ┌──────────┐                                       │
│  │  Redis   │                                       │
│  │  :6379   │                                       │
│  └──────────┘                                       │
└─────────────────────────────────────────────────────┘
```

## Configuration

### Environment Variables

All environment variables are defined in `.env` file:

| Variable              | Description                  | Default                 |
| --------------------- | ---------------------------- | ----------------------- |
| `MONGO_ROOT_USERNAME` | MongoDB admin username       | `admin`                 |
| `MONGO_ROOT_PASSWORD` | MongoDB admin password       | (required)              |
| `MONGO_DB_NAME`       | Database name                | `muminbook`             |
| `MONGO_PORT`          | MongoDB exposed port         | `27017`                 |
| `BACKEND_PORT`        | Backend API port             | `4004`                  |
| `FRONTEND_PORT`       | Frontend web port            | `8080`                  |
| `JWT_SECRET`          | JWT signing secret           | (required)              |
| `JWT_REFRESH_SECRET`  | Refresh token secret         | (required)              |
| `RESEND_API_KEY`      | Resend email API key         | (required)              |
| `VITE_API_URL`        | Backend API URL for frontend | `http://localhost:4004` |
| `APP_ORIGIN`          | Frontend URL for CORS        | `http://localhost:8080` |

### Health Checks

All services include health checks:

- **MongoDB:** Ping command every 10s
- **Backend:** HTTP check on `/health` every 30s
- **Frontend:** HTTP check on `/health` every 30s

Check service health:

```bash
docker compose ps
```

## Development Workflow

### Local Development with Docker

For development, you might prefer running services separately:

```bash
# Start only MongoDB
docker compose up -d mongodb

# Run backend and frontend locally
cd packages/backend && npm run dev
cd packages/frontend && npm run dev
```

### Building Individual Services

```bash
# Build only backend
docker compose build backend

# Build only frontend
docker compose build frontend

# Rebuild without cache
docker compose build --no-cache backend
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100 backend

# Follow with timestamps
docker compose logs -f -t backend
```

### Executing Commands in Containers

```bash
# Open shell in backend container
docker compose exec backend sh

# Run npm command
docker compose exec backend npm run test

# Access MongoDB shell
docker compose exec mongodb mongosh -u admin -p
```

### Restarting Services

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart backend

# Restart with rebuild
docker compose up -d --build backend
```

## Production Deployment

### Security Checklist

Before deploying to production:

- [ ] Change all default passwords in `.env`
- [ ] Use strong secrets (minimum 32 characters)
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS/TLS
- [ ] Use environment-specific secrets management
- [ ] Implement rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure automatic backups for MongoDB
- [ ] Review and harden Nginx security headers

### Production Environment Variables

Create `.env.production`:

```bash
# Use strong, randomly generated values
MONGO_ROOT_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 48)
JWT_REFRESH_SECRET=$(openssl rand -base64 48)

# Production URLs
VITE_API_URL=https://api.yourdomain.com
APP_ORIGIN=https://yourdomain.com
```

### Building for Production

```bash
# Build with production environment
docker compose -f docker-compose.yml --env-file .env.production build

# Start services
docker compose -f docker-compose.yml --env-file .env.production up -d
```

### Resource Limits

Add resource limits to `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Persistent Data

Volumes are automatically created for:

- `mongodb_data` - MongoDB database files
- `mongodb_config` - MongoDB configuration
- `backend_logs` - Backend application logs

Backup MongoDB data:

```bash
# Create backup
docker compose exec mongodb mongodump --out /data/backup

# Copy to host
docker cp muminbook-mongodb:/data/backup ./mongodb-backup
```

## Troubleshooting

### Common Issues

**Port Already in Use:**

```bash
# Find process using port
# Windows
netstat -ano | findstr :4004

# macOS/Linux
lsof -i :4004

# Change port in .env
BACKEND_PORT=4005
```

**Container Won't Start:**

```bash
# Check logs
docker compose logs backend

# Check service status
docker compose ps

# Inspect container
docker inspect muminbook-backend
```

**MongoDB Connection Failed:**

```bash
# Verify MongoDB is healthy
docker compose ps mongodb

# Check MongoDB logs
docker compose logs mongodb

# Test connection
docker compose exec mongodb mongosh -u admin -p adminpassword
```

**Build Failures:**

```bash
# Clean build cache
docker builder prune

# Rebuild without cache
docker compose build --no-cache

# Remove all containers and rebuild
docker compose down
docker compose up -d --build
```

**Out of Disk Space:**

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a --volumes
```

### Debugging

Enable detailed logging:

```bash
# Set compose log level
export COMPOSE_HTTP_TIMEOUT=200
export COMPOSE_LOG_LEVEL=DEBUG

# View build output
docker compose build --progress=plain
```

Access container shell:

```bash
# Backend
docker compose exec backend sh

# MongoDB
docker compose exec mongodb mongosh
```

## Best Practices

### 1. Use Multi-Stage Builds

✅ Reduces final image size  
✅ Separates build and runtime dependencies  
✅ Improves security (fewer packages in production)

### 2. Run as Non-Root User

Both Dockerfiles create non-root users:

- Backend: `expressuser` (uid 1001)
- Frontend: `nginxuser` (uid 1001)

### 3. Leverage Docker Cache

Order Dockerfile commands from least to most frequently changing:

```dockerfile
COPY package.json .     # Changes rarely
RUN npm install          # Cached if package.json unchanged
COPY . .                # Changes often
RUN npm run build       # Only runs if source changed
```

### 4. Use .dockerignore

Exclude unnecessary files from build context:

- `node_modules` (installed in container)
- `.git` (not needed in container)
- Tests and documentation
- Environment files

### 5. Health Checks

Always define health checks for:

- Early detection of failures
- Proper container orchestration
- Load balancer integration

### 6. Environment Management

Never commit secrets to version control:

- Use `.env` files (gitignored)
- Use Docker secrets in production
- Consider vault solutions (HashiCorp Vault, AWS Secrets Manager)

### 7. Logging

- Use JSON logging format for production
- Centralize logs (ELK, CloudWatch, etc.)
- Rotate logs to prevent disk fill
- Set appropriate log levels

### 8. Monitoring

Integrate with monitoring tools:

- Prometheus for metrics
- Grafana for visualization
- Health check endpoints for uptime monitoring

### 9. Updates and Maintenance

```bash
# Update base images regularly
docker compose pull

# Rebuild with latest
docker compose up -d --build

# Check for vulnerabilities
docker scout quickview
```

### 10. Development vs Production

Maintain separate compose files:

```bash
# Development
docker-compose.dev.yml

# Production
docker-compose.prod.yml

# Use specific file
docker compose -f docker-compose.prod.yml up -d
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Docker Security](https://docs.docker.com/engine/security/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

---

**Need Help?** Check the [DEVELOPMENT.md](./DEVELOPMENT.md) guide or open an issue on GitHub.

**Security Concerns?** Review [SECURITY.md](./SECURITY.md) for vulnerability reporting.
