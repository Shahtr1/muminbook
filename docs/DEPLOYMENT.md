# Deployment Guide

This guide covers deployment strategies for Muminbook in various environments.

## Table of Contents

- [Deployment Options](#deployment-options)
- [Environment Setup](#environment-setup)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Database Setup](#database-setup)
- [Security Checklist](#security-checklist)
- [Monitoring & Maintenance](#monitoring--maintenance)

## Deployment Options

### Recommended Platforms

#### Frontend
- **Vercel** (Recommended) - Optimized for React/Vite apps
- **Netlify** - Easy deployment with great DX
- **AWS S3 + CloudFront** - Full control, scalable
- **GitHub Pages** - Free for public repositories

#### Backend
- **Railway** (Recommended) - Easy Node.js deployment
- **Render** - Good free tier, auto-deploy
- **Heroku** - Established platform
- **AWS EC2/ECS** - Full control, scalable
- **DigitalOcean App Platform** - Simple and reliable

#### Database
- **MongoDB Atlas** (Recommended) - Managed MongoDB service
- **Self-hosted MongoDB** - On VPS (DigitalOcean, Linode)

## Environment Setup

### Production Environment Variables

#### Backend (`backend/.env`)

```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/muminbook?retryWrites=true&w=majority

# JWT (Use strong, unique secrets in production!)
JWT_SECRET=your-production-jwt-secret-min-32-chars
JWT_EXPIRES_IN=7d

# Email
RESEND_API_KEY=re_your_production_api_key

# CORS
FRONTEND_URL=https://yourdomain.com

# Optional: Rate limiting, logging, etc.
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (`frontend/.env.production`)

```env
VITE_API_URL=https://api.yourdomain.com/api
```

### Environment Variable Management

**Never commit `.env` files to version control!**

Use platform-specific environment variable management:
- **Vercel**: Dashboard → Project Settings → Environment Variables
- **Netlify**: Dashboard → Site Settings → Environment Variables
- **Railway**: Dashboard → Variables
- **Heroku**: CLI or Dashboard → Settings → Config Vars

## Backend Deployment

### Option 1: Railway (Recommended)

1. **Sign up at [Railway.app](https://railway.app/)**

2. **Create a new project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your repository

3. **Configure deployment**
   - Root directory: `/backend`
   - Build command: `npm run build`
   - Start command: `npm start`

4. **Set environment variables**
   - Add all variables from your `.env` file
   - Make sure `MONGO_URI` points to MongoDB Atlas

5. **Deploy**
   - Railway automatically deploys on push to main branch

### Option 2: Render

1. **Sign up at [Render.com](https://render.com/)**

2. **Create a new Web Service**
   - Connect your GitHub repository
   - Name: `muminbook-backend`
   - Environment: `Node`
   - Region: Choose closest to your users
   - Branch: `main`
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Set environment variables**
   - Add all production environment variables

4. **Advanced settings**
   - Auto-Deploy: `Yes`
   - Health Check Path: `/api/health` (implement this endpoint)

5. **Deploy**

### Option 3: Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create muminbook-backend

# Set root directory
heroku buildpacks:set heroku/nodejs

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
# ... set all other variables

# Deploy
git subtree push --prefix backend heroku main

# Or use Heroku GitHub integration for automatic deploys
```

### Option 4: AWS EC2

1. **Launch EC2 instance**
   - Amazon Linux 2 or Ubuntu
   - t2.micro or larger
   - Configure security group (ports 22, 80, 443, 5000)

2. **Connect and setup**
   ```bash
   ssh -i your-key.pem ec2-user@your-instance-ip
   
   # Update system
   sudo yum update -y  # Amazon Linux
   # or
   sudo apt update && sudo apt upgrade -y  # Ubuntu
   
   # Install Node.js
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs  # Amazon Linux
   # or
   sudo apt install -y nodejs  # Ubuntu
   
   # Install git
   sudo yum install -y git  # Amazon Linux
   # or
   sudo apt install -y git  # Ubuntu
   ```

3. **Deploy application**
   ```bash
   # Clone repository
   git clone https://github.com/Shahtr1/muminbook.git
   cd muminbook/backend
   
   # Install dependencies
   npm install
   
   # Create .env file
   nano .env
   # Add your production environment variables
   
   # Build
   npm run build
   ```

4. **Setup process manager (PM2)**
   ```bash
   sudo npm install -g pm2
   
   # Start application
   pm2 start npm --name "muminbook-backend" -- start
   
   # Setup startup script
   pm2 startup
   pm2 save
   
   # Monitor
   pm2 monit
   ```

5. **Setup Nginx reverse proxy** (optional but recommended)
   ```bash
   sudo yum install -y nginx  # Amazon Linux
   # or
   sudo apt install -y nginx  # Ubuntu
   
   # Configure Nginx
   sudo nano /etc/nginx/conf.d/muminbook.conf
   ```

   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   # Test and restart Nginx
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Setup SSL with Let's Encrypt**
   ```bash
   sudo yum install -y certbot python3-certbot-nginx  # Amazon Linux
   # or
   sudo apt install -y certbot python3-certbot-nginx  # Ubuntu
   
   sudo certbot --nginx -d api.yourdomain.com
   ```

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Sign up at [Vercel.com](https://vercel.com/)**

2. **Import project**
   - Click "New Project"
   - Import from GitHub
   - Select your repository

3. **Configure**
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Environment Variables**
   - Add `VITE_API_URL` with your backend URL

5. **Deploy**
   - Vercel automatically deploys on push to main

### Option 2: Netlify

1. **Sign up at [Netlify.com](https://netlify.com/)**

2. **New site from Git**
   - Connect to GitHub
   - Select repository

3. **Build settings**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

4. **Environment variables**
   - Add `VITE_API_URL`

5. **Deploy settings**
   - Enable automatic deploys
   - Add `_redirects` file for SPA routing:
     ```
     /* /index.html 200
     ```

### Option 3: AWS S3 + CloudFront

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Create S3 bucket**
   - Bucket name: `muminbook-frontend`
   - Enable static website hosting
   - Upload `dist` folder contents

3. **Create CloudFront distribution**
   - Origin: Your S3 bucket
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
   - Default Root Object: `index.html`

4. **Configure error pages**
   - 404 → `/index.html` (for SPA routing)

5. **Update DNS**
   - Point your domain to CloudFront distribution

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)**

2. **Create a cluster**
   - Choose cloud provider and region
   - Cluster tier (M0 free tier for testing)
   - Cluster name: `muminbook-prod`

3. **Configure security**
   - Database Access: Create database user
   - Network Access: Add IP addresses
     - For production: Add application server IPs
     - For development: Add `0.0.0.0/0` (less secure)

4. **Get connection string**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password

5. **Configure application**
   - Add connection string to backend environment variables

### Self-Hosted MongoDB

If using VPS:

```bash
# Install MongoDB
# Follow official MongoDB installation guide for your OS

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Configure for remote access (if needed)
sudo nano /etc/mongod.conf
# Change bindIp to your server IP or 0.0.0.0

# Restart
sudo systemctl restart mongod

# Create database user
mongosh
use muminbook
db.createUser({
  user: "muminbook_user",
  pwd: "secure_password",
  roles: [{ role: "readWrite", db: "muminbook" }]
})
```

## Security Checklist

Before deploying to production:

### Backend Security

- [ ] Environment variables set correctly (no hardcoded secrets)
- [ ] `NODE_ENV` set to `production`
- [ ] Strong JWT secret (min 32 characters, random)
- [ ] CORS configured with specific frontend URL (not `*`)
- [ ] Rate limiting enabled
- [ ] Input validation with Zod on all endpoints
- [ ] Helmet.js configured for security headers
- [ ] HTTPS enforced
- [ ] Database connection string uses SSL/TLS
- [ ] Error messages don't expose sensitive info
- [ ] Logging configured (but no sensitive data logged)

### Frontend Security

- [ ] API URL points to production backend
- [ ] No sensitive data in client-side code
- [ ] HTTPS enforced
- [ ] Content Security Policy configured
- [ ] Sensitive routes protected with authentication

### Database Security

- [ ] Strong database password
- [ ] IP whitelist configured (not 0.0.0.0/0 in production)
- [ ] Database user has minimal required permissions
- [ ] Regular backups configured
- [ ] SSL/TLS enabled for connections

### General

- [ ] Dependencies updated (no known vulnerabilities)
- [ ] SSL certificates installed and auto-renewing
- [ ] Monitoring and alerting configured
- [ ] Backup strategy in place

## Monitoring & Maintenance

### Monitoring Tools

**Backend:**
- Application monitoring: New Relic, Datadog, Sentry
- Uptime monitoring: UptimeRobot, Pingdom
- Log management: Loggly, Papertrail, ELK Stack

**Frontend:**
- Error tracking: Sentry, LogRocket
- Analytics: Google Analytics, Plausible
- Performance: Lighthouse, Web Vitals

### Health Checks

Implement health check endpoints:

```typescript
// backend/src/routes/health.ts
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.get('/health/db', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});
```

### Backup Strategy

**Database Backups:**
```bash
# MongoDB Atlas: Automatic backups included
# Self-hosted: Use mongodump
mongodump --uri="mongodb://user:pass@host/dbname" --out=/backup/$(date +%Y%m%d)

# Automate with cron
0 2 * * * /usr/bin/mongodump --uri="mongodb://..." --out=/backup/$(date +\%Y\%m\%d)
```

**Application Backups:**
- Code: Already backed up in Git
- User uploads: Backup to S3 or cloud storage
- Configuration: Document all environment variables

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update safely
npm update

# Or update to latest (careful!)
npm install package@latest

# Test thoroughly after updates
npm test
npm run lint
npm run build
```

### Rollback Strategy

**Vercel/Netlify:** Use dashboard to rollback to previous deployment

**Other platforms:**
```bash
# Keep previous builds
# Tag releases in Git
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Rollback by deploying previous tag
git checkout v1.0.0
# Deploy again
```

## CI/CD Integration

See `.github/workflows/` for automated deployment pipelines (coming soon).

## Troubleshooting

### Common Issues

**Build fails:**
- Check Node.js version matches production
- Verify all dependencies installed
- Check for environment-specific issues

**Application crashes:**
- Check logs
- Verify environment variables
- Check database connection
- Review recent code changes

**Slow performance:**
- Check database queries (add indexes)
- Monitor server resources
- Check for memory leaks
- Enable caching where appropriate

---

For questions or issues with deployment, please open an issue on GitHub.
