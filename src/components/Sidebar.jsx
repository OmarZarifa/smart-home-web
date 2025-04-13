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

import logo from '../assets/logo.png';


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

  return (
    <aside
      className={`${
        isSidebarOpen ? "w-64" : "w-20"
      } bg-white shadow-md transition-all duration-300 fixed h-full z-10`}
    >
      <div className="flex flex-col h-full" style={{ backgroundColor: '#dddfd6'}}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src={logo} alt='' style={{ width: '50px', height: '50px', marginRight: '10px' }}></img>
              <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Tenor Sans', margin: 0 }}>HomeSync</h2>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-800"
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <RiMenuLine size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4">
          <ul className="space-y-2" style={{ backgroundColor: '#dddfd6' }}>
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors
                    ${
                      location.pathname === item.path
                        ? "bg-zinc-900 text-gray-200"
                        : "text-gray-600 hover:bg-gray-50"
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

        <div className="p-4 border-t border-gray-200">
          <button
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors hover:bg-red-50"
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
