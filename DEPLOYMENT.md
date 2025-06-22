# 🚀 Deployment Guide

This guide will help you deploy the Live Meetings App so you can test it with friends online.

## Option 1: Quick Deploy (Recommended)

### Deploy Backend to Railway

1. **Sign up for Railway** (Free tier available)

   - Go to [Railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend**

   - Click "Start a New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository
   - Choose the `server` folder as the root directory
   - Railway will automatically detect it's a Node.js app

3. **Set Environment Variables in Railway**
   - Go to your project settings
   - Add these environment variables:
     ```
     JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
     CLIENT_URL=https://your-frontend-url.vercel.app
     ```
   - Railway will provide your backend URL (something like: `https://your-app.railway.app`)

### Deploy Frontend to Vercel

1. **Sign up for Vercel** (Free tier available)

   - Go to [Vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Deploy Frontend**

   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite React app
   - Before deploying, add environment variable:
     ```
     VITE_API_URL=https://your-backend-url.railway.app
     ```
   - Click "Deploy"

3. **Update Backend CORS**
   - Once your frontend is deployed, copy the Vercel URL
   - Go back to Railway and update the `CLIENT_URL` environment variable
   - Your backend will restart automatically

## Option 2: Alternative Free Hosting

### Backend alternatives:

- **Render.com** (Free tier)
- **Fly.io** (Free tier)

### Frontend alternatives:

- **Netlify** (Free tier)
- **GitHub Pages**

## Step-by-Step Deployment Instructions

### Step 1: Push to GitHub (if not already done)

```bash
git init
git add .
git commit -m "Initial commit - Live Meetings App"
git branch -M main
git remote add origin https://github.com/yourusername/live-meetings-app.git
git push -u origin main
```

### Step 2: Deploy Backend to Railway

1. Go to [Railway.app](https://railway.app) and sign up
2. Click "Start a New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set the root directory to `server`
5. Add environment variables:
   - `JWT_SECRET`: `your-super-secret-jwt-key`
   - `CLIENT_URL`: (leave empty for now, will update after frontend deployment)
6. Deploy and note the URL (e.g., `https://web-production-xxxx.up.railway.app`)

### Step 3: Deploy Frontend to Vercel

1. Go to [Vercel.com](https://vercel.com) and sign up
2. Click "New Project" → Import from GitHub
3. Select your repository
4. Add environment variable:
   - `VITE_API_URL`: `https://your-railway-backend-url`
5. Deploy and note the URL (e.g., `https://live-meetings-app-xxxx.vercel.app`)

### Step 4: Update Backend CORS

1. Go back to Railway dashboard
2. Update the `CLIENT_URL` environment variable with your Vercel URL
3. The backend will restart automatically

## Testing Your Deployment

1. **Open your deployed frontend URL**
2. **Host a meeting:**
   - Click "Host a Meeting"
   - Enter your name
   - Note the meeting ID
3. **Join from another device/browser:**
   - Open the same URL
   - Enter the meeting ID
   - Enter a different name
   - Test the video call!

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure `CLIENT_URL` in Railway matches your Vercel URL exactly
2. **Socket.IO Connection Failed**: Check that `VITE_API_URL` points to your Railway backend
3. **Video/Audio Not Working**: Ensure you're using HTTPS (both services provide this)

### Checking Logs:

- **Railway**: Go to your project → "Deployments" → Click on latest deployment → "View Logs"
- **Vercel**: Go to your project → "Functions" tab to see any errors

## URLs to Share

Once deployed, you'll have:

- **Frontend**: `https://your-app.vercel.app` (share this with friends)
- **Backend**: `https://your-app.railway.app` (used internally)

## Free Tier Limitations

- **Railway**: 500 hours/month, $5 credit
- **Vercel**: 100GB bandwidth, unlimited static deployments

Perfect for testing and demos!

## Next Steps

1. Test thoroughly with friends
2. Consider custom domain (both services support this)
3. Add analytics if needed
4. Monitor usage to stay within free tiers

Happy testing! 🎉
