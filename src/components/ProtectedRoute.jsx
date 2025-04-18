import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isTokenExpired, refreshAccessToken } from "../utils/auth";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Check if token is expired??
      if (isTokenExpired(token)) {
        try {
          // refresh the token
          await refreshAccessToken();
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Token refresh failed:", error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(true);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute; 