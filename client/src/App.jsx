import React, { useState } from 'react';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import logo from './logo-custom.svg';
import './App.css';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import Dashboard from './components/dashboard/Dashboard';

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
    return <Dashboard />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="Crispy Goggles logo" />
        <h1 className="App-title">Crispy Goggles</h1>
        <p className="App-subtitle">Privacy-focused social networking platform</p>
        
        {showSignUp ? (
          <SignupForm onBackToLogin={() => setShowSignUp(false)} />
        ) : (
          <LoginForm showSignUp={showSignUp} setShowSignUp={setShowSignUp} />
        )}
        
        {/* Development Mode Button */}
        {import.meta.env.DEV && (
          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={() => setDevMode(true)}
              style={{
                backgroundColor: '#4ecca3',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              🚀 Continue in Dev Mode
            </button>
            <p style={{ fontSize: '14px', color: '#b0b0b0', marginTop: '8px' }}>
              For development and testing purposes
            </p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
