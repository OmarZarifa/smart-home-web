import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import logo from '../assets/logo.png';
import '../components/styles.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/user/login", formData);

      if (response.data.error) {
        setError(response.data.error.message);
        setLoading(false);
        return;
      }

      const accessToken = response.data.data.accessToken;

      // Save the accesToken
      localStorage.setItem("accessToken", accessToken);

      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      // Clear any existing errors
      setError("");
      
      // Redirect to dashboard page
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.error?.message || "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <header className="login-logo-wrapper">
        <img src={logo} alt="Logo" className="login-custom-size" />
        <h1 className="login-logo-custom-text ">HomeSync</h1>
      </header>

      <div className="login-center-screen">
        <div className="login-custom-login-box">
          <h2 className="login-custom-title">LOGIN</h2>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="Username"
              required
              value={formData.username}
              onChange={handleChange}
              className="login-custom-input"
            />
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
              className="login-custom-input"
            />

            <button
              type="submit"
              disabled={loading}
              className="login-custom-button"
            >
              {loading ? "Signing in..." : "LOGIN"}
            </button>

            <hr className="border-black" />

            <p className="login-custom-text-style">
              Don’t have an account?{" "}
              <a
                href="/register"
                className="login-custom-link"
              >
                Sign up
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
