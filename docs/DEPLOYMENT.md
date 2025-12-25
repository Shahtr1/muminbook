# 🚀 Production Deployment Guide

Complete guide for deploying Muminbook to production using free tier services.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Step 1: MongoDB Atlas](#step-1-mongodb-atlas-database)
- [Step 2: Render](#step-2-render-backend-api)
- [Step 3: Vercel](#step-3-vercel-frontend)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   PRODUCTION STACK                   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐    ┌──────────────┐              │
│  │   Vercel     │───▶│    Render    │              │
│  │  (Frontend)  │    │  (Backend)   │              │
│  │              │    │              │              │
│  │  React App   │    │  Express API │              │
│  └──────────────┘    └──────┬───────┘              │
│                              │                       │
│                              ▼                       │
│                      ┌──────────────┐              │
│                      │ MongoDB Atlas│              │
│                      │  (Database)  │              │
│                      └──────────────┘              │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Services:**

- **MongoDB Atlas**: Free 512MB database (M0 cluster)
- **Render**: Free backend hosting (spins down after 15min inactivity)
- **Vercel**: Unlimited free frontend hosting with global CDN

**Cost:** $0/month (100% free forever)

---

## ✅ Prerequisites

Before deploying, ensure you have:

- [x] GitHub account (for deployments)
- [x] Code pushed to GitHub repository
- [x] All services working locally with Docker
- [x] Email addresses for each service signup

**Estimated Time:** 30-45 minutes

---

## 📦 Step 1: MongoDB Atlas (Database)

### ✅ You Already Have Cluster0!

**Good news:** You can reuse your existing MongoDB Atlas cluster - no need to create a new one!

### 1.1 Configure Network Access (If Not Done Already)

1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ This is safe because we use username/password authentication
4. Click **"Confirm"**

### 1.2 Create Database User (If Not Exists)

1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Authentication: **Password**
4. Username: `muminbook_prod` (or reuse existing user)
5. Password: Click **"Autogenerate Secure Password"** (copy this!)
6. Database User Privileges: **"Atlas Admin"** or **"Read and write to any database"**
7. Click **"Add User"**

### 1.3 Get Connection String

1. In MongoDB Atlas, go to **"Database"** (left sidebar)
2. Click **"Connect"** on your **Cluster0**
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string:

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

6. **Replace placeholders:**
   - `<username>` → Your database username
   - `<password>` → Your database password
   - Add database name after `.net/`: `muminbook`

**Final connection string example:**

```
mongodb+srv://muminbook_prod:YourPassword123@cluster0.abc123.mongodb.net/muminbook?retryWrites=true&w=majority
```

**✅ Save this! You'll need it for Render.**

**💡 Tip:** You can use the same database (muminbook) on Cluster0 for both development and production, or create separate databases like `muminbook_dev` and `muminbook_prod`.

---

## 🔧 Step 2: Render (Backend API)

### 2.1 Create Account

1. Go to [Render](https://render.com)
2. Sign up with **GitHub** (recommended for auto-deploy)
3. Authorize Render to access your repositories

### 2.2 Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your **muminbook** repository
3. Click **"Connect"**

### 2.3 Configure Service

**Basic Settings:**

```
Name: muminbook-backend
Region: Singapore (closest to India)
Branch: master
Runtime: Docker
Dockerfile Path: packages/backend/Dockerfile
Docker Context: packages/backend
```

**Environment:**

```
NODE_ENV: production
```

**Plan:** Free

### 2.4 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these one by one:

| Key                   | Value                          | Notes               |
| --------------------- | ------------------------------ | ------------------- |
| `NODE_ENV`            | `production`                   | Already set         |
| `PORT`                | `4004`                         | Render uses this    |
| `MONGO_URI`           | `mongodb+srv://...`            | From Step 1.5       |
| `JWT_SECRET`          | Generate random                | See below           |
| `JWT_REFRESH_SECRET`  | Generate random                | See below           |
| `RESEND_API_KEY`      | Your Resend key                | From Resend.com     |
| `EMAIL_SENDER`        | `noreply@yourdomain.com`       | Your email          |
| `APP_ORIGIN`          | `https://muminbook.vercel.app` | Update after Vercel |
| `ADMIN_FIRSTNAME`     | `Admin`                        |                     |
| `ADMIN_LASTNAME`      | `User`                         |                     |
| `ADMIN_DATE_OF_BIRTH` | `1990-01-01`                   |                     |
| `ADMIN_GENDER`        | `male`                         |                     |
| `ADMIN_EMAIL`         | `admin@example.com`            | Your admin email    |
| `ADMIN_PASSWORD`      | Strong password                | Change this!        |

**Generate secrets (run locally):**

```bash
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2.5 Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for build
3. Once deployed, you'll get a URL like:
   ```
   https://muminbook-backend.onrender.com
   ```
4. **Test it:** Visit `https://muminbook-backend.onrender.com/` (should show `{"status":"healthy"}`)

**⚠️ Important:** Free tier spins down after 15min inactivity (cold starts take 30-60s)

### 2.6 Configure Health Check

In Render dashboard:

1. Go to **"Settings"** → **"Health & Alerts"**
2. Health Check Path: `/`
3. Save Changes

---

## 🌐 Step 3: Vercel (Frontend)

### 3.1 Create Account

1. Go to [Vercel](https://vercel.com/signup)
2. Sign up with **GitHub** (recommended)
3. Authorize Vercel to access repositories

### 3.2 Import Project

1. Click **"Add New..."** → **"Project"**
2. Import your **muminbook** repository
3. Click **"Import"**

### 3.3 Configure Project

**Framework Preset:** Vite

**Root Directory:** `packages/frontend`

**Build Settings:**

```bash
# Build Command (auto-detected)
npm run build

# Output Directory
dist

# Install Command
npm install
```

### 3.4 Environment Variables

Click **"Environment Variables"** and add:

| Key            | Value                                    |
| -------------- | ---------------------------------------- |
| `VITE_API_URL` | `https://muminbook-backend.onrender.com` |

**Use your Render URL from Step 2.5!**

### 3.5 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. You'll get a URL like:
   ```
   https://muminbook-abc123.vercel.app
   ```

### 3.6 Update Backend APP_ORIGIN

**Go back to Render:**

1. Dashboard → **muminbook-backend** → **"Environment"**
2. Edit `APP_ORIGIN`
3. Change to your Vercel URL: `https://muminbook-abc123.vercel.app`
4. Click **"Save Changes"**
5. Render will auto-redeploy (2-3 minutes)

### 3.7 Custom Domain (Optional)

In Vercel dashboard:

1. Go to **"Settings"** → **"Domains"**
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate auto-generated

---

## 🔐 Environment Variables Reference

### Complete List for Each Service

#### MongoDB Atlas

- Created during setup (no env vars needed)

#### Render (Backend)

```env
NODE_ENV=production
PORT=4004
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/muminbook
JWT_SECRET=<64-char-random-hex>
JWT_REFRESH_SECRET=<64-char-random-hex>
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_SENDER=noreply@yourdomain.com
APP_ORIGIN=https://your-app.vercel.app
ADMIN_FIRSTNAME=Admin
ADMIN_LASTNAME=User
ADMIN_DATE_OF_BIRTH=1990-01-01
ADMIN_GENDER=male
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=<strong-password>
```

#### Vercel (Frontend)

```env
VITE_API_URL=https://your-backend.onrender.com
```

---

## ✨ Post-Deployment

### Test Your Deployment

1. **Health Check:**

   ```bash
   curl https://your-backend.onrender.com/
   # Should return: {"status":"healthy"}
   ```

2. **Open Frontend:**
   - Visit your Vercel URL
   - Try logging in with admin credentials
   - Test a few features

3. **Check Database:**
   - In MongoDB Atlas, go to **"Collections"**
   - You should see data being created

### Enable Auto-Deploy

Both Vercel and Render auto-deploy on `git push`:

```bash
git add .
git commit -m "Update feature"
git push origin master
# Both services will auto-deploy!
```

### Monitor Services

- **Render Logs:** Dashboard → Logs (real-time)
- **Vercel Logs:** Dashboard → Deployments → View Function Logs
- **MongoDB Metrics:** Atlas Dashboard → Metrics tab

---

## 🐛 Troubleshooting

### Backend Returns 500 Error

**Check Render logs:**

```
Dashboard → muminbook-backend → Logs
```

**Common issues:**

- ❌ MONGO_URI incorrect → Check connection string
- ❌ Missing env vars → Verify all variables set
- ❌ CORS error → Update APP_ORIGIN to match frontend URL

### Frontend Can't Connect to Backend

**Symptoms:** API requests fail, "Network Error"

**Solutions:**

1. Verify `VITE_API_URL` in Vercel environment variables
2. Check Render backend is running (not sleeping)
3. Test backend directly: `curl https://your-backend.onrender.com/`
4. Redeploy frontend after changing env vars

### Cold Starts (Render Free Tier)

**Issue:** First request after 15min takes 30-60s

**Solutions:**

1. **Upgrade to paid plan** ($7/month - no cold starts)
2. **Use cron job to ping every 14 minutes:**
   ```bash
   # Use cron-job.org or UptimeRobot
   curl https://your-backend.onrender.com/
   ```
3. **Accept trade-off** (most free apps do this)

### Database Connection Timeout

**Check MongoDB Atlas:**

1. **Network Access** → Verify 0.0.0.0/0 allowed
2. **Database Users** → Verify user exists
3. **Connection String** → Verify format is correct

### CORS Errors

**Error:** "Access-Control-Allow-Origin"

**Solution:**

1. In Render, check `APP_ORIGIN` matches your Vercel URL exactly
2. Include protocol: `https://` (not `http://`)
3. No trailing slash: `https://app.vercel.app` ✅ not `https://app.vercel.app/` ❌

### Email Not Sending

**Check Resend:**

1. Verify `RESEND_API_KEY` is correct
2. Check Resend dashboard for errors
3. For production, verify your domain

### Build Fails on Render

**Check Dockerfile:**

1. Ensure `packages/backend/Dockerfile` exists
2. Test locally: `docker build -t test -f packages/backend/Dockerfile packages/backend`
3. Check Render logs for specific error

---

## 📊 Service Limits (Free Tier)

| Service           | Limit                          | Notes                      |
| ----------------- | ------------------------------ | -------------------------- |
| **MongoDB Atlas** | 512MB storage                  | Enough for 100K+ documents |
| **Render**        | 750 hours/month                | One service = 24/7         |
|                   | Spins down after 15min         | First request slow         |
|                   | 100GB bandwidth/month          | Usually sufficient         |
| **Vercel**        | 100GB bandwidth/month          | Per team                   |
|                   | 100 deployments/day            | More than enough           |
|                   | Serverless function: 100GB-hrs | Plenty                     |

---

## 🚀 Next Steps

### Production Checklist

- [ ] Custom domain configured
- [ ] SSL certificates verified
- [ ] Email domain verified (Resend)
- [ ] Monitoring setup (UptimeRobot)
- [ ] Backup strategy for MongoDB
- [ ] Error tracking (Sentry - optional)
- [ ] Admin password changed from default
- [ ] All secrets rotated from development

### Upgrade Options (When Needed)

**When to upgrade:**

- 🔴 Atlas M0 storage full (512MB) → **$9/month for 2GB**
- 🔴 Cold starts unacceptable → **Render $7/month**
- 🔴 High traffic → **Vercel Pro $20/month**

**Total cost if upgraded:** ~$36/month for production-ready hosting

---

## 📚 Additional Resources

- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Docker Deployment Guide](./DOCKER.md)

---

**🎉 Congratulations!** Your app is now live in production!

**URLs to save:**

- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`
- Database: MongoDB Atlas dashboard

Share your app and enjoy! 🚀
