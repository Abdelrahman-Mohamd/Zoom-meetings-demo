import React, { useEffect, useRef, useState } from "react";
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
  token: string;
  onParticipantsUpdate: (participants: Participant[]) => void;
  onChatMessage: (message: ChatMessage) => void;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  onScreenShareToggle: (isSharing: boolean) => void;
}

const VideoCallStable: React.FC<VideoCallProps> = ({
  meetingId,
  user,
  onParticipantsUpdate,
  onChatMessage,
  isVideoEnabled,
  isAudioEnabled,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [connectionStatus, setConnectionStatus] = useState("Initializing...");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Initialize everything step by step
  useEffect(() => {
    let isMounted = true;
    
    const initializeApp = async () => {
      console.log("=== INITIALIZING VIDEO CALL ===");    const initializeApp = async () => {
      console.log("=== INITIALIZING VIDEO CALL ===");
      
      // Step 1: Check if media devices are available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn("⚠️ Media devices not available - likely due to non-secure context");
        setConnectionStatus("Media not available (need HTTPS or localhost)");
        
        // Skip media and go straight to socket connection for testing
        setConnectionStatus("Connecting to server (no camera)...");
      } else {
        // Step 1: Get media access
        try {
          setConnectionStatus("Getting camera access...");
          console.log("1. Requesting media access...");
          
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          
          if (!isMounted) return;
          
          console.log("✅ Media access granted");
          setLocalStream(stream);
          localStreamRef.current = stream;
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          
          setConnectionStatus("Connecting to server...");
          
        } catch (error) {
          console.error("❌ Media access denied:", error);
          setConnectionStatus("Camera access denied - continuing without camera");
          // Continue without camera
        }
      }
      
      // Step 2: Connect to socket
      console.log("2. Connecting to socket...");
      const newSocket = io(API_URL, {
        transports: ['websocket'],
        timeout: 10000,
      });
      
      if (!isMounted) {
        newSocket.disconnect();
        return;
      }
      
      socketRef.current = newSocket;
      setSocket(newSocket);
      
      // Step 3: Set up socket event handlers
      newSocket.on('connect', () => {
        if (!isMounted) return;
        console.log("✅ Socket connected:", newSocket.id);
        setConnectionStatus(`Connected! (${newSocket.id})`);
        
        // Step 4: Join meeting
        console.log("3. Joining meeting:", meetingId);
        newSocket.emit("join-meeting", { meetingId, user });
      });

      newSocket.on('disconnect', (reason) => {
        if (!isMounted) return;
        console.log("❌ Socket disconnected:", reason);
        setConnectionStatus("Disconnected: " + reason);
      });

      newSocket.on('connect_error', (error) => {
        if (!isMounted) return;
        console.error("❌ Connection error:", error);
        setConnectionStatus("Connection error: " + error.message);
      });

      newSocket.on("participants-list", (participantsList: Participant[]) => {
        if (!isMounted) return;
        console.log("✅ Received participants list:", participantsList);
        setParticipants(participantsList);
        onParticipantsUpdate(participantsList);
        setConnectionStatus(`${participantsList.length} participants`);
      });

      newSocket.on("user-joined", (participant: Participant) => {
        if (!isMounted) return;
        console.log("✅ User joined:", participant);
        
        setParticipants(prev => {
          const updated = [...prev.filter(p => p.id !== participant.id), participant];
          onParticipantsUpdate(updated);
          return updated;
        });
      });

      newSocket.on("user-left", (participant: Participant) => {
        if (!isMounted) return;
        console.log("❌ User left:", participant);
        
        setParticipants(prev => {
          const updated = prev.filter(p => p.id !== participant.id);
          onParticipantsUpdate(updated);
          return updated;
        });
      });

      newSocket.on("chat-message", (message: ChatMessage) => {
        if (!isMounted) return;
        onChatMessage(message);
      });
    };

    initializeApp();

    return () => {
      console.log("🧹 Cleaning up VideoCallStable");
      isMounted = false;
      
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [meetingId, user.id, user.name, user.role]); // Only depend on stable values

  // Handle media control changes
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

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Status Bar */}
      <div className="bg-gray-800 text-white p-2 text-sm">
        <div className="flex justify-between items-center">
          <span>Status: {connectionStatus}</span>
          <div className="flex space-x-4">
            <span>Socket: {socket?.connected ? '✅' : '❌'}</span>
            <span>Camera: {localStream ? '✅' : '❌'}</span>
            <span>Participants: {participants.length}</span>
          </div>
        </div>
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
          {participants.length > 1 && (
            <div className="relative bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
              <div className="text-white text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold">
                    {participants.find(p => p.id !== user.id)?.name[0]?.toUpperCase()}
                  </span>
                </div>
                <p>Remote User</p>
                <p className="text-sm text-gray-400">WebRTC connecting...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Participants List */}
      <div className="bg-gray-800 text-white p-2 text-sm">
        <h3 className="font-bold mb-1">Participants ({participants.length}):</h3>
        {participants.map((participant, index) => (
          <div key={participant.id} className="flex justify-between">
            <span>{participant.name} ({participant.role})</span>
            <span className="text-gray-400">{participant.socketId.slice(0, 8)}...</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoCallStable;
