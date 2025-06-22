<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Live Meetings App - Copilot Instructions

This is a React-based video meeting application with WebRTC capabilities, similar to Zoom. The project includes:

## Architecture

- **Frontend**: React + TypeScript with Vite
- **Backend**: Node.js + Express + Socket.IO
- **Real-time Communication**: WebRTC for peer-to-peer video/audio
- **Styling**: TailwindCSS
- **Authentication**: JWT tokens

## Key Features

- Video and audio communication
- Screen sharing
- Real-time text chat
- Meeting rooms with host/guest roles
- 1-on-1 and group meetings

## Project Structure

- `/src/pages/` - Main page components (HomePage, HostPage, GuestPage, MeetingRoom)
- `/src/components/` - Reusable components (VideoCall, ChatPanel, ControlPanel, ParticipantsList)
- `/src/contexts/` - React contexts for state management (AuthContext)
- `/server/` - Express server with Socket.IO for real-time communication

## Development Guidelines

- Use TypeScript with proper type definitions
- Follow React best practices with hooks and functional components
- Use TailwindCSS for all styling
- Implement WebRTC peer connections for video/audio
- Use Socket.IO for real-time events (chat, participant management)
- Handle authentication with JWT tokens
- Ensure responsive design for different screen sizes

## API Endpoints

- POST `/api/auth/login` - User authentication
- POST `/api/meetings` - Create new meeting (host only)
- GET `/api/meetings/:meetingId` - Get meeting details
- POST `/api/meetings/:meetingId/join` - Join existing meeting

## Socket Events

- `join-meeting` - Join a meeting room
- `user-joined` / `user-left` - Participant management
- `offer` / `answer` / `ice-candidate` - WebRTC signaling
- `chat-message` - Real-time chat
- `screen-share-start` / `screen-share-stop` - Screen sharing events
