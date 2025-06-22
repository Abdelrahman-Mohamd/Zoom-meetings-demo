import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { API_URL } from "../config/api";

interface TestProps {
  meetingId: string;
  user: {
    id: string;
    name: string;
    role: "host" | "guest";
  };
}

const SimpleTest: React.FC<TestProps> = ({ meetingId, user }) => {
  const [socket, setSocket] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<string>("Initializing...");

  useEffect(() => {
    console.log("=== SimpleTest: Starting initialization ===");
    console.log("API_URL:", API_URL);
    console.log("Meeting ID:", meetingId);
    console.log("User:", user);

    // Test 1: Get media first
    const getMedia = async () => {
      try {
        setStatus("Requesting camera access...");
        console.log("Requesting media access...");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        console.log("✅ Media access granted:", stream);
        setLocalStream(stream);
        setStatus("Camera access granted ✅");

        // Test 2: Connect to socket
        console.log("Connecting to socket at:", API_URL);
        const newSocket = io(API_URL);

        newSocket.on("connect", () => {
          console.log("✅ Socket connected:", newSocket.id);
          setStatus(`Connected to server ✅ (${newSocket.id})`);

          // Test 3: Join meeting
          console.log("Joining meeting...");
          newSocket.emit("join-meeting", { meetingId, user });
          setStatus("Joined meeting, waiting for response...");
        });

        newSocket.on("disconnect", () => {
          console.log("❌ Socket disconnected");
          setStatus("Disconnected from server ❌");
        });

        newSocket.on("participants-list", (participantsList: any[]) => {
          console.log("✅ Received participants list:", participantsList);
          setParticipants(participantsList);
          setStatus(`Participants received: ${participantsList.length}`);
        });

        newSocket.on("user-joined", (participant: any) => {
          console.log("✅ User joined:", participant);
          setStatus(`User joined: ${participant.name}`);
        });

        newSocket.on("user-left", (participant: any) => {
          console.log("❌ User left:", participant);
          setStatus(`User left: ${participant.name}`);
        });

        newSocket.on("connect_error", (error: any) => {
          console.error("❌ Socket connection error:", error);
          setStatus("Connection error: " + error.message);
        });

        setSocket(newSocket);
      } catch (error) {
        console.error("❌ Error getting media:", error);
        setStatus("Camera access denied ❌: " + (error as Error).message);
      }
    };

    getMedia();

    return () => {
      if (socket) {
        console.log("Cleaning up socket");
        socket.disconnect();
      }
      if (localStream) {
        console.log("Cleaning up media stream");
        localStream
          .getTracks()
          .forEach((track: MediaStreamTrack) => track.stop());
      }
    };
  }, [meetingId, user]);

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Connection Test Debug</h1>

      <div className="space-y-4">
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="font-bold">Status:</h2>
          <p>{status}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h2 className="font-bold">Details:</h2>
          <p>API URL: {API_URL}</p>
          <p>Meeting ID: {meetingId}</p>
          <p>
            User: {user.name} ({user.role})
          </p>
          <p>Socket ID: {socket?.id || "Not connected"}</p>
          <p>Socket Connected: {socket?.connected ? "✅" : "❌"}</p>
          <p>Local Stream: {localStream ? "✅" : "❌"}</p>
          <p>Participants Count: {participants.length}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h2 className="font-bold">Participants:</h2>
          {participants.length === 0 ? (
            <p>No participants yet</p>
          ) : (
            participants.map((p, index) => (
              <div key={index}>
                {p.name} ({p.role}) - Socket: {p.socketId}
              </div>
            ))
          )}
        </div>

        {localStream && (
          <div className="bg-gray-800 p-4 rounded">
            <h2 className="font-bold">Local Video:</h2>
            <video
              ref={(video) => {
                if (video && localStream) {
                  video.srcObject = localStream;
                }
              }}
              autoPlay
              muted
              playsInline
              className="w-64 h-48 bg-gray-700"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleTest;
