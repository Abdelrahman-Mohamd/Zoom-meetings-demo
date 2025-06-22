# Live Meetings App

A React-based video meeting application with WebRTC capabilities, similar to Zoom. Built with modern web technologies for real-time video communication.

## 🚀 Quick Deploy

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/live-meetings-app-demo)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/railway.app)

## Features

- 🎥 **Video & Audio Communication** - High-quality peer-to-peer video calls
- 🖥️ **Screen Sharing** - Share your screen with other participants
- 💬 **Real-time Chat** - Text messaging during meetings
- 👥 **Participant Management** - See who's in the meeting
- 🏠 **Host/Guest Roles** - Different permissions for meeting hosts and guests
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Technology Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for modern styling
- **WebRTC** for peer-to-peer video communication
- **Socket.IO Client** for real-time events

### Backend

- **Node.js** with Express
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **CORS** enabled for cross-origin requests

## Quick Start

### Prerequisites

- Node.js 16+ installed
- Modern web browser with WebRTC support

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd live-meetings-app-demo
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

### Running the Application

1. **Start the backend server**

   ```bash
   cd server
   npm run dev
   ```

   Server will run on http://localhost:3001

2. **Start the frontend (in a new terminal)**
   ```bash
   npm run dev
   ```
   Frontend will run on http://localhost:5173

### Usage

1. **Host a Meeting**

   - Go to http://localhost:5173
   - Click "Host a Meeting"
   - Enter your name and start the meeting
   - Share the meeting ID with participants

2. **Join a Meeting**
   - Go to http://localhost:5173
   - Enter the meeting ID and click "Join"
   - Enter your name to join the meeting

## Project Structure

```
live-meetings-app-demo/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── VideoCall.tsx   # Main video calling component
│   │   ├── ChatPanel.tsx   # Chat functionality
│   │   ├── ControlPanel.tsx # Media controls
│   │   └── ParticipantsList.tsx # Participants management
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication context
│   ├── pages/              # Page components
│   │   ├── HomePage.tsx    # Landing page
│   │   ├── HostPage.tsx    # Host meeting page
│   │   ├── GuestPage.tsx   # Guest join page
│   │   └── MeetingRoom.tsx # Main meeting interface
│   └── App.tsx             # Main app component
├── server/                 # Backend server
│   ├── server.js          # Express server with Socket.IO
│   ├── package.json       # Server dependencies
│   └── .env               # Environment variables
└── README.md              # This file
```

## API Endpoints

- `POST /api/auth/login` - User authentication
- `POST /api/meetings` - Create new meeting (host only)
- `GET /api/meetings/:meetingId` - Get meeting details
- `POST /api/meetings/:meetingId/join` - Join existing meeting

## WebRTC Features

- **Peer-to-peer connections** using STUN servers
- **Audio/Video streaming** with media track management
- **Screen sharing** with display media capture
- **ICE candidate exchange** for connection establishment

## Socket.IO Events

- `join-meeting` - Join a meeting room
- `user-joined` / `user-left` - Participant management
- `offer` / `answer` / `ice-candidate` - WebRTC signaling
- `chat-message` - Real-time chat messages
- `screen-share-start` / `screen-share-stop` - Screen sharing events

## Development

### Frontend Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development

```bash
cd server
npm run dev          # Start with nodemon
npm start            # Start production server
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

_WebRTC requires a secure context (HTTPS) in production_

## Limitations & Future Enhancements

### Current Limitations

- No user registration/database
- No meeting recording (planned)
- No meeting scheduling
- No bandwidth adaptation

### Planned Features

- Meeting recording
- File sharing
- Whiteboard collaboration
- Mobile app
- Advanced meeting controls

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- WebRTC for real-time communication
- Socket.IO for real-time events
- TailwindCSS for beautiful styling
- React team for the amazing framework
  })

````

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
````
