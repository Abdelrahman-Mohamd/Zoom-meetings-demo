import React from "react";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Live Meetings
          </h1>
          <p className="text-gray-600">
            Connect with others through video calls
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/host"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
          >
            Host a Meeting
          </Link>

          <div className="text-center">
            <span className="text-gray-500">or</span>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="meetingId"
              className="block text-sm font-medium text-gray-700"
            >
              Join with Meeting ID
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="meetingId"
                placeholder="Enter meeting ID"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="button"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={() => {
                  const input = document.getElementById(
                    "meetingId"
                  ) as HTMLInputElement;
                  if (input.value.trim()) {
                    window.location.href = `/guest/${input.value.trim()}`;
                  }
                }}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
