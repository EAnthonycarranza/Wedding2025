// Navbar.js
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import './Navbar.css'; // Import the CSS file for animation and other styles

export default function Navbar({ familyName, onLogout }) {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [accountAnchorEl, setAccountAnchorEl] = useState(null);
  const [showNavbar, setShowNavbar] = useState(true); // Controls navbar visibility
  const [lastScrollY, setLastScrollY] = useState(window.pageYOffset); // Track last scroll position
  const [pulse, setPulse] = useState(false); // Controls pulsing animation
  const navigate = useNavigate();
  const theme = useTheme();

  // Media query for mobile screen
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Trigger hamburger pulse periodically
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulse(true);
      // Remove the pulse class after animation completes (3 iterations x 0.5s = 1.5s)
      setTimeout(() => {
        setPulse(false);
      }, 1500);
    }, 5000); // Repeat every 5 seconds

    return () => clearInterval(pulseInterval);
  }, []);

  // Handle scroll event to hide/show navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.pageYOffset;
      if (currentScrollY === 0) {
        setShowNavbar(true);
      } else if (currentScrollY > lastScrollY) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Open navigation menu (hamburger menu)
  const handleMenuClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  // Close navigation menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Open account menu for logout
  const handleAccountMenuClick = (event) => {
    setAccountAnchorEl(event.currentTarget);
  };

  // Close account menu
  const handleAccountMenuClose = () => {
    setAccountAnchorEl(null);
  };

  // Handle navigation item click with smooth scroll
  const handleMenuItemClick = (path) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(path);
    setMenuAnchorEl(null);
  };

  // Handle logout and navigation
  const handleLogout = () => {
    onLogout();
    navigate('/');
    setAccountAnchorEl(null);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        className={`navbar ${showNavbar ? 'navbar-visible' : 'navbar-hidden'}`}
        sx={{ backgroundColor: '#33333378', transition: 'transform 0.5s ease-in-out' }}
      >
        <Toolbar sx={{ fontFamily: "'Sacramento', cursive" }}>
          {isMobile ? (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={handleMenuClick}
              className={pulse ? "pulse" : ""}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', flexGrow: 1, fontFamily: "'Sacramento', cursive" }}>
              <Typography
                variant="h6"
                component="div"
                onClick={() => handleMenuItemClick('/home')}
                sx={{
                  cursor: 'pointer',
                  marginRight: '20px',
                  padding: '10px 20px',
                  fontFamily: "'Sacramento', cursive",
                  fontSize: '26px',
                  fontWeight: '500',
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                  borderRadius: '15px',
                  '&:hover': { backgroundColor: '#6f6f6f33' },
                }}
              >
                Home
              </Typography>
              <Typography
                variant="h6"
                component="div"
                onClick={() => handleMenuItemClick('/about')}
                sx={{
                  cursor: 'pointer',
                  marginRight: '20px',
                  padding: '10px 20px',
                  fontFamily: "'Sacramento', cursive",
                  fontSize: '26px',
                  fontWeight: '500',
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                  borderRadius: '15px',
                  '&:hover': { backgroundColor: '#6f6f6f33' },
                }}
              >
                Story
              </Typography>
              <Typography
                variant="h6"
                component="div"
                onClick={() => handleMenuItemClick('/gallery')}
                sx={{
                  cursor: 'pointer',
                  marginRight: '20px',
                  padding: '10px 20px',
                  fontFamily: "'Sacramento', cursive",
                  fontSize: '26px',
                  fontWeight: '500',
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                  borderRadius: '15px',
                  '&:hover': { backgroundColor: '#6f6f6f33' },
                }}
              >
                Gallery
              </Typography>
              <Typography
                variant="h6"
                component="div"
                onClick={() => handleMenuItemClick('/tour')}
                sx={{
                  cursor: 'pointer',
                  marginRight: '20px',
                  padding: '10px 20px',
                  fontFamily: "'Sacramento', cursive",
                  fontSize: '26px',
                  fontWeight: '500',
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                  borderRadius: '15px',
                  '&:hover': { backgroundColor: '#6f6f6f33' },
                }}
              >
                Travel
              </Typography>
              <Typography
                variant="h6"
                component="div"
                onClick={() => handleMenuItemClick('/rsvp')}
                sx={{
                  cursor: 'pointer',
                  marginRight: '20px',
                  padding: '10px 20px',
                  fontFamily: "'Sacramento', cursive",
                  fontSize: '26px',
                  fontWeight: '500',
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                  borderRadius: '15px',
                  '&:hover': { backgroundColor: '#6f6f6f33' },
                }}
              >
                RSVP
              </Typography>
              <Typography
                variant="h6"
                component="div"
                onClick={() => handleMenuItemClick('/registry')}
                sx={{
                  cursor: 'pointer',
                  marginRight: '20px',
                  padding: '10px 20px',
                  fontFamily: "'Sacramento', cursive",
                  fontSize: '26px',
                  fontWeight: '500',
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                  borderRadius: '15px',
                  '&:hover': { backgroundColor: '#6f6f6f33' },
                }}
              >
                Registry
              </Typography>
            </Box>
          )}

          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              textAlign: 'right',
              marginRight: '20px',
              fontFamily: "'Sacramento', cursive",
              fontSize: '24px',
              color: '#fff',
            }}
          >
            Welcome {familyName}
          </Typography>

          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="account-menu-appbar"
              aria-haspopup="true"
              onClick={handleAccountMenuClick}
              color="inherit"
              sx={{
                transition: 'background-color 0.3s ease',
                '&:hover': { backgroundColor: '#6f6f6f33' },
              }}
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="account-menu-appbar"
              anchorEl={accountAnchorEl}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(accountAnchorEl)}
              onClose={handleAccountMenuClose}
            >
              <MenuItem onClick={handleLogout} sx={{ fontFamily: "'Sacramento', cursive" }}>
                Logout
              </MenuItem>
            </Menu>
          </div>

          {isMobile && (
            <Menu
              id="menu-appbar"
              anchorEl={menuAnchorEl}
              anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem
                onClick={() => handleMenuItemClick('/home')}
                sx={{
                  fontFamily: "'Sacramento', cursive",
                  marginRight: '40px',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                  '&:hover': { backgroundColor: '#6f6f6f33' },
                }}
              >
                Home
              </MenuItem>
              <MenuItem
                onClick={() => handleMenuItemClick('/about')}
                sx={{
                  fontFamily: "'Sacramento', cursive",
                  marginRight: '40px',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                  '&:hover': { backgroundColor: '#6f6f6f33' },
                }}
              >
                Story
              </MenuItem>
              <MenuItem
                onClick={() => handleMenuItemClick('/gallery')}
                sx={{
                  fontFamily: "'Sacramento', cursive",
                  marginRight: '40px',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                  '&:hover': { backgroundColor: '#6f6f6f33' },
                }}
              >
                Gallery
              </MenuItem>
              <MenuItem
                onClick={() => handleMenuItemClick('/tour')}
                sx={{
                  fontFamily: "'Sacramento', cursive",
                  marginRight: '40px',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                  '&:hover': { backgroundColor: '#6f6f6f33' },
                }}
              >
                Travel
              </MenuItem>
              <MenuItem
                onClick={() => handleMenuItemClick('/rsvp')}
                sx={{
                  fontFamily: "'Sacramento', cursive",
                  marginRight: '40px',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                  '&:hover': { backgroundColor: '#6f6f6f33' },
                }}
              >
                RSVP
              </MenuItem>
              <MenuItem
                onClick={() => handleMenuItemClick('/registry')}
                sx={{
                  fontFamily: "'Sacramento', cursive",
                  marginRight: '40px',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                  '&:hover': { backgroundColor: '#6f6f6f33' },
                }}
              >
                Registry
              </MenuItem>
            </Menu>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
