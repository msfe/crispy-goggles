import React, { useState } from 'react';
import { useIsAuthenticated } from '@azure/msal-react';
import logo from './logo.svg';
import './App.css';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import Dashboard from './components/dashboard/Dashboard';

function App() {
  const isAuthenticated = useIsAuthenticated();
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  // Demo mode for showcase - remove this in production
  const [demoMode, setDemoMode] = useState(false); 

  if (isAuthenticated || demoMode) {
    return <Dashboard />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Crispy Goggles</h1>
        <p>Privacy-focused social networking platform</p>
        
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setAuthMode('login')}
            style={{
              marginRight: '10px',
              padding: '8px 16px',
              backgroundColor: authMode === 'login' ? '#0078d4' : '#e1e1e1',
              color: authMode === 'login' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setAuthMode('signup')}
            style={{
              marginRight: '10px',
              padding: '8px 16px',
              backgroundColor: authMode === 'signup' ? '#107c10' : '#e1e1e1',
              color: authMode === 'signup' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Sign Up
          </button>
          <button
            onClick={() => setDemoMode(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#a861ba',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            View Dashboard Demo
          </button>
        </div>
        
        {authMode === 'login' ? <LoginForm /> : <SignupForm />}
      </header>
    </div>
  );
}

export default App;
