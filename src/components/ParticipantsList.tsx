import React, { useState } from "react";

interface Participant {
  id: string;
  name: string;
  role: "host" | "guest";
  socketId: string;
}

interface ParticipantsListProps {
  participants: Participant[];
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
        <span className="text-sm">Participants ({participants.length})</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-20">
            <div className="p-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">
                Participants ({participants.length})
              </h3>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {participants.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No participants yet
                </div>
              ) : (
                participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="p-3 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {participant.name[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {participant.name}
                        </div>
                        {participant.role === "host" && (
                          <div className="text-xs text-blue-600">Host</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {/* Online indicator */}
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ParticipantsList;
