import React, { useState } from 'react';
import { useIsAuthenticated } from '@azure/msal-react';
import logo from './logo-custom.svg';
import './App.css';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import Dashboard from './components/dashboard/Dashboard';

function App() {
  const isAuthenticated = useIsAuthenticated();
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="Crispy Goggles logo" />
        <h1 className="App-title">Crispy Goggles</h1>
        <p className="App-subtitle">Privacy-focused social networking platform</p>
        
        <div className="App-auth-buttons">
          <button
            onClick={() => setAuthMode('login')}
            className={`App-auth-button App-auth-button--signin ${authMode === 'login' ? 'active' : 'App-auth-button--inactive'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setAuthMode('signup')}
            className={`App-auth-button App-auth-button--signup ${authMode === 'signup' ? 'active' : 'App-auth-button--inactive'}`}
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
