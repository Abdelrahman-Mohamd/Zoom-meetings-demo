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
  token: string;
  onParticipantsUpdate: (participants: Participant[]) => void;
  onChatMessage: (message: ChatMessage) => void;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  onScreenShareToggle: (isSharing: boolean) => void;
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
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map()
  );
  const [peers, setPeers] = useState<Map<string, RTCPeerConnection>>(new Map());
  const [isMediaReady, setIsMediaReady] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map());

  // Clean up peer connection
  const cleanupPeerConnection = useCallback((socketId: string) => {
    console.log("Cleaning up peer connection for:", socketId);
    setPeers((prevPeers) => {
      const peer = prevPeers.get(socketId);
      if (peer) {
        peer.close();
      }
      const newPeers = new Map(prevPeers);
      newPeers.delete(socketId);
      return newPeers;
    });

    setRemoteStreams((prev) => {
      const newStreams = new Map(prev);
      newStreams.delete(socketId);
      return newStreams;
    });
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback(
    (
      socketId: string,
      shouldCreateOffer: boolean = false
    ): RTCPeerConnection => {
      console.log(
        "Creating peer connection for:",
        socketId,
        "shouldCreateOffer:",
        shouldCreateOffer
      );

      const peer = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      // Add local stream to peer connection
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          console.log("Adding track to peer:", track.kind);
          peer.addTrack(track, localStream);
        });
      }

      // Handle remote stream
      peer.ontrack = (event) => {
        console.log("Received remote track from:", socketId);
        const [remoteStream] = event.streams;
        setRemoteStreams((prev) => {
          const newStreams = new Map(prev);
          newStreams.set(socketId, remoteStream);
          return newStreams;
        });
      };

      // Handle ICE candidates
      peer.onicecandidate = (event) => {
        if (event.candidate && socket) {
          console.log("Sending ICE candidate to:", socketId);
          socket.emit("ice-candidate", {
            meetingId,
            targetId: socketId,
            candidate: event.candidate,
          });
        }
      };

      // Handle connection state changes
      peer.onconnectionstatechange = () => {
        console.log(
          `Peer connection state with ${socketId}:`,
          peer.connectionState
        );
      };

      setPeers((prev) => {
        const newPeers = new Map(prev);
        newPeers.set(socketId, peer);
        return newPeers;
      });

      // Create offer if requested
      if (shouldCreateOffer && socket) {
        setTimeout(async () => {
          try {
            console.log("Creating offer for:", socketId);
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            socket.emit("offer", { meetingId, targetId: socketId, offer });
          } catch (error) {
            console.error("Error creating offer:", error);
          }
        }, 1000); // Small delay to ensure peer is ready
      }

      return peer;
    },
    [localStream, socket, meetingId]
  );

  // Initialize local media first
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        console.log("Requesting media access...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        console.log("Media access granted:", stream);
        setLocalStream(stream);
        setIsMediaReady(true);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
        // Try with lower constraints if error
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
            audio: true,
          });
          console.log("Media access granted with lower constraints:", stream);
          setLocalStream(stream);
          setIsMediaReady(true);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        } catch (secondError) {
          console.error("Second attempt failed:", secondError);
        }
      }
    };

    initializeMedia();
    return () => {
      if (localStream) {
        console.log("Cleaning up local stream");
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [localStream]);

  // Initialize socket connection after media is ready
  useEffect(() => {
    if (!isMediaReady || !localStream) return;

    console.log("Connecting to socket...");
    const newSocket = io(API_URL, {
      transports: ["websocket"],
      forceNew: true,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server:", newSocket.id);
      // Join the meeting after connection
      newSocket.emit("join-meeting", { meetingId, user });
    });

    // Socket event listeners
    newSocket.on("participants-list", (participantsList: Participant[]) => {
      console.log("Received participants list:", participantsList);
      onParticipantsUpdate(participantsList);

      // Create peer connections for existing participants (excluding self)
      participantsList.forEach((participant) => {
        if (
          participant.socketId !== newSocket.id &&
          participant.id !== user.id
        ) {
          console.log(
            "Creating peer connection for existing participant:",
            participant
          );
          createPeerConnection(participant.socketId, true); // true = create offer
        }
      });
    });

    newSocket.on("user-joined", (participant: Participant) => {
      console.log("User joined:", participant);

      // Only create peer connection if this is not the current user
      if (participant.socketId !== newSocket.id && participant.id !== user.id) {
        // The existing user should create an offer for the new user
        createPeerConnection(participant.socketId, false); // false = don't create offer yet
      }
    });

    newSocket.on("user-left", (participant: Participant) => {
      console.log("User left:", participant);

      // Clean up peer connection
      cleanupPeerConnection(participant.socketId);
    });

    newSocket.on("offer", async ({ senderId, offer }) => {
      console.log("Received offer from:", senderId);
      try {
        const peer = createPeerConnection(senderId, false);
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        newSocket.emit("answer", { meetingId, targetId: senderId, answer });
      } catch (error) {
        console.error("Error handling offer:", error);
      }
    });

    newSocket.on("answer", async ({ senderId, answer }) => {
      console.log("Received answer from:", senderId);
      try {
        setPeers((prevPeers) => {
          const peer = prevPeers.get(senderId);
          if (peer) {
            peer.setRemoteDescription(new RTCSessionDescription(answer));
          }
          return prevPeers;
        });
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    });

    newSocket.on("ice-candidate", async ({ senderId, candidate }) => {
      console.log("Received ICE candidate from:", senderId);
      try {
        setPeers((prevPeers) => {
          const peer = prevPeers.get(senderId);
          if (peer && candidate) {
            peer.addIceCandidate(new RTCIceCandidate(candidate));
          }
          return prevPeers;
        });
      } catch (error) {
        console.error("Error handling ICE candidate:", error);
      }
    });

    newSocket.on("chat-message", (message: ChatMessage) => {
      onChatMessage(message);
    });

    return () => {
      console.log("Cleaning up socket connection");
      newSocket.disconnect();
      // Clean up all peer connections
      setPeers((prevPeers) => {
        prevPeers.forEach((peer) => peer.close());
        return new Map();
      });
      setRemoteStreams(new Map());
    };
  }, [
    meetingId,
    user,
    isMediaReady,
    localStream,
    onParticipantsUpdate,
    onChatMessage,
    createPeerConnection,
    cleanupPeerConnection,
  ]);

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

  return (
    <div className="h-full flex flex-col bg-gray-900">
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

          {/* Remote Videos */}
          {Array.from(remoteStreams.entries()).map(([socketId, stream]) => (
            <div
              key={socketId}
              className="relative bg-gray-800 rounded-lg overflow-hidden"
            >
              <video
                ref={(el) => {
                  if (el) {
                    el.srcObject = stream;
                    remoteVideosRef.current.set(socketId, el);
                  }
                }}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                Remote User
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Debug Info */}
      <div className="p-2 bg-gray-800 text-white text-sm">
        <p>Local Stream: {localStream ? "✓" : "✗"}</p>
        <p>Socket Connected: {socket?.connected ? "✓" : "✗"}</p>
        <p>Peer Connections: {peers.size}</p>
        <p>Remote Streams: {remoteStreams.size}</p>
      </div>
    </div>
  );
};

export default VideoCall;
