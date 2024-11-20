import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoginPage, { Email, Submit, Title, Logo, Banner, Password, Welcome, ButtonAfter } from '@react-login-page/page3';
import defaultBannerImage from '../img/Untitled.jpg';

const containerStyles = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  fontFamily: "'Sacramento', cursive",
};

const formStyles = {
  fontFamily: "'Sacramento', cursive",
  color: '#fff',
};

const largeTextStyles = {
  fontSize: '25px',
  textAlign: 'center',
  marginBottom: '20px',
};

const titleStyles = {
  fontFamily: "'Sacramento', cursive",
  fontSize: '3rem',
  textAlign: 'center',
  color: '#333',
};

const buttonStyles = {
  backgroundColor: 'rgb(0 0 0)',
  color: '#fff',
  border: 'none',
  padding: '10px 20px',
  fontSize: '16px',
  borderRadius: '20px',
  cursor: 'pointer',
};

const customLoginStyles = {
  '--login-bg': '#f3f2f2',
  '--login-color': '#333',
  '--login-inner-bg': '#fff',
  '--login-banner-bg': '#fbfbfb',
  '--login-input': '#333',
  '--login-input-icon': '#dddddd',
  '--login-input-bg': 'transparent',
  '--login-input-border': 'rgba(0, 0, 0, 0.13)',
  '--login-input-placeholder': '#999999',
  borderRadius: '20px',
};

const Welcomepg = ({ setIsAuthenticated, setFamilyName }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Authenticate the password and get family name from the server
      const response = await axios.post('/authenticate', { password });

      // Store the JWT token in localStorage
      const token = response.data.token;
      localStorage.setItem('token', token);

      // Get the family name from the server response
      const familyName = response.data.familyName;

      // Set the family name and authentication state
      setIsAuthenticated(true);
      setFamilyName(familyName);

      // Force the page to reload to trigger logic in App.js
      window.location.reload(); // Refresh the page after successful login
    } catch (error) {
      setError(error.response ? error.response.data.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyles}>
      <form onSubmit={handleSubmit} style={formStyles}>
        <LoginPage style={{ height: 580, ...customLoginStyles }}>
          <Logo visible={false} />
          <Title style={{fontFamily: "'Sacramento', cursive",  fontSize: '25px'}}> Welcome! </Title>
          <Welcome style={largeTextStyles}>Enter your given passcode</Welcome>
          <Email visible={false} />
          <Password
            label="Password"
            type="password"
            placeholder="Enter your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Submit style={buttonStyles}>{loading ? "Logging in..." : "Log In"}</Submit>
          <ButtonAfter visible={false} />
          <Banner style={{ backgroundImage: `url(${defaultBannerImage})`, backgroundSize: 'cover' }} />
          {error && <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
        </LoginPage>
      </form>
    </div>
  );
};

export default Welcomepg;
