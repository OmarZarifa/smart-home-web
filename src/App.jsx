import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Devices from "./pages/Devices";
import Rooms from "./pages/Rooms";
import VoiceRecognition from "./pages/VoiceRecognition";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <div className="min-h-screen bg-gray-100 flex">
              <aside
                className={`${
                  isSidebarOpen ? "w-64" : "w-20"
                } bg-white shadow-md transition-all duration-300 fixed h-full z-10`}
              >
                <Sidebar
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              </aside>
              <main
                className={`flex-1 transition-all duration-300 ${
                  isSidebarOpen ? "ml-64" : "ml-20"
                }`}
              >
                <Header />
                <div className="p-6">
                  <Routes>
                    <Route
                      path="/"
                      element={<Navigate to="/dashboard" replace />}
                    />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/devices" element={<Devices />} />
                    <Route path="/rooms" element={<Rooms />} />
                    <Route
                      path="/voice-recognition"
                      element={<VoiceRecognition />}
                    />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </div>
              </main>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
