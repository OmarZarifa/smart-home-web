import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  RiDashboardLine,
  RiDeviceLine,
  RiHomeSmileLine,
  RiMicLine,
  RiUserLine,
  RiMenuLine,
  RiLogoutBoxLine,
} from "react-icons/ri";

const navItems = [
  {
    id: 1,
    path: "/dashboard",
    label: "Dashboard",
    icon: <RiDashboardLine size={24} />,
  },
  {
    id: 2,
    path: "/devices",
    label: "Devices",
    icon: <RiDeviceLine size={24} />,
  },
  {
    id: 3,
    path: "/rooms",
    label: "Rooms",
    icon: <RiHomeSmileLine size={24} />,
  },
  {
    id: 4,
    path: "/voice-recognition",
    label: "Voice Control",
    icon: <RiMicLine size={24} />,
  },
  {
    id: 5,
    path: "/profile",
    label: "Profile",
    icon: <RiUserLine size={24} />,
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
      <div className="flex flex-col h-full">
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <h2 className="text-xl font-bold text-gray-800">SmartHome</h2>
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
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors
                    ${
                      location.pathname === item.path
                        ? "bg-blue-50 text-blue-600"
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
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors text-red-600 hover:bg-red-50"
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
