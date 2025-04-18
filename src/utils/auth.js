import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Configure axios defaults
axios.defaults.withCredentials = true;

// logout
export const logout = async () => {
  try {
    localStorage.removeItem("accessToken");
      
    // Redirect to login page
    window.location.href = "/login";
  } catch (error) {
    console.error("Logout failed:", error);
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
    window.location.href = "/login";
    throw err;
  }
};

// Function to check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
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

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
); 