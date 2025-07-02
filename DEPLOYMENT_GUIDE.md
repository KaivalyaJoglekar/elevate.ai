# Deployment Guide

Your website currently won't work because we moved from frontend-only to frontend + backend architecture. Here are your options:

## 🚨 Current Issue
- Your deployed site is looking for a backend at `http://localhost:3001` 
- This backend only exists on your local machine
- The site will show "Failed to fetch" errors

## ✅ Solution Options

### Option 1: Deploy Full Stack (Recommended - Most Secure)

#### Step 1: Deploy Backend
**Using Railway (Free tier available):**
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repo
3. Create new project from your repo
4. Add environment variable: `GEMINI_API_KEY=your_api_key`
5. Railway will automatically detect and deploy the backend
6. Note your backend URL (e.g., `https://your-app.railway.app`)

**Using Render (Free tier available):**
1. Go to [render.com](https://render.com)
2. Connect your GitHub repo
3. Create new Web Service
4. Set build command: `cd server && npm install`
5. Set start command: `cd server && npm start`
6. Add environment variable: `GEMINI_API_KEY=your_api_key`

#### Step 2: Deploy Frontend
**Using Vercel:**
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Add environment variable: `VITE_BACKEND_URL=https://your-backend-url`
4. Deploy

**Using Netlify:**
1. Go to [netlify.com](https://netlify.com)
2. Connect your GitHub repo
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variable: `VITE_BACKEND_URL=https://your-backend-url`

### Option 2: Quick Fix - Frontend Only (Less Secure)

If you need your site working IMMEDIATELY, I can help you revert to the old approach:

1. **Pros**: Site works immediately, no backend deployment needed
2. **Cons**: API key exposed in frontend (security risk)

Would you like me to:
- **A) Help you deploy the secure backend + frontend** (recommended)
- **B) Create a quick frontend-only fix** (faster but less secure)

## 🔧 Backend Deployment Commands

If you choose Option 1, here are the exact commands:

### For Railway:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

### For Manual Deployment:
```bash
# In your server directory
cd server
npm install --production
npm start
```

## 🌐 Frontend Environment Variables

Once your backend is deployed, update your frontend environment:

```env
# .env (for local development)
VITE_BACKEND_URL=http://localhost:3001

# .env.production (for deployment)
VITE_BACKEND_URL=https://your-actual-backend-url.com
```

## 🚀 Automated Deployment Script

Want me to create a deployment script that handles everything automatically?

Let me know which option you prefer!
