import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../config/authConfig";

const SignupForm = ({ onBackToLogin }) => {
  const { instance } = useMsal();
  const [microsoftLoading, setMicrosoftLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMicrosoftSignup = async () => {
    setMicrosoftLoading(true);
    setError("");

    try {
      // Use signup flow with Microsoft
      const microsoftSignupRequest = {
        ...loginRequest,
        extraQueryParameters: {
          prompt: "create" // This hints to create a new account
        }
      };
      await instance.loginRedirect(microsoftSignupRequest);
    } catch (error) {
      console.error("Microsoft signup failed:", error);
      setError("Microsoft signup failed. Please try again.");
    } finally {
      setMicrosoftLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setError("");

    try {
      // Use signup flow with Google
      const googleSignupRequest = {
        ...loginRequest,
        extraQueryParameters: {
          domain_hint: "google.com",
          prompt: "create" // This hints to create a new account
        }
      };
      await instance.loginRedirect(googleSignupRequest);
    } catch (error) {
      console.error("Google signup failed:", error);
      setError("Google signup failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        padding: "0",
        borderRadius: "20px",
        background: "linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)",
        boxShadow: "0 20px 40px rgba(168, 97, 186, 0.1), 0 8px 16px rgba(0, 0, 0, 0.05)",
        overflow: "hidden",
        border: "1px solid rgba(200, 162, 200, 0.2)",
      }}
    >
      {/* Header Section */}
      <div style={{
        background: "linear-gradient(135deg, #a861ba 0%, #c8a2c8 100%)",
        padding: "40px 40px 30px",
        textAlign: "center",
        position: "relative",
      }}>
        <h2 style={{ 
          color: "white",
          fontSize: "28px",
          fontWeight: "700",
          margin: "0 0 8px",
          fontFamily: "Helvetica Neue, Arial, sans-serif",
          letterSpacing: "-0.5px"
        }}>Create Account</h2>
        <p style={{
          color: "rgba(255, 255, 255, 0.9)",
          fontSize: "16px",
          margin: "0",
          fontWeight: "400",
          lineHeight: "1.4",
        }}>Join your privacy-focused community</p>
      </div>

      {/* Content Section */}
      <div style={{ padding: "40px" }}>
        {error && (
          <div
            style={{
              color: "#d32f2f",
              marginBottom: "24px",
              padding: "16px",
              backgroundColor: "#ffebee",
              border: "1px solid #ffcdd2",
              borderRadius: "12px",
              fontSize: "14px",
              lineHeight: "1.5",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* Microsoft Signup Button */}
        <button
          onClick={handleMicrosoftSignup}
          disabled={microsoftLoading || googleLoading}
          style={{
            width: "100%",
            padding: "18px 24px",
            backgroundColor: "#4ecca3",
            color: "white",
            border: "none",
            borderRadius: "14px",
            fontSize: "18px",
            fontWeight: "600",
            cursor: (microsoftLoading || googleLoading) ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            lineHeight: "1.4",
            outline: "none",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            boxShadow: "0 8px 20px rgba(78, 204, 163, 0.3)",
            fontFamily: "Helvetica Neue, Arial, sans-serif",
            letterSpacing: "0.2px",
            opacity: (microsoftLoading || googleLoading) ? 0.7 : 1,
          }}
        >
          {/* Microsoft Icon */}
          <svg style={{ width: "20px", height: "20px", fill: "white" }} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
          </svg>
          {microsoftLoading ? "Creating..." : "Sign up with Microsoft"}
        </button>

        {/* Google Signup Button */}
        <button
          onClick={handleGoogleSignup}
          disabled={microsoftLoading || googleLoading}
          style={{
            width: "100%",
            padding: "18px 24px",
            backgroundColor: "#c8a2c8",
            color: "white",
            border: "none",
            borderRadius: "14px",
            fontSize: "18px",
            fontWeight: "600",
            cursor: (microsoftLoading || googleLoading) ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            lineHeight: "1.4",
            outline: "none",
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            boxShadow: "0 8px 20px rgba(200, 162, 200, 0.3)",
            fontFamily: "Helvetica Neue, Arial, sans-serif",
            letterSpacing: "0.2px",
            opacity: (microsoftLoading || googleLoading) ? 0.7 : 1,
          }}
        >
          {/* Google Icon - White version */}
          <svg style={{ width: "20px", height: "20px" }} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="white"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white"/>
          </svg>
          {googleLoading ? "Creating..." : "Sign up with Google"}
        </button>

        {/* Back to Login */}
        <button
          onClick={onBackToLogin}
          disabled={microsoftLoading || googleLoading}
          style={{
            width: "100%",
            padding: "16px 24px",
            backgroundColor: "transparent",
            color: "#a861ba",
            border: "2px solid #a861ba",
            borderRadius: "14px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: (microsoftLoading || googleLoading) ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            lineHeight: "1.4",
            outline: "none",
            fontFamily: "Helvetica Neue, Arial, sans-serif",
            letterSpacing: "0.2px",
            opacity: (microsoftLoading || googleLoading) ? 0.7 : 1,
          }}
        >
          Back to Sign In
        </button>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <p style={{
            color: "#b0b0b0",
            fontSize: "14px",
            margin: "0",
            lineHeight: "1.5",
          }}>
            Secure authentication powered by Microsoft Entra
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
