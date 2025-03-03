import React, { useState, useEffect } from "react";
import { navItems } from "./Sidebar";
import { RiSunLine, RiTimeLine, RiMapPinLine } from "react-icons/ri";

function Header({ activePage }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather] = useState({
    temp: "24°C",
    condition: "Sunny",
    location: "Kristianstad",
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-gradient-to-r from-white to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              {navItems.find((item) => item.id === activePage)?.label}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-gray-500 text-sm">
              <RiMapPinLine />
              <span>{weather.location}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center backdrop-blur-sm bg-white/30 shadow-sm border border-white/50 px-4 py-2 rounded-xl">
              <RiSunLine className="text-yellow-500 mr-2" size={20} />
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-gray-800">
                  {weather.temp}
                </span>
                <span className="text-xs text-gray-500">
                  {weather.condition}
                </span>
              </div>
            </div>

            <div className="flex items-center backdrop-blur-sm bg-white/30 shadow-sm border border-white/50 px-4 py-2 rounded-xl">
              <RiTimeLine className="text-blue-500 mr-2" size={20} />
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-gray-800">
                  {currentTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="text-xs text-gray-500">
                  {currentTime.toLocaleDateString([], {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
