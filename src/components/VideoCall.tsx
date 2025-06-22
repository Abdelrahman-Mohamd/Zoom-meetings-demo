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

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map());

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(API_URL);
    setSocket(newSocket);

    newSocket.emit("join-meeting", { meetingId, user });

    // Socket event listeners
    newSocket.on("participants-list", (participants: Participant[]) => {
      onParticipantsUpdate(participants);
    });

    newSocket.on("user-joined", (participant: Participant) => {
      console.log("User joined:", participant);
      // Create peer connection for new user
      createPeerConnection(participant.socketId);
    });

    newSocket.on("user-left", (participant: Participant) => {
      console.log("User left:", participant);
      // Clean up peer connection
      const peer = peers.get(participant.socketId);
      if (peer) {
        peer.close();
        setPeers((prev) => {
          const newPeers = new Map(prev);
          newPeers.delete(participant.socketId);
          return newPeers;
        });
      }
      setRemoteStreams((prev) => {
        const newStreams = new Map(prev);
        newStreams.delete(participant.socketId);
        return newStreams;
      });
    });

    newSocket.on("offer", async ({ senderId, offer }) => {
      const peer = createPeerConnection(senderId);
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      newSocket.emit("answer", { meetingId, targetId: senderId, answer });
    });

    newSocket.on("answer", async ({ senderId, answer }) => {
      const peer = peers.get(senderId);
      if (peer) {
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    newSocket.on("ice-candidate", async ({ senderId, candidate }) => {
      const peer = peers.get(senderId);
      if (peer) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    newSocket.on("chat-message", (message: ChatMessage) => {
      onChatMessage(message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [meetingId, user]);

  // Initialize local media
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
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

  // Create peer connection
  const createPeerConnection = (socketId: string): RTCPeerConnection => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    // Add local stream to peer connection
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        peer.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    peer.ontrack = (event) => {
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
        socket.emit("ice-candidate", {
          meetingId,
          targetId: socketId,
          candidate: event.candidate,
        });
      }
    };

    setPeers((prev) => {
      const newPeers = new Map(prev);
      newPeers.set(socketId, peer);
      return newPeers;
    });

    return peer;
  };
  // Create offer for new peer
  // const createOffer = async (socketId: string) => {
  //   const peer = peers.get(socketId);
  //   if (peer && socket) {
  //     const offer = await peer.createOffer();
  //     await peer.setLocalDescription(offer);
  //     socket.emit('offer', { meetingId, targetId: socketId, offer });
  //   }
  // };
  // Handle screen sharing (to be implemented)
  // const handleScreenShare = async () => {
  //   // Screen sharing implementation will go here
  // };

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
    </div>
  );
};

export default VideoCall;
