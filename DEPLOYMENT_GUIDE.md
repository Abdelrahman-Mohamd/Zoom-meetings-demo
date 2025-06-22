# Live Meetings App - Vercel Deployment Guide

## 🚀 Complete Deployment Instructions

### Prerequisites

1. Install Vercel CLI: `npm install -g vercel`
2. Create a Vercel account at https://vercel.com
3. Login to Vercel CLI: `vercel login`

### Step-by-Step Deployment

#### 1. Deploy Backend Server First

```bash
cd server
vercel --prod
```

**Important:** Copy the deployment URL (e.g., `https://your-server-name.vercel.app`)

#### 2. Update Frontend Environment Variables

Update `.env.production` with your backend URL:

```bash
VITE_API_URL=https://your-server-name.vercel.app
```

#### 3. Deploy Frontend

```bash
cd .. # Go back to root directory
vercel --prod
```

### Environment Variables Setup

#### Backend (.env in server folder):

```bash
JWT_SECRET=your-super-secret-jwt-key-here
CLIENT_URL=https://your-frontend-domain.vercel.app
PORT=3001
```

#### Frontend (.env.production in root):

```bash
VITE_API_URL=https://your-backend-domain.vercel.app
```

### Vercel Dashboard Configuration

1. Go to https://vercel.com/dashboard
2. For each project, add environment variables:
   - Backend: `JWT_SECRET`, `CLIENT_URL`
   - Frontend: `VITE_API_URL`

### Testing Your Deployment

1. Open your frontend URL
2. Create a meeting as host
3. Join from another device/browser as guest
4. Test video call functionality

### Troubleshooting

#### Common Issues:

1. **CORS Errors**: Make sure CLIENT_URL in backend matches your frontend domain
2. **Socket.IO Connection**: Ensure WebSocket support is enabled
3. **Camera Issues**: HTTPS is required for camera access in production

#### Logs:

- Backend logs: `vercel logs your-backend-url`
- Frontend build logs: Check Vercel dashboard

### Production Checklist

- [ ] Backend deployed and running
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] CORS properly configured
- [ ] Camera permissions work on HTTPS
- [ ] Socket.IO connections work
- [ ] Multi-device testing completed

### Domains

Your app will be available at:

- Frontend: `https://your-frontend-name.vercel.app`
- Backend API: `https://your-backend-name.vercel.app`

### Auto-Deployment Setup

Connect your GitHub repository to Vercel for automatic deployments:

1. Import project from GitHub in Vercel dashboard
2. Configure build settings
3. Set environment variables
4. Enable auto-deployments on push
