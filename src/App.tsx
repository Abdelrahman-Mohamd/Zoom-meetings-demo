import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
import HostPage from "./pages/HostPage";
import GuestPage from "./pages/GuestPage";
import MeetingRoom from "./pages/MeetingRoom";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/host" element={<HostPage />} />
            <Route path="/guest/:meetingId" element={<GuestPage />} />
            <Route path="/meeting/:meetingId" element={<MeetingRoom />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
