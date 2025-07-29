import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../config/authConfig";

const LoginForm = () => {
  const { instance } = useMsal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
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

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "0 auto",
        padding: "30px",
        border: "1px solid #c8a2c8",
        borderRadius: "12px",
        backgroundColor: "#c8a2c8",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h2 style={{ 
        textAlign: "center", 
        marginBottom: "25px", 
        color: "#333333",
        fontSize: "24px",
        fontWeight: "600",
        lineHeight: "1.5"
      }}>Login</h2>

      {error && (
        <div
          style={{
            color: "#d32f2f",
            marginBottom: "20px",
            padding: "12px",
            backgroundColor: "#ffebee",
            border: "1px solid #e57373",
            borderRadius: "6px",
            fontSize: "14px",
            lineHeight: "1.5",
          }}
        >
          {error}
        </div>
      )}

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          width: "100%",
          padding: "16px",
          backgroundColor: "#4ecca3",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "18px",
          fontWeight: "600",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
          transition: "all 0.2s ease",
          lineHeight: "1.5",
          outline: "none",
        }}
        onFocus={(e) => {
          e.target.style.boxShadow = "0 0 0 3px rgba(78, 204, 163, 0.3)";
        }}
        onBlur={(e) => {
          e.target.style.boxShadow = "none";
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.target.style.backgroundColor = "#45b893";
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.target.style.backgroundColor = "#4ecca3";
          }
        }}
      >
        {loading ? "Signing in..." : "Sign in with Microsoft"}
      </button>

      <p
        style={{
          textAlign: "center",
          marginTop: "20px",
          fontSize: "14px",
          color: "#333333",
          lineHeight: "1.5",
        }}
      >
        Don't have an account? Use the Sign Up button to create one.
      </p>
    </div>
  );
};

export default LoginForm;
