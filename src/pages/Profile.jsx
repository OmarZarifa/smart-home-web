import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { refreshAccessToken, isTokenExpired } from "../utils/auth";

// get user ID from token
const getUserIdFromToken = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user_id;
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

export default function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    username: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError("Please login to access your profile.");
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        try {
          // refresh the token
          await refreshAccessToken();
          // After refresh, get the user ID
          const id = getUserIdFromToken();
          if (!id) {
            setError("Invalid session. Please login again.");
            return;
          }
          
          fetchUserData(id);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          setError("Session expired. Please login again.");
          localStorage.removeItem("accessToken");
        }
      } else {
        // Token is valid, get user ID
        const id = getUserIdFromToken();
        if (!id) {
          setError("Invalid session. Please login again.");
          return;
        }
        
        fetchUserData(id);
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchUserData = async (id) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/users/${id}`);
      if (response.data.error) {
        setError(response.data.error.message);
        return;
      }
      setUserData(response.data.data);
    } catch (err) {
      if (err.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("accessToken");
        setError("Session expired. Please login again.");
      } else {
        setError(err.response?.data?.error?.message || "Failed to fetch user data");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#76766b] dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#dcdcd4] dark:border-gray-100"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#76766b] dark:bg-gray-900">
        <div className="text-[#dcdcd4] text-center">
          <p>{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-4 py-2 bg-[#1c2120] text-[#dcdcd4] rounded-md hover:bg-[#2a2f2e] transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#76766b] dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <h2 className="text-center text-3xl font-extrabold text-[#dcdcd4] dark:text-white">
            Profile Information
          </h2>
        </div>
        <div className="bg-[#1c2120] dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#dcdcd4] dark:text-gray-300">Username</label>
              <div className="mt-1 p-2 bg-[#2a2f2e] dark:bg-gray-700 rounded-md text-[#dcdcd4] dark:text-white">
                {userData.username}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#dcdcd4] dark:text-gray-300">Email</label>
              <div className="mt-1 p-2 bg-[#2a2f2e] dark:bg-gray-700 rounded-md text-[#dcdcd4] dark:text-white">
                {userData.email}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
