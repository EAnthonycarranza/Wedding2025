import React, { useState } from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // Make sure jwtDecode is imported correctly
import { Box, Typography } from '@mui/material';

const LoginPage = ({ onLoginSuccess }) => {
  const [error, setError] = useState(null);

  const handleLoginSuccess = async (response) => {
    try {
      const token = response.credential;

      // Decode the token to get user details including profile image
      const decodedToken = jwtDecode(token);

      // Extract user information (including profile picture from Google)
      const userProfile = {
        name: decodedToken.name,
        email: decodedToken.email,
        picture: decodedToken.picture, // This should have the profile picture URL
      };

      // Send the Google ID token to your backend for verification and get a JWT
      const res = await axios.post('/google-auth', { token });

      // Pass the user profile (including profile picture) back to App.js
      onLoginSuccess({ ...userProfile, token: res.data.token });

    } catch (err) {
      setError('Failed to login with Google. Please try again.');
      console.error(err);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f0f0',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h5" sx={{ mb: 3 }}>
        Login with your Google Account
      </Typography>
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={() => setError('Google Login Failed')}
      />
      {error && (
        <Typography variant="body1" color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default LoginPage;
