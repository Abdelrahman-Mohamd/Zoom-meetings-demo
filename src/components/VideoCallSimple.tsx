import React, { useEffect, useRef, useState, useCallback } from "react";
import io, { Socket } from "socket.io-client";
import { API_URL } from "../config/api";

interface User {
  id: string;
  name: string;
  role: "host" | "guest";
}

interface Participant {
  id: string;
  name: string;
  role: "host" | "guest";
  socketId: string;
}

interface ChatMessage {
  id: string;
  message: string;
  user: User;
  timestamp: Date;
}

interface VideoCallProps {
  meetingId: string;
  user: User;
  onParticipantsUpdate: (participants: Participant[]) => void;
  onChatMessage: (message: ChatMessage) => void;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}

const VideoCall: React.FC<VideoCallProps> = ({
  meetingId,
  user,
  onParticipantsUpdate,
  onChatMessage,
  isVideoEnabled,
  isAudioEnabled,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");

  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Initialize socket connection
  useEffect(() => {
    console.log("Connecting to:", API_URL);
    const newSocket = io(API_URL, {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setIsConnected(true);
      setConnectionStatus("Connected");
      setSocket(newSocket);

      // Join the meeting room
      console.log("Joining meeting:", { meetingId, user });
      newSocket.emit("join-meeting", { meetingId, user });
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
      setConnectionStatus("Disconnected");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setConnectionStatus(`Connection error: ${error.message}`);
    });

    newSocket.on("participants-list", (participants: Participant[]) => {
      console.log("Participants list received:", participants);
      onParticipantsUpdate(participants);
    });

    newSocket.on("user-joined", (participant: Participant) => {
      console.log("User joined:", participant);
      setConnectionStatus(`${participant.name} joined the meeting`);
      setTimeout(() => setConnectionStatus("Connected"), 3000);
    });

    newSocket.on("user-left", (participant: Participant) => {
      console.log("User left:", participant);
      setConnectionStatus(`${participant.name} left the meeting`);
      setTimeout(() => setConnectionStatus("Connected"), 3000);
    });

    newSocket.on("chat-message", (message: ChatMessage) => {
      console.log("Chat message received:", message);
      onChatMessage(message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [meetingId, user, onParticipantsUpdate, onChatMessage]);

  // Initialize local media
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        console.log("Requesting camera and microphone access...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        console.log("Media access granted");
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setConnectionStatus("Camera ready");
      } catch (error) {
        console.error("Error accessing media devices:", error);
        setConnectionStatus(`Camera error: ${error}`);
      }
    };

    initializeMedia();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Update media tracks based on controls
  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = isVideoEnabled;
      });
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = isAudioEnabled;
      });
    }
  }, [localStream, isVideoEnabled, isAudioEnabled]);

  // Send a test chat message
  const sendTestMessage = useCallback(() => {
    if (socket && isConnected) {
      socket.emit("chat-message", {
        meetingId,
        message: `Test message from ${user.name}`,
        user,
      });
    }
  }, [socket, isConnected, meetingId, user]);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Status Bar */}
      <div className="bg-blue-600 text-white p-2 text-center">
        <p className="text-sm">
          Status: {connectionStatus} | Socket:{" "}
          {isConnected ? "✅ Connected" : "❌ Disconnected"} | Camera:{" "}
          {localStream ? "✅ Ready" : "❌ Not ready"}
        </p>
      </div>

      {/* Debug Info */}
      <div className="bg-gray-800 text-white p-2 text-xs">
        <p>API URL: {API_URL}</p>
        <p>Meeting ID: {meetingId}</p>
        <p>
          User: {user.name} ({user.role})
        </p>
        <p>Socket ID: {socket?.id || "Not connected"}</p>
        <button
          onClick={sendTestMessage}
          className="mt-2 px-3 py-1 bg-blue-500 rounded text-white text-xs"
          disabled={!isConnected}
        >
          Send Test Message
        </button>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
          {/* Local Video */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              {user.name} (You)
            </div>
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl font-bold">
                      {user.name[0]?.toUpperCase()}
                    </span>
                  </div>
                  <p>Camera Off</p>
                </div>
              </div>
            )}
          </div>

          {/* Placeholder for remote videos */}
          <div className="relative bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
            <div className="text-white text-center">
              <p>Waiting for other participants...</p>
              <p className="text-sm text-gray-300 mt-2">
                WebRTC connections will appear here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
