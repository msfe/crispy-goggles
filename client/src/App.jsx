import React, { useState } from 'react';
import { useIsAuthenticated } from '@azure/msal-react';
import logo from './logo.svg';
import './App.css';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import UserProfile from './components/auth/UserProfile';

function App() {
  const isAuthenticated = useIsAuthenticated();
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  if (isAuthenticated) {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1>Crispy Goggles</h1>
          <p>Welcome to your privacy-focused social networking platform!</p>
          <UserProfile />
        </header>
      </div>
    );
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
        </div>
        
        {authMode === 'login' ? <LoginForm /> : <SignupForm />}
      </header>
    </div>
  );
}

export default App;
