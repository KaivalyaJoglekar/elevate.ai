# Backend Setup Guide

Your API key is now secure! This guide will help you set up the backend server that handles API calls safely.

## 🔐 Security Improvement

Previously, your Gemini API key was exposed in the frontend code, making it visible to anyone who could access your application. Now:

- ✅ API key is stored securely on the backend server
- ✅ Frontend makes requests to your backend instead of directly to Gemini
- ✅ No sensitive information is exposed to users
- ✅ All existing functionality is preserved

## 🚀 Quick Setup

### 1. Backend Setup

```bash
# Navigate to the server directory
cd server

# Run the setup script
./setup.sh

# Edit the .env file with your API key
nano .env  # or use your preferred editor
```

Add your Gemini API key to the `.env` file:
```
GEMINI_API_KEY=your_actual_api_key_here
FRONTEND_URL=http://localhost:5173
PORT=3001
```

### 2. Start the Backend Server

```bash
# In the server directory
npm run dev  # For development with auto-restart
# OR
npm start    # For production
```

The backend will start on `http://localhost:3001`

### 3. Start the Frontend

```bash
# In the main project directory (not server/)
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🔧 Configuration

### Backend Environment Variables

Create `server/.env` with:

```env
# Your Gemini API Key (keep this secret!)
GEMINI_API_KEY=your_gemini_api_key_here

# Frontend URL (adjust if different)
FRONTEND_URL=http://localhost:5173

# Server port (optional, defaults to 3001)
PORT=3001
```

### Frontend Environment Variables

Create `.env` in the main directory with:

```env
# Backend API URL (adjust if your backend runs on a different port)
VITE_BACKEND_URL=http://localhost:3001
```

## 🚦 Testing the Setup

1. **Check Backend Health**:
   ```bash
   curl http://localhost:3001/health
   ```
   Should return: `{"status":"ok","message":"Server is running"}`

2. **Test the Frontend**:
   - Open `http://localhost:5173`
   - Upload a resume
   - Verify the analysis works

## 📁 Project Structure

```
elevate-ai/
├── server/                 # Backend server
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   ├── .env.example       # Environment template
│   └── setup.sh           # Setup script
├── services/
│   ├── geminiService.ts   # OLD: Direct API calls (not used)
│   └── backendService.ts  # NEW: Secure backend calls
├── .env.example           # Frontend environment template
└── ...                    # Other frontend files
```

## 🔄 Migration Summary

### What Changed:

1. **Created Backend Server** (`server/server.js`):
   - Handles Gemini API calls securely
   - Stores API key on server-side only
   - Provides REST API endpoint for frontend

2. **Updated Frontend Service** (`services/backendService.ts`):
   - Calls backend instead of Gemini directly
   - Same interface, different implementation
   - No code changes needed in components

3. **Removed API Key Exposure**:
   - Updated `vite.config.ts` to remove API key
   - API key no longer bundled with frontend code

### What Stayed the Same:

- ✅ All UI components work exactly the same
- ✅ Same resume analysis functionality
- ✅ Same user experience
- ✅ Same data structure and types

## 🚨 Important Security Notes

1. **Never commit your `.env` files** - they contain sensitive API keys
2. **The backend server** must be running for the frontend to work
3. **API key is now safe** - it's only stored on your server, not in the frontend code
4. **CORS is configured** to only allow requests from your frontend

## 🆘 Troubleshooting

### Backend Won't Start
- Check if port 3001 is available
- Verify your `.env` file has the correct API key
- Run `npm install` in the server directory

### Frontend Can't Connect to Backend
- Ensure backend is running on port 3001
- Check CORS settings in `server/server.js`
- Verify `VITE_BACKEND_URL` in frontend `.env`

### Analysis Still Fails
- Check backend logs for errors
- Verify your Gemini API key is valid
- Test the health endpoint: `curl http://localhost:3001/health`

## 📞 Support

If you need help:
1. Check the backend logs for error messages
2. Verify all environment variables are set correctly
3. Test the backend health endpoint
4. Ensure both frontend and backend are running

Your API is now secure! 🔐
