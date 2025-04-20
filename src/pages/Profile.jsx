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
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: "",
    email: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

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
      setEditData({
        username: response.data.data.username,
        email: response.data.data.email,
      });
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

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
    // Check if there are any changes
    const hasUsernameChanged = name === 'username' && value !== userData.username;
    const hasEmailChanged = name === 'email' && value !== userData.email;
    setHasChanges(hasUsernameChanged || hasEmailChanged);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const id = getUserIdFromToken();
      if (!id) {
        setError("Invalid session. Please login again.");
        return;
      }

      // Only include fields that have been changed
      const updateData = {};
      if (editData.username !== userData.username) updateData.username = editData.username;
      if (editData.email !== userData.email) updateData.email = editData.email;

      if (Object.keys(updateData).length === 0) {
        setLoading(false);
        return;
      }

      const response = await axiosInstance.patch(`/user/${id}`, updateData);
      
      if (response.data.error) {
        setError(response.data.error.message);
        return;
      }

      setUserData(response.data.data);
      setEditData({
        username: response.data.data.username,
        email: response.data.data.email,
      });
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setHasChanges(false);
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.error?.message || "Failed to update profile");
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
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md">
              {successMessage}
            </div>
          )}
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#dcdcd4] dark:text-gray-300">Username</label>
                <input
                  type="text"
                  name="username"
                  value={editData.username}
                  onChange={handleEditChange}
                  className="mt-1 block w-full px-3 py-2 bg-[#2a2f2e] dark:bg-gray-700 border border-gray-600 rounded-md text-[#dcdcd4] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#dcdcd4] dark:text-gray-300">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleEditChange}
                  className="mt-1 block w-full px-3 py-2 bg-[#2a2f2e] dark:bg-gray-700 border border-gray-600 rounded-md text-[#dcdcd4] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading || !hasChanges}
                  className={`flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-emerald-500 dark:to-teal-600 text-white rounded-md hover:from-indigo-600 hover:to-purple-700 dark:hover:from-emerald-600 dark:hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-emerald-500 transition-all duration-200 shadow-lg ${
                    !hasChanges ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditData({
                      username: userData.username,
                      email: userData.email,
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 text-white rounded-md hover:from-gray-500 hover:to-gray-600 dark:hover:from-gray-700 dark:hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-600 transition-all duration-200 shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
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
              <button
                onClick={() => setIsEditing(true)}
                className="w-full px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-emerald-500 dark:to-teal-600 text-white rounded-md hover:from-indigo-600 hover:to-purple-700 dark:hover:from-emerald-600 dark:hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-emerald-500 transition-all duration-200 shadow-lg"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
