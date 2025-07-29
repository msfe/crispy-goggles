import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../config/authConfig";

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
    <div
      style={{
        maxWidth: "420px",
        margin: "40px auto 0",
        padding: "0",
        borderRadius: "20px",
        background: "linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)",
        boxShadow: "0 20px 40px rgba(168, 97, 186, 0.1), 0 8px 16px rgba(0, 0, 0, 0.05)",
        overflow: "hidden",
        border: "1px solid rgba(200, 162, 200, 0.2)",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #a861ba 0%, #c8a2c8 100%)",
          padding: "40px 40px 30px",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
            border: "2px solid rgba(255, 255, 255, 0.2)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "30px",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "rgba(78, 204, 163, 0.3)",
          }}
        />
        
        <h2
          style={{
            color: "white",
            fontSize: "28px",
            fontWeight: "700",
            margin: "0 0 8px",
            fontFamily: "Helvetica Neue, Arial, sans-serif",
            letterSpacing: "-0.5px",
          }}
        >
          Welcome Back
        </h2>
        <p
          style={{
            color: "rgba(255, 255, 255, 0.9)",
            fontSize: "16px",
            margin: "0",
            fontWeight: "400",
            lineHeight: "1.4",
          }}
        >
          Connect with your privacy-focused community
        </p>
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

        {/* Primary Action */}
        <button
          onClick={handleMicrosoftLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "18px 24px",
            backgroundColor: "#4ecca3",
            color: "white",
            border: "none",
            borderRadius: "14px",
            fontSize: "18px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition: "all 0.3s ease",
            lineHeight: "1.4",
            outline: "none",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            boxShadow: "0 8px 20px rgba(78, 204, 163, 0.3)",
            fontFamily: "Helvetica Neue, Arial, sans-serif",
            letterSpacing: "0.2px",
          }}
          onFocus={(e) => {
            e.target.style.boxShadow = "0 8px 20px rgba(78, 204, 163, 0.4), 0 0 0 3px rgba(78, 204, 163, 0.2)";
          }}
          onBlur={(e) => {
            e.target.style.boxShadow = "0 8px 20px rgba(78, 204, 163, 0.3)";
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = "#45b893";
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 12px 28px rgba(78, 204, 163, 0.4)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = "#4ecca3";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 8px 20px rgba(78, 204, 163, 0.3)";
            }
          }}
        >
          {/* Microsoft Icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
          </svg>
          {loading ? "Connecting..." : "Continue with Microsoft"}
        </button>

        {/* Divider */}
        <div style={{ textAlign: "center", margin: "32px 0" }}>
          <div
            style={{
              height: "1px",
              background: "linear-gradient(90deg, transparent 0%, #b0b0b0 50%, transparent 100%)",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "-10px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#f5f5f5",
                padding: "0 16px",
                color: "#b0b0b0",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              New to Crispy Goggles?
            </span>
          </div>
        </div>

        {/* Secondary Action */}
        <button
          onClick={handleSignUp}
          disabled={loading}
          style={{
            width: "100%",
            padding: "16px 24px",
            backgroundColor: "transparent",
            color: "#a861ba",
            border: "2px solid #a861ba",
            borderRadius: "14px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition: "all 0.3s ease",
            lineHeight: "1.4",
            outline: "none",
            fontFamily: "Helvetica Neue, Arial, sans-serif",
            letterSpacing: "0.2px",
          }}
          onFocus={(e) => {
            e.target.style.boxShadow = "0 0 0 3px rgba(168, 97, 186, 0.2)";
          }}
          onBlur={(e) => {
            e.target.style.boxShadow = "none";
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = "#a861ba";
              e.target.style.color = "white";
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 8px 20px rgba(168, 97, 186, 0.25)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "#a861ba";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }
          }}
        >
          Create Account
        </button>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <p
            style={{
              color: "#b0b0b0",
              fontSize: "14px",
              margin: "0",
              lineHeight: "1.5",
            }}
          >
            Secure authentication powered by Microsoft
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
