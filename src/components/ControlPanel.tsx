import React from "react";

interface ControlPanelProps {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  isChatOpen: boolean;
  onVideoToggle: (enabled: boolean) => void;
  onAudioToggle: (enabled: boolean) => void;
  onScreenShareToggle: () => void;
  onChatToggle: () => void;
  onLeaveMeeting: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  isChatOpen,
  onVideoToggle,
  onAudioToggle,
  onScreenShareToggle,
  onChatToggle,
  onLeaveMeeting,
}) => {
  return (
    <div className="bg-gray-800 p-4 flex justify-center items-center space-x-4">
      {/* Video Toggle */}
      <button
        onClick={() => onVideoToggle(!isVideoEnabled)}
        className={`p-3 rounded-full transition-colors ${
          isVideoEnabled
            ? "bg-gray-600 hover:bg-gray-700 text-white"
            : "bg-red-600 hover:bg-red-700 text-white"
        }`}
        title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
      >
        {isVideoEnabled ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
            />
          </svg>
        )}
      </button>

      {/* Audio Toggle */}
      <button
        onClick={() => onAudioToggle(!isAudioEnabled)}
        className={`p-3 rounded-full transition-colors ${
          isAudioEnabled
            ? "bg-gray-600 hover:bg-gray-700 text-white"
            : "bg-red-600 hover:bg-red-700 text-white"
        }`}
        title={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
      >
        {isAudioEnabled ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1m0 0V5a2 2 0 012-2h2a2 2 0 012 2v8.5M15 9.5V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v.5m8 10.5L3 6"
            />
          </svg>
        )}
      </button>

      {/* Screen Share Toggle */}
      <button
        onClick={onScreenShareToggle}
        className={`p-3 rounded-full transition-colors ${
          isScreenSharing
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-gray-600 hover:bg-gray-700 text-white"
        }`}
        title={isScreenSharing ? "Stop sharing screen" : "Share screen"}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </button>

      {/* Chat Toggle */}
      <button
        onClick={onChatToggle}
        className={`p-3 rounded-full transition-colors ${
          isChatOpen
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-gray-600 hover:bg-gray-700 text-white"
        }`}
        title={isChatOpen ? "Close chat" : "Open chat"}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {/* Leave Meeting */}
      <button
        onClick={onLeaveMeeting}
        className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
        title="Leave meeting"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </button>
    </div>
  );
};

export default ControlPanel;
