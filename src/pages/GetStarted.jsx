import React from "react";
import { useNavigate } from "react-router-dom";
import "../components/styles.css"; // Include styles
import logo from '../assets/logo.png';

export default function GetStarted() {
    const navigate = useNavigate();

    return (
        <div className="get-started-container">
            <header className="login-logo-wrapper">
                <img src={logo} alt="Logo" className="login-custom-size" />
                <h1 className="login-logo-custom-text ">HomeSync</h1>
            </header>
            <div className="overlay">

                <h1 className="get-started-title">Where Comfort Meets Accessibility</h1>
                <button
                    className="get-started-button"
                    onClick={() => navigate("/register")}
                >
                    Get Started →
                </button>
            </div>
        </div>
    );
}
