import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { API_URL } from "../config/api";
import VideoCallTest from "../components/VideoCallTest";
import ChatPanel from "../components/ChatPanel";
import ControlPanel from "../components/ControlPanel";
import ParticipantsList from "../components/ParticipantsList";

interface Participant {
  id: string;
  name: string;
  role: "host" | "guest";
  socketId: string;
}

interface ChatMessage {
  id: string;
  message: string;
  user: {
    id: string;
    name: string;
    role: "host" | "guest";
  };
  timestamp: Date;
}

interface MeetingInfo {
  id: string;
  hostId: string;
  hostName: string;
  participants: Participant[];
  createdAt: Date;
  isActive: boolean;
}

const MeetingRoom: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [meetingInfo, setMeetingInfo] = useState<MeetingInfo | null>(null);

  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    const fetchMeetingInfo = async () => {
      try {
        const response = await fetch(`${API_URL}/api/meetings/${meetingId}`);
        if (response.ok) {
          const meeting = await response.json();
          setMeetingInfo(meeting);
        }
      } catch (error) {
        console.error("Error fetching meeting info:", error);
      }
    };

    fetchMeetingInfo();
  }, [meetingId, isAuthenticated, navigate]);

  const handleLeaveMeeting = () => {
    if (window.confirm("Are you sure you want to leave the meeting?")) {
      navigate("/");
    }
  };
  const handleSendMessage = (message: string) => {
    console.log("Send message:", message);
    // This will be handled by the VideoCall component through socket
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Please log in to join the meeting.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold">Live Meeting</h1>
          {meetingInfo && (
            <div className="text-sm text-gray-300">
              <span>Host: {meetingInfo.hostName}</span>
              <span className="ml-4">ID: {meetingId}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <ParticipantsList participants={participants} />
          <button
            onClick={handleLeaveMeeting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition duration-200"
          >
            Leave Meeting
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div
          className={`flex-1 ${
            isChatOpen ? "pr-80" : ""
          } transition-all duration-300`}
        >
          {" "}
          <VideoCallTest
            meetingId={meetingId!}
            user={user}
            token={token!}
            onParticipantsUpdate={setParticipants}
            onChatMessage={(message: ChatMessage) =>
              setChatMessages((prev) => [...prev, message])
            }
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
            isScreenSharing={isScreenSharing}
            onScreenShareToggle={setIsScreenSharing}
          />
        </div>

        {/* Chat Panel */}
        <ChatPanel
          isOpen={isChatOpen}
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          onClose={() => setIsChatOpen(false)}
        />
      </div>

      {/* Control Panel */}
      <ControlPanel
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
        isScreenSharing={isScreenSharing}
        isChatOpen={isChatOpen}
        onVideoToggle={setIsVideoEnabled}
        onAudioToggle={setIsAudioEnabled}
        onScreenShareToggle={() => setIsScreenSharing(!isScreenSharing)}
        onChatToggle={() => setIsChatOpen(!isChatOpen)}
        onLeaveMeeting={handleLeaveMeeting}
      />
    </div>
  );
};

export default MeetingRoom;
