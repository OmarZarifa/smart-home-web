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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Profile Information
          </h2>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <div className="mt-1 p-2 bg-gray-50 rounded-md">
                {userData.username}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 p-2 bg-gray-50 rounded-md">
                {userData.email}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
