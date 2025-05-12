import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import logo from '../assets/logo.png';

export default function Register() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
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

        const password = formData.password;
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength) {
            setError(`Password must be at least ${minLength} characters long to meet security standards.`);
            setLoading(false);
            return;
        }
        if (!hasUpperCase) {
            setError("Password must include at least one uppercase letter.");
            setLoading(false);
            return;
        }
        if (!hasLowerCase) {
            setError("Password must include at least one lowercase letter.");
            setLoading(false);
            return;
        }
        if (!hasNumbers) {
            setError("Password must include at least one numeric digit.");
            setLoading(false);
            return;
        }
        if (!hasSpecialChar) {
            setError("Password must include at least one special character.");
            setLoading(false);
            return;
        }


        try {
            console.log('Attempting registration with:', formData);
            const response = await axiosInstance.post("/user/register", formData);
            console.log('Registration response:', response);
            
            if (response.data.error) {
                setError(response.data.error.message);
                setLoading(false);
                return;
            }

            console.log('Registration successful, navigating to /login');
            navigate("/login");
        } catch (err) {
            console.log('Full error object:', err);
            console.log('Error response data:', err.response?.data);
            console.log('Error status:', err.response?.status);
            
            // Handle 401 specifically
            if (err.response?.status === 401) {
                setError("This username or email is already registered. Please try a different one.");
            } else {
                // Handle other errors
                const errorMessage = err.response?.data?.error?.message || 
                                   err.response?.data?.message || 
                                   "An error occurred during registration. Please try again.";
                setError(errorMessage);
            }
            setLoading(false);
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
                    <h2 className="login-custom-title">REGISTER</h2>
                    <form className="space-y-8" onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className="login-custom-input"
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="login-custom-input"
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="login-custom-input"
                            />
                        </div>
                        {error && <div className="login-custom-error">{error}</div>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="login-custom-button"
                        >
                            {loading ? "Creating Account..." : "CREATE ACCOUNT"}
                        </button>
                        <hr className="border-black" />
                        <p className="login-custom-text-style">
                            Already have an account?{" "}
                            <a
                                href="/login"
                                className="login-custom-link">
                                Login
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
