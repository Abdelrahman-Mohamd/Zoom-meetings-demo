const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5174",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (use database in production)
const meetings = new Map();
const participants = new Map();

// JWT token generation
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Routes
app.post("/api/auth/login", (req, res) => {
  const { name, role } = req.body;

  if (!name || !role) {
    return res.status(400).json({ error: "Name and role are required" });
  }

  const user = {
    id: uuidv4(),
    name,
    role: role === "host" ? "host" : "guest",
  };

  const token = generateToken(user);
  res.json({ token, user });
});

app.post("/api/meetings", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const user = verifyToken(token);

  if (!user || user.role !== "host") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const meetingId = uuidv4();
  const meeting = {
    id: meetingId,
    hostId: user.id,
    hostName: user.name,
    participants: [],
    createdAt: new Date(),
    isActive: true,
  };

  meetings.set(meetingId, meeting);
  res.json({ meetingId, meeting });
});

app.get("/api/meetings/:meetingId", (req, res) => {
  const { meetingId } = req.params;
  const meeting = meetings.get(meetingId);

  if (!meeting) {
    return res.status(404).json({ error: "Meeting not found" });
  }

  res.json(meeting);
});

app.post("/api/meetings/:meetingId/join", (req, res) => {
  const { meetingId } = req.params;
  const token = req.headers.authorization?.split(" ")[1];
  const user = verifyToken(token);

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const meeting = meetings.get(meetingId);
  if (!meeting) {
    return res.status(404).json({ error: "Meeting not found" });
  }

  if (!meeting.isActive) {
    return res.status(400).json({ error: "Meeting is not active" });
  }

  res.json({ meeting, user });
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);
  console.log("📊 Total connected clients:", io.engine.clientsCount);
  socket.on("join-meeting", ({ meetingId, user }) => {
    console.log(
      `👥 User ${user.name} (${socket.id}) joining meeting ${meetingId}`
    );
    socket.join(meetingId);

    let meeting = meetings.get(meetingId);
    if (!meeting) {
      // Create meeting if it doesn't exist (for testing)
      console.log(`📋 Creating new meeting: ${meetingId}`);
      meeting = {
        id: meetingId,
        hostId: user.id,
        hostName: user.name,
        participants: [],
        createdAt: new Date(),
        isActive: true,
      };
      meetings.set(meetingId, meeting);
    }

    const participant = {
      id: user.id,
      name: user.name,
      role: user.role,
      socketId: socket.id,
    };

    participants.set(socket.id, { ...participant, meetingId });

    // Add participant to meeting (remove any existing entry for this user)
    meeting.participants = meeting.participants.filter((p) => p.id !== user.id);
    meeting.participants.push(participant);

    console.log(
      `📋 Meeting ${meetingId} now has ${meeting.participants.length} participants:`,
      meeting.participants.map((p) => `${p.name}(${p.socketId})`)
    );

    // Notify other participants that a new user joined
    socket.to(meetingId).emit("user-joined", participant);

    // Send current participants list to the new user
    console.log(
      `📤 Sending participants list to ${socket.id}:`,
      meeting.participants
    );
    socket.emit("participants-list", meeting.participants);

    // Send updated participants list to all users in the meeting
    socket.to(meetingId).emit("participants-updated", meeting.participants);
  });
  socket.on("offer", ({ meetingId, targetId, offer }) => {
    console.log(`Forwarding offer from ${socket.id} to ${targetId}`);
    socket.to(targetId).emit("offer", {
      senderId: socket.id,
      offer,
    });
  });

  socket.on("answer", ({ meetingId, targetId, answer }) => {
    console.log(`Forwarding answer from ${socket.id} to ${targetId}`);
    socket.to(targetId).emit("answer", {
      senderId: socket.id,
      answer,
    });
  });

  socket.on("ice-candidate", ({ meetingId, targetId, candidate }) => {
    console.log(`Forwarding ICE candidate from ${socket.id} to ${targetId}`);
    socket.to(targetId).emit("ice-candidate", {
      senderId: socket.id,
      candidate,
    });
  });

  socket.on("chat-message", ({ meetingId, message, user }) => {
    const chatMessage = {
      id: uuidv4(),
      message,
      user,
      timestamp: new Date(),
    };

    io.to(meetingId).emit("chat-message", chatMessage);
  });

  socket.on("screen-share-start", ({ meetingId, user }) => {
    socket.to(meetingId).emit("screen-share-start", { user });
  });

  socket.on("screen-share-stop", ({ meetingId, user }) => {
    socket.to(meetingId).emit("screen-share-stop", { user });
  });
  socket.on("disconnect", () => {
    console.log("🔌 User disconnected:", socket.id);
    console.log("📊 Total connected clients:", io.engine.clientsCount);

    const participant = participants.get(socket.id);
    if (participant) {
      const meeting = meetings.get(participant.meetingId);
      if (meeting) {
        // Remove participant from meeting
        meeting.participants = meeting.participants.filter(
          (p) => p.socketId !== socket.id
        );

        console.log(
          `📋 Meeting ${participant.meetingId} now has ${meeting.participants.length} participants`
        );

        // Notify other participants
        socket.to(participant.meetingId).emit("user-left", participant);

        // Send updated participants list to remaining users
        socket
          .to(participant.meetingId)
          .emit("participants-updated", meeting.participants);
      }
      participants.delete(socket.id);
    }
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://192.168.1.3:${PORT}`);
});
