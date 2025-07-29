import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { signupRequest } from '../../config/authConfig';

const SignupForm = () => {
  const { instance } = useMsal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    setLoading(true);
    setError('');
    
    try {
      await instance.loginPopup(signupRequest);
    } catch (error) {
      console.error('Signup failed:', error);
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '0 auto', 
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Sign Up</h2>
      
      {error && (
        <div style={{ 
          color: 'red', 
          marginBottom: '15px',
          padding: '10px',
          backgroundColor: '#ffebee',
          border: '1px solid #e57373',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}
      
      <button
        onClick={handleSignup}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#107c10',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? 'Creating account...' : 'Create Microsoft Account'}
      </button>
      
      <p style={{ 
        textAlign: 'center', 
        marginTop: '15px', 
        fontSize: '14px',
        color: '#666'
      }}>
        Already have an account? Use the Sign In button to login.
      </p>
    </div>
  );
};

export default SignupForm;