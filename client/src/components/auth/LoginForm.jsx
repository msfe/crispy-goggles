import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../config/authConfig";

const LoginForm = ({ showSignUp, setShowSignUp }) => {
  const { instance } = useMsal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  const handleEmailLogin = (e) => {
    e.preventDefault();
    // For now, just redirect to Microsoft login since that's our current auth system
    // In the future, this could handle email/password authentication
    setError("Email/password login not implemented yet. Please use Microsoft sign-in.");
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

      <form onSubmit={handleEmailLogin} style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "16px" }}>
          <input
            type="email"
            placeholder="Email or phone number"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "16px",
              border: "1px solid #b0b0b0",
              borderRadius: "6px",
              backgroundColor: "#ffffff",
              color: "#333333",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#a861ba";
              e.target.style.boxShadow = "0 0 0 2px rgba(168, 97, 186, 0.2)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#b0b0b0";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "16px",
              border: "1px solid #b0b0b0",
              borderRadius: "6px",
              backgroundColor: "#ffffff",
              color: "#333333",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#a861ba";
              e.target.style.boxShadow = "0 0 0 2px rgba(168, 97, 186, 0.2)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#b0b0b0";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "16px",
            backgroundColor: "#a861ba",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "18px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s ease",
            lineHeight: "1.5",
            outline: "none",
            marginBottom: "16px",
          }}
          onFocus={(e) => {
            e.target.style.boxShadow = "0 0 0 3px rgba(168, 97, 186, 0.3)";
          }}
          onBlur={(e) => {
            e.target.style.boxShadow = "none";
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#9455a6";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#a861ba";
          }}
        >
          Sign In
        </button>
      </form>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setError("Password reset not implemented yet.");
          }}
          style={{
            color: "#4ecca3",
            fontSize: "14px",
            textDecoration: "none",
            lineHeight: "1.5",
          }}
          onMouseEnter={(e) => {
            e.target.style.textDecoration = "underline";
          }}
          onMouseLeave={(e) => {
            e.target.style.textDecoration = "none";
          }}
        >
          Forgot password?
        </a>
      </div>

      <button
        onClick={handleMicrosoftLogin}
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
          marginBottom: "20px",
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

      <div style={{ textAlign: "center" }}>
        <button
          onClick={() => setShowSignUp(!showSignUp)}
          style={{
            backgroundColor: "transparent",
            color: "#4ecca3",
            border: "none",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            textDecoration: "none",
            lineHeight: "1.5",
            outline: "none",
          }}
          onFocus={(e) => {
            e.target.style.textDecoration = "underline";
          }}
          onBlur={(e) => {
            e.target.style.textDecoration = "none";
          }}
          onMouseEnter={(e) => {
            e.target.style.textDecoration = "underline";
          }}
          onMouseLeave={(e) => {
            e.target.style.textDecoration = "none";
          }}
        >
          Create new account
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
