#!/bin/bash

# Live Meetings App - Vercel Deployment Script

echo "🚀 Starting deployment to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📁 Current directory: $(pwd)"

# Deploy Backend First
echo "🔧 Deploying Backend..."
cd server
echo "📁 Changed to server directory: $(pwd)"

# Deploy server to Vercel
vercel --prod

echo "✅ Backend deployed!"
echo "🔗 Copy the deployment URL and update the frontend environment variables"

# Go back to root
cd ..

# Wait for user to update environment variables
echo "⏳ Please update .env.production with your backend URL, then press Enter to continue..."
read -p "Press Enter to continue with frontend deployment..."

# Deploy Frontend
echo "🔧 Deploying Frontend..."
vercel --prod

echo "✅ Deployment complete!"
echo "📱 Your live meetings app is now live on Vercel!"
