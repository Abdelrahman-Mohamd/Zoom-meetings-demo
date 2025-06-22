import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const DirectTest: React.FC = () => {
  const [status, setStatus] = useState("Starting...");
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    console.log("=== DIRECT TEST STARTING ===");

    // Test direct connection to server
    const API_URL = "http://192.168.1.3:3001";
    console.log("Connecting to:", API_URL);

    const newSocket = io(API_URL, {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setStatus(`Connected: ${newSocket.id}`);

      // Test join meeting
      const testData = {
        meetingId: "test-meeting-123",
        user: {
          id: "test-user-" + Date.now(),
          name: "Test User",
          role: "host",
        },
      };

      console.log("Emitting join-meeting:", testData);
      newSocket.emit("join-meeting", testData);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setStatus("Disconnected");
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error);
      setStatus("Connection Error: " + error.message);
    });

    newSocket.on("participants-list", (participants) => {
      console.log("✅ Got participants:", participants);
      setStatus(`Participants: ${participants.length}`);
    });

    newSocket.on("user-joined", (participant) => {
      console.log("✅ User joined:", participant);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      <h1 className="text-3xl font-bold text-green-400 mb-4">
        Direct Connection Test
      </h1>
      <div className="bg-gray-800 p-4 rounded">
        <p className="text-lg">Status: {status}</p>
        <p>Socket ID: {socket?.id || "None"}</p>
        <p>Connected: {socket?.connected ? "Yes" : "No"}</p>
      </div>
      <div className="mt-4 text-sm text-gray-400">
        <p>Check browser console (F12) for detailed logs</p>
      </div>
    </div>
  );
};

export default DirectTest;
