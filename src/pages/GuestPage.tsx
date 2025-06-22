import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { API_URL } from "../config/api";

const GuestPage: React.FC = () => {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [meetingExists, setMeetingExists] = useState<boolean | null>(null);
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const checkMeeting = async () => {
      if (!meetingId) return;

      try {
        const response = await fetch(`${API_URL}/api/meetings/${meetingId}`);
        setMeetingExists(response.ok);
      } catch (error) {
        console.error("Error checking meeting:", error);
        setMeetingExists(false);
      }
    };

    checkMeeting();
  }, [meetingId]);

  const handleJoinMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !meetingId) return;

    setIsLoading(true);
    try {
      const loginSuccess = await login(name.trim(), "guest");
      if (loginSuccess) {
        // Join the meeting
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_URL}/api/meetings/${meetingId}/join`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          navigate(`/meeting/${meetingId}`);
        } else {
          console.error("Failed to join meeting");
        }
      }
    } catch (error) {
      console.error("Error joining meeting:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (meetingExists === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking meeting...</p>
        </div>
      </div>
    );
  }

  if (!meetingExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg text-center">
          <div className="text-red-600">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Meeting Not Found
          </h1>
          <p className="text-gray-600">
            The meeting ID you're trying to join doesn't exist or has ended.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join Meeting
          </h1>
          <p className="text-gray-600">
            Meeting ID:{" "}
            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
              {meetingId}
            </span>
          </p>
        </div>

        <form onSubmit={handleJoinMeeting} className="space-y-6">
          <div>
            <label
              htmlFor="guestName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your Name
            </label>
            <input
              type="text"
              id="guestName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Joining Meeting...
              </div>
            ) : (
              "Join Meeting"
            )}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-green-600 hover:text-green-500"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestPage;
