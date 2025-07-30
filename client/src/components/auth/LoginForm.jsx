import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../config/authConfig";
import "./LoginForm.css";

const LoginForm = ({ showSignUp, setShowSignUp }) => {
  const { instance } = useMsal();
  const [microsoftLoading, setMicrosoftLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMicrosoftLogin = async () => {
    setMicrosoftLoading(true);
    setError("");

    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error("Microsoft login failed:", error);
      setError("Microsoft login failed. Please try again.");
    } finally {
      setMicrosoftLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");

    try {
      // Use the same MSAL flow but with domain_hint for Google
      const googleLoginRequest = {
        ...loginRequest,
        extraQueryParameters: {
          domain_hint: "google.com"
        }
      };
      await instance.loginRedirect(googleLoginRequest);
    } catch (error) {
      console.error("Google login failed:", error);
      // Provide more specific error message for Google login
      if (error.message?.includes("user_not_found") || error.message?.includes("AADB2C90087")) {
        setError("Google account not found. Please sign up first or contact support.");
      } else {
        setError("Google login failed. Please try again or use Microsoft login.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSignUp = () => {
    setShowSignUp(true);
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

        {/* Primary Actions */}
        <button
          onClick={handleMicrosoftLogin}
          disabled={microsoftLoading || googleLoading}
          className="login-form-primary-button"
        >
          {/* Microsoft Icon */}
          <svg className="microsoft-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
          </svg>
          {microsoftLoading ? "Connecting..." : "Continue with Microsoft"}
        </button>

        <button
          onClick={handleGoogleLogin}
          disabled={microsoftLoading || googleLoading}
          className="login-form-google-button"
        >
          {/* Google Icon - White version for colored background */}
          <svg className="google-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="white"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white"/>
          </svg>
          {googleLoading ? "Connecting..." : "Continue with Google"}
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
          disabled={microsoftLoading || googleLoading}
          className="login-form-secondary-button"
        >
          Create Account
        </button>

        {/* Footer */}
        <div className="login-form-footer">
          <p className="login-form-footer-text">
            Secure authentication powered by Microsoft Entra
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
