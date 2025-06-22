import React, { useState } from "react";

interface User {
  id: string;
  name: string;
  role: "host" | "guest";
}

interface ChatMessage {
  id: string;
  message: string;
  user: User;
  timestamp: Date;
}

interface ChatPanelProps {
  isOpen: boolean;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onClose: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  messages,
  onSendMessage,
  onClose,
}) => {
  const [newMessage, setNewMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Chat</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex flex-col">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {message.user.name}
                </span>
                {message.user.role === "host" && (
                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                    Host
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-800">
                {message.message}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
