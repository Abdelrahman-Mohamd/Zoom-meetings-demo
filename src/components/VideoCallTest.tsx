import React, { useEffect, useState, useRef } from "react";
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

const VideoCallSimple: React.FC<VideoCallProps> = ({
  meetingId,
  user,
  onParticipantsUpdate,
  onChatMessage,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [status, setStatus] = useState("Initializing...");
  const [logs, setLogs] = useState<string[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Refs for video elements
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Use refs to avoid dependency issues
  const onParticipantsUpdateRef = useRef(onParticipantsUpdate);
  const onChatMessageRef = useRef(onChatMessage);

  // Update refs when props change
  useEffect(() => {
    onParticipantsUpdateRef.current = onParticipantsUpdate;
    onChatMessageRef.current = onChatMessage;
  }, [onParticipantsUpdate, onChatMessage]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs((prev) => [
      ...prev.slice(-4),
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  }; // Store user data in refs to avoid dependency issues
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]); // Initialize camera
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const initializeMedia = async () => {
      try {
        addLog("🎥 Requesting camera access...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        addLog("✅ Camera access granted");
        currentStream = stream;
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        addLog(`❌ Camera error: ${errorMessage}`);
        setCameraError(errorMessage);

        // Try with lower constraints if error
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
            audio: true,
          });
          addLog("✅ Camera access granted with lower quality");
          currentStream = stream;
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        } catch (secondError) {
          const secondErrorMessage =
            secondError instanceof Error
              ? secondError.message
              : "Unknown error";
          addLog(`❌ Camera failed completely: ${secondErrorMessage}`);
          setCameraError(secondErrorMessage);
        }
      }
    };

    initializeMedia();

    return () => {
      // Cleanup media stream on unmount
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []); // Empty dependency array - only run once on mount

  useEffect(() => {
    addLog("🚀 Starting connection test...");
    setStatus("Connecting to server...");

    const newSocket = io(API_URL, {
      transports: ["websocket", "polling"],
      timeout: 10000,
    });

    newSocket.on("connect", () => {
      addLog(`✅ Connected! Socket ID: ${newSocket.id}`);
      setStatus(`Connected (${(newSocket.id || "").substring(0, 8)}...)`);
      setSocket(newSocket);

      // Join meeting - use ref to get current user data
      addLog(`🏠 Joining meeting: ${meetingId}`);
      newSocket.emit("join-meeting", { meetingId, user: userRef.current });
    });

    newSocket.on("disconnect", (reason) => {
      addLog(`❌ Disconnected: ${reason}`);
      setStatus(`Disconnected: ${reason}`);
    });

    newSocket.on("connect_error", (error) => {
      addLog(`❌ Connection error: ${error.message}`);
      setStatus(`Connection error: ${error.message}`);
    });
    newSocket.on("participants-list", (participantsList: Participant[]) => {
      addLog(`👥 Received ${participantsList.length} participants`);
      setParticipants(participantsList);
      // Defer callback to avoid setState during render
      setTimeout(() => onParticipantsUpdateRef.current(participantsList), 0);
      setStatus(`${participantsList.length} participants in meeting`);
    });

    newSocket.on("user-joined", (participant: Participant) => {
      addLog(`✨ ${participant.name} joined`);
      setParticipants((prev) => {
        const updated = [
          ...prev.filter((p) => p.id !== participant.id),
          participant,
        ];
        // Defer callback to avoid setState during render
        setTimeout(() => onParticipantsUpdateRef.current(updated), 0);
        return updated;
      });
    });

    newSocket.on("user-left", (participant: Participant) => {
      addLog(`👋 ${participant.name} left`);
      setParticipants((prev) => {
        const updated = prev.filter((p) => p.id !== participant.id);
        // Defer callback to avoid setState during render
        setTimeout(() => onParticipantsUpdateRef.current(updated), 0);
        return updated;
      });
    });

    newSocket.on("chat-message", (message: ChatMessage) => {
      onChatMessageRef.current(message);
    });

    return () => {
      addLog("🧹 Cleaning up connection");
      newSocket.disconnect();
    };
  }, [meetingId]); // Only include meetingId - user is handled via ref

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Status Header */}
      <div className="bg-blue-800 p-4">
        <h2 className="text-xl font-bold">Connection Test Mode</h2>{" "}
        <div className="mt-2 grid grid-cols-5 gap-4 text-sm">
          <div>
            <span className="font-semibold">Status:</span>
            <div
              className={socket?.connected ? "text-green-400" : "text-red-400"}
            >
              {status}
            </div>
          </div>
          <div>
            <span className="font-semibold">Socket:</span>
            <div
              className={socket?.connected ? "text-green-400" : "text-red-400"}
            >
              {socket?.connected ? "✅ Connected" : "❌ Disconnected"}
            </div>
          </div>
          <div>
            <span className="font-semibold">Camera:</span>
            <div
              className={
                localStream
                  ? "text-green-400"
                  : cameraError
                  ? "text-red-400"
                  : "text-yellow-400"
              }
            >
              {localStream
                ? "✅ Active"
                : cameraError
                ? "❌ Error"
                : "⏳ Loading"}
            </div>
          </div>
          <div>
            <span className="font-semibold">Meeting:</span>
            <div className="text-blue-300">{meetingId}</div>
          </div>
          <div>
            <span className="font-semibold">Participants:</span>
            <div className="text-yellow-400">{participants.length}</div>
          </div>
        </div>
      </div>{" "}
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Video Section */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-bold mb-4 text-blue-400">
              📹 Your Camera
            </h3>

            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              {localStream ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-900">
                  {cameraError ? (
                    <div className="text-center">
                      <div className="text-4xl mb-2">❌</div>
                      <p className="text-sm">Camera Error</p>
                      <p className="text-xs text-red-400 mt-1">{cameraError}</p>
                      <p className="text-xs text-yellow-400 mt-2">
                        Try HTTPS or check camera permissions
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎥</div>
                      <p>Loading camera...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Participants Panel */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-bold mb-4 text-green-400">
              Participants ({participants.length})
            </h3>

            {participants.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                <div className="text-4xl mb-2">👥</div>
                <p>Waiting for participants to join...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {" "}
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className={`p-3 rounded-lg ${
                      participant.id === userRef.current.id
                        ? "bg-blue-700"
                        : "bg-gray-700"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">
                          {participant.name}
                          {participant.id === userRef.current.id && " (You)"}
                        </div>
                        <div className="text-sm text-gray-400">
                          {participant.role} •{" "}
                          {participant.socketId.substring(0, 8)}...
                        </div>
                      </div>
                      <div className="text-2xl">
                        {participant.role === "host" ? "👑" : "👤"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Logs Panel */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-bold mb-4 text-yellow-400">
              Connection Logs
            </h3>
            <div className="bg-black rounded p-3 h-64 overflow-y-auto font-mono text-xs">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-gray-500">Waiting for logs...</div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Instructions */}
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <h4 className="font-bold mb-2">🧪 Testing Instructions:</h4>
        <div className="text-sm text-gray-300 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <strong>Single Device:</strong> You should see 1 participant
            (yourself)
          </div>
          <div>
            <strong>Multi Device:</strong> Open another browser/device, join
            same meeting ID
          </div>
        </div>
        <div className="mt-2 text-xs text-yellow-400">
          📌 Camera disabled due to non-HTTPS connection. Participant tracking
          should still work!
        </div>
      </div>
    </div>
  );
};

export default VideoCallSimple;
