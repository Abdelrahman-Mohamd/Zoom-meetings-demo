# 🏠 Local Network Testing Guide

## ✅ Setup Complete!

Your Live Meetings App is now configured for local network testing.

### 🌐 Access URLs:

**For You (Host Computer):**

- Frontend: http://localhost:5175 OR http://192.168.1.3:5175
- Backend: http://localhost:3001 OR http://192.168.1.3:3001

**For Others on Your Network:**

- Frontend: http://192.168.1.3:5175
- (They don't need to access the backend directly)

### 🎯 How to Test with 2 People:

#### Option 1: Two Different Devices (Recommended)

1. **On Your Computer:**

   - Go to http://192.168.1.3:5175
   - Click "Host a Meeting"
   - Enter your name (e.g., "Alice")
   - Note the Meeting ID that appears

2. **On Another Device (phone, tablet, another computer):**
   - Make sure it's connected to the same WiFi network
   - Open a web browser
   - Go to http://192.168.1.3:5175
   - Enter the Meeting ID from step 1
   - Enter a different name (e.g., "Bob")
   - Click "Join"

#### Option 2: Same Computer, Different Browsers

1. **In Chrome:**

   - Go to http://192.168.1.3:5175
   - Host a meeting

2. **In Edge/Firefox (or Chrome Incognito):**
   - Go to http://192.168.1.3:5175
   - Join the meeting with the ID from step 1

### 🎥 Testing Features:

Once both people are in the meeting:

- ✅ **Video/Audio**: You should see both video feeds
- ✅ **Chat**: Click the chat icon and send messages
- ✅ **Controls**: Test mute/unmute, camera on/off
- ✅ **Participants**: Click the participants list to see who's in the meeting

### 🔧 Troubleshooting:

**If someone can't access the app:**

1. Make sure they're on the same WiFi network
2. Check Windows Firewall settings
3. Try accessing from the host computer first to make sure it works

**If video/audio doesn't work:**

1. Grant camera/microphone permissions when prompted
2. Make sure you're using HTTPS or localhost (WebRTC requirement)
3. Try refreshing the page

**Common Issues:**

- **"Can't connect"**: Make sure both servers are running
- **"No video"**: Check camera permissions in browser
- **"No audio"**: Check microphone permissions

### 🔥 Quick Test Commands:

If you need to restart the servers:

```bash
# Backend (in server folder)
npm run dev

# Frontend (in main folder)
npm run dev
```

### 📱 Mobile Testing:

The app works on mobile browsers too! Just visit http://192.168.1.3:5175 on any phone/tablet connected to your WiFi.

---

**Ready to test? Go to: http://192.168.1.3:5175** 🚀
