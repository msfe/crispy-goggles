import React from "react";
import { useMsal } from "@azure/msal-react";
import { extractUserInfo, logAccountInfo } from "../../utils/authUtils";

const UserProfile = () => {
  const { instance, accounts } = useMsal();
  const account = accounts[0];

  const handleLogout = () => {
    instance.logoutRedirect({
      postLogoutRedirectUri: "/",
      mainWindowRedirectUri: "/",
    });
  };

  if (!account) {
    return null;
  }

  // Log account info for debugging in development
  if (import.meta.env.DEV) {
    logAccountInfo(account);
  }

  // Extract user info using the utility function
  let userInfo;
  try {
    userInfo = extractUserInfo(account);
  } catch (error) {
    console.error('Failed to extract user info:', error);
    userInfo = {
      name: account.name || 'Unknown User',
      email: account.username || 'Unknown Email',
      userId: account.homeAccountId
    };
  }

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "0 auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#f0f8ff",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Welcome!</h2>

      <div style={{ marginBottom: "20px" }}>
        <p>
          <strong>Name:</strong> {userInfo.name}
        </p>
        <p>
          <strong>Email:</strong> {userInfo.email}
        </p>
        <p>
          <strong>Account ID:</strong> {account.homeAccountId}
        </p>
        {import.meta.env.DEV && (
          <p style={{ fontSize: "12px", color: "#666" }}>
            <strong>Debug - Username:</strong> {account.username}
          </p>
        )}
      </div>

      <button
        onClick={handleLogout}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#d13438",
          color: "white",
          border: "none",
          borderRadius: "4px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Sign Out
      </button>
    </div>
  );
};

export default UserProfile;
