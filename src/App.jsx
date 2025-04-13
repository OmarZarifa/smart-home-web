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
import VoiceRecognition from "./pages/VoiceRecognition";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Help from "./pages/Help";
import Logs from "./pages/Logs";


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
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main Layout */}
        <Route
          path="/*"
          element={
            <div className="sidebar">
              {/* Sidebar */}
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

              {/* Main Content */}
              <main
                className={`flex-1 transition-all duration-300 ${
                  isSidebarOpen ? "ml-64" : "ml-20"
                }`}
              >
                <Header />
                <div className="header">
                  <Routes>
                    <Route
                      path="/"
                      element={<Navigate to="/dashboard" replace />}
                    />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route
                      path="/voice-recognition"
                      element={<VoiceRecognition />}
                    />
                    <Route path="/logs" element={<Logs />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/help" element={<Help />} />
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
