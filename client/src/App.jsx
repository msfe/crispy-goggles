import React, { useState } from 'react';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import logo from './logo-custom.svg';
import './App.css';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import Dashboard from './components/dashboard/Dashboard';
import { AlertProvider, AlertContainer } from './components/Alert';

function App() {
  const isAuthenticated = useIsAuthenticated();
  const { accounts } = useMsal();
  const [showSignUp, setShowSignUp] = useState(false);
  const [devMode, setDevMode] = useState(false);

  // Debug logging in development
  if (import.meta.env.DEV) {
    console.log('App render - isAuthenticated:', isAuthenticated);
    console.log('App render - accounts:', accounts);
  }

  if (isAuthenticated || devMode) {
    return (
      <AlertProvider>
        <Dashboard />
        <AlertContainer />
      </AlertProvider>
    );
  }

  return (
    <AlertProvider>
      <div className="App">
        <div className="App-container">
          {/* Left Panel - Branding and Welcome */}
          <div className="App-left-panel">
            <div className="App-branding">
              <img src={logo} className="App-logo" alt="Crispy Goggles logo" />
              <h1 className="App-title">Crispy Goggles</h1>
              <p className="App-subtitle">Join a Privacy-First Social Network</p>
              <p className="App-description">
                Crispy Goggles is your privacy-first social network. Connect with friends, join interest-based groups, and explore events—all while keeping your data safe. Discover a community that values your privacy.
              </p>
            </div>
          </div>

          {/* Right Panel - Authentication */}
          <div className="App-right-panel">
            <div className="App-auth-container">
              {showSignUp ? (
                <SignupForm onBackToLogin={() => setShowSignUp(false)} />
              ) : (
                <LoginForm showSignUp={showSignUp} setShowSignUp={setShowSignUp} />
              )}
            </div>
            {/* Development Mode Toggle */}
            {import.meta.env.DEV && (
              <div className="DevMode-toggle">
                <button onClick={() => setDevMode(!devMode)}>
                  {devMode ? 'Disable Dev Mode' : 'Enable Dev Mode'}
                </button>
              </div>
            )}
          </div>
        </div>
        <AlertContainer />
      </div>
    </AlertProvider>
  );
}

export default App;
