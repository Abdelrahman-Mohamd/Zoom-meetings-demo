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
  console.log("User connected:", socket.id);

  socket.on("join-meeting", ({ meetingId, user }) => {
    socket.join(meetingId);

    const meeting = meetings.get(meetingId);
    if (meeting) {
      const participant = {
        id: user.id,
        name: user.name,
        role: user.role,
        socketId: socket.id,
      };

      participants.set(socket.id, { ...participant, meetingId });

      // Add participant to meeting
      meeting.participants = meeting.participants.filter(
        (p) => p.id !== user.id
      );
      meeting.participants.push(participant);

      // Notify other participants
      socket.to(meetingId).emit("user-joined", participant);

      // Send current participants to the new user
      socket.emit("participants-list", meeting.participants);
    }
  });

  socket.on("offer", ({ meetingId, targetId, offer }) => {
    socket.to(meetingId).emit("offer", {
      senderId: socket.id,
      targetId,
      offer,
    });
  });

  socket.on("answer", ({ meetingId, targetId, answer }) => {
    socket.to(meetingId).emit("answer", {
      senderId: socket.id,
      targetId,
      answer,
    });
  });

  socket.on("ice-candidate", ({ meetingId, targetId, candidate }) => {
    socket.to(meetingId).emit("ice-candidate", {
      senderId: socket.id,
      targetId,
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
    console.log("User disconnected:", socket.id);

    const participant = participants.get(socket.id);
    if (participant) {
      const meeting = meetings.get(participant.meetingId);
      if (meeting) {
        meeting.participants = meeting.participants.filter(
          (p) => p.socketId !== socket.id
        );
        socket.to(participant.meetingId).emit("user-left", participant);
      }
      participants.delete(socket.id);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
