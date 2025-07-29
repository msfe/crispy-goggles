import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../config/authConfig";
import "./LoginForm.css";

const LoginForm = ({ showSignUp, setShowSignUp }) => {
  const { instance } = useMsal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    setError("");

    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error("Login failed:", error);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    // For now, redirect to Microsoft signup since that's our auth system
    handleMicrosoftLogin();
  };

  return (
    <div className="login-form-container">
      {/* Header Section */}
      <div className="login-form-header">
        <h2 className="login-form-title">
          Welcome Back
        </h2>
        <p className="login-form-subtitle">
          Connect with your privacy-focused community
        </p>
      </div>

      {/* Content Section */}
      <div className="login-form-content">
        {error && (
          <div className="login-form-error">
            {error}
          </div>
        )}

        {/* Primary Action */}
        <button
          onClick={handleMicrosoftLogin}
          disabled={loading}
          className="login-form-primary-button"
        >
          {/* Microsoft Icon */}
          <svg className="microsoft-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
          </svg>
          {loading ? "Connecting..." : "Continue with Microsoft"}
        </button>

        {/* Divider */}
        <div className="login-form-divider">
          <div className="login-form-divider-line">
            <span className="login-form-divider-text">
              New to Crispy Goggles?
            </span>
          </div>
        </div>

        {/* Secondary Action */}
        <button
          onClick={handleSignUp}
          disabled={loading}
          className="login-form-secondary-button"
        >
          Create Account
        </button>

        {/* Footer */}
        <div className="login-form-footer">
          <p className="login-form-footer-text">
            Secure authentication powered by Microsoft
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
