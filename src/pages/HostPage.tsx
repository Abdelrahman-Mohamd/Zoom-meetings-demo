import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { API_URL } from "../config/api";

const HostPage: React.FC = () => {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleStartMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const loginSuccess = await login(name.trim(), "host");
      if (loginSuccess) {
        // Create a new meeting
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/meetings`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const { meetingId } = await response.json();
          navigate(`/meeting/${meetingId}`);
        } else {
          console.error("Failed to create meeting");
        }
      }
    } catch (error) {
      console.error("Error starting meeting:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Host a Meeting
          </h1>
          <p className="text-gray-600">
            Enter your name to start a new meeting
          </p>
        </div>

        <form onSubmit={handleStartMeeting} className="space-y-6">
          <div>
            <label
              htmlFor="hostName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your Name
            </label>
            <input
              type="text"
              id="hostName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Starting Meeting...
              </div>
            ) : (
              "Start Meeting"
            )}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostPage;
