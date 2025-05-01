import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Configure axios defaults
axios.defaults.withCredentials = true;

// logout
export const logout = async () => {
  try {
    // Call backend to invalidate refresh token cookie
    await axios.post(
      `${API_URL}/user/logout`,
      {},
      {
        withCredentials: true,
      }
    );

    // Remove access token from localStorage
    localStorage.removeItem("accessToken");

    // Redirect to login page
    window.location.href = "/login";
  } catch (error) {
    console.error("Logout failed:", error);
    // Even if the backend call fails, we should still clear local storage and redirect
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  }
};

// Function to refresh the access token
export const refreshAccessToken = async () => {
  try {
    const response = await axios.post(
      `${API_URL}/user/token`,
      {},
      {
        withCredentials: true,
      }
    );

    if (response.data.error) {
      throw new Error(response.data.error.message);
    }

    const newAccessToken = response.data.data.accessToken;
    localStorage.setItem("accessToken", newAccessToken);
    return newAccessToken;
  } catch (err) {
    console.error("Refresh token failed:", err);
    localStorage.removeItem("accessToken");
    // Only redirect if we're not already on the login page and not trying to login
    if (window.location.pathname !== '/login') {
      window.location.href = "/login";
    }
    throw err;
  }
};

// Function to check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

// Function to get the current token
export const getCurrentToken = () => {
  const token = localStorage.getItem("accessToken");
  if (!token || isTokenExpired(token)) {
    return null;
  }
  return token;
};

// Handle token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry if:
    // 1. It's not a 401 error
    // 2. We've already tried to refresh
    // 3. This is a login request (to prevent loops)
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url === '/user/login'
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newToken = await refreshAccessToken();
      originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
      return axios(originalRequest);
    } catch (refreshError) {
      // If refresh token fails, clear everything and redirect to login
      localStorage.removeItem("accessToken");
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    }
  }
);
