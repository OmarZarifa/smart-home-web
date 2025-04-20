import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  RiDashboardLine,
  RiFileListLine,
  RiQuestionLine,
  RiMicLine,
  RiUserLine,
  RiMenuLine,
  RiLogoutBoxLine,
} from "react-icons/ri";
import { logout } from "../utils/auth";
import logo from '../assets/logo.png';
import { useTheme } from "../context/ThemeContext";

const navItems = [
  {
    id: 1,
    path: "/dashboard",
    label: "Dashboard",
    icon: <RiDashboardLine size={24} />,
  },
  {
    id: 2,
    path: "/voice-recognition",
    label: "Voice Control",
    icon: <RiMicLine size={24} />,
  },
  {
    id: 3,
    path: "/logs",
    label: "Logs",
    icon: <RiFileListLine size={24} />,
  },
  {
    id: 4,
    path: "/profile",
    label: "Profile",
    icon: <RiUserLine size={24} />,
  },
  {
    id: 5,
    path: "/help",
    label: "Help Center",
    icon: <RiQuestionLine size={24} />,
  },
];

function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const location = useLocation();
  const { isDarkMode } = useTheme();

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
  };

  return (
    <aside
      className={`${
        isSidebarOpen ? "w-64" : "w-20"
      } bg-[#dddfd6] dark:bg-gray-900 shadow-md transition-all duration-300 fixed h-full z-10`}
    >
      <div className="flex flex-col h-full">
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center">
              <img src={logo} alt='' className="w-12 h-12 mr-3" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white" style={{ fontFamily: 'Tenor Sans' }}>HomeSync</h2>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/20 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-800 dark:text-white"
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <RiMenuLine size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors
                    ${
                      location.pathname === item.path
                        ? "bg-white/30 dark:bg-gray-800 text-gray-800 dark:text-white"
                        : "text-gray-600 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-gray-800"
                    }`}
                  title={!isSidebarOpen ? item.label : undefined}
                >
                  {item.icon}
                  {isSidebarOpen && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
            title={!isSidebarOpen ? "Logout" : undefined}
          >
            <RiLogoutBoxLine size={24} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
export { navItems };
