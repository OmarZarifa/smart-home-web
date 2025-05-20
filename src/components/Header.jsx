import React, { useState, useEffect } from "react";
import { navItems } from "./Sidebar";
import {
  RiSunLine,
  RiTimeLine,
  RiMapPinLine,
  RiCloudyLine,
  RiSunCloudyLine,
  RiMoonLine,
} from "react-icons/ri";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";

function Header() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({
    temp: "--°C",
    condition: "Loading...",
    location: "Loading...",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // get user's location
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeatherData(latitude, longitude);
          },
          (error) => {
            console.error("Error getting location:", error);
            // default location
            fetchWeatherData(56.0294, 14.1567);
          }
        );
      } else {
        setError("Geolocation is not supported by your browser");
        // default location
        fetchWeatherData(56.0294, 14.1567);
      }
    };

    // fetch weather data
    const fetchWeatherData = async (lat, lon) => {
      try {
        const API_KEY = "ebb6301e717d4626977d36747f426f4f"
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`,
          {
            withCredentials: false
          }
        );
        const { main, weather: weatherData, name } = response.data;
        setWeather({
          temp: `${Math.round(main.temp)}°C`,
          condition: weatherData[0].main,
          location: name,
        });
      } catch (err) {
        console.error("Error fetching weather:", err);
        setError("Failed to fetch weather data");
      }
    };

    
    getUserLocation();

    // Refresh weather data every 30 minutes
    const weatherInterval = setInterval(() => {
      getUserLocation();
    }, 30 * 60 * 1000);

    return () => clearInterval(weatherInterval);
  }, []);

  // get weather icon based on condition
  const getWeatherIcon = (condition) => {
    switch (condition?.toLowerCase()) {
      case "clear":
        return <RiSunLine className="text-yellow-500" size={20} />;
      case "clouds":
        return <RiCloudyLine className="text-gray-500" size={20} />;
      case "rain":
      case "drizzle":
      case "thunderstorm":
        return <RiSunCloudyLine className="text-gray-500" size={20} />;
      default:
        return <RiSunLine className="text-yellow-500" size={20} />;
    }
  };

  return (
    <header style={{ backgroundColor: '#dddfd6', fontFamily: 'Tenor Sans'}}>
      <div className="max-w-7xl mx-auto px-6 py-8" style={{ backgroundColor: '#dddfd6'}}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300">
              {navItems.find((item) => item.path === window.location.pathname)
                ?.label || "Dashboard"}
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center backdrop-blur-sm bg-white/30 dark:bg-gray-800/30 shadow-sm border border-white/50 dark:border-gray-700/50 px-4 py-2 rounded-xl">
              <RiMapPinLine className="text-blue-500 dark:text-blue-400 mr-2" size={20} />
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {error ? "Location unavailable" : weather.location}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Current Location
                </span>
              </div>
            </div>

            <div className="flex items-center backdrop-blur-sm bg-white/30 dark:bg-gray-800/30 shadow-sm border border-white/50 dark:border-gray-700/50 px-4 py-2 rounded-xl">
              {getWeatherIcon(weather.condition)}
              <div className="flex flex-col ml-2">
                <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {weather.temp}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {weather.condition}
                </span>
              </div>
            </div>

            <div className="flex items-center backdrop-blur-sm bg-white/30 dark:bg-gray-800/30 shadow-sm border border-white/50 dark:border-gray-700/50 px-4 py-2 rounded-xl">
              <RiTimeLine className="text-blue-500 dark:text-blue-400 mr-2" size={20} />
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {currentTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {currentTime.toLocaleDateString([], {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center backdrop-blur-sm bg-white/30 dark:bg-gray-800/30 shadow-sm border border-white/50 dark:border-gray-700/50 px-4 py-2 rounded-xl">
              <button
                onClick={toggleDarkMode}
                className="flex flex-col items-center justify-center text-gray-800 dark:text-gray-200"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <>
                    <RiMoonLine className="text-gray-600 dark:text-gray-400" size={20} />
                    <span className="text-xs mt-1">Dark</span>
                  </>
                ) : (
                  <>
                    <RiSunLine className="text-yellow-500 dark:text-yellow-400" size={20} />
                    <span className="text-xs mt-1">Light</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
