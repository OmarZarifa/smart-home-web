import axios from "axios";
import { refreshAccessToken } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor to add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
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
      localStorage.setItem("accessToken", newToken);
      originalRequest.headers["Authorization"] = `${newToken}`;
      return axios(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("accessToken");

      if (window.location.pathname !== '/login') {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    }
  }
);


export default axiosInstance; 