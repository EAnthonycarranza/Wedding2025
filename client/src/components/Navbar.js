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
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
  const [accountAnchorEl, setAccountAnchorEl] = React.useState(null);
  const [showNavbar, setShowNavbar] = useState(true); // State to control visibility of navbar
  const [lastScrollY, setLastScrollY] = useState(window.pageYOffset); // Track the last Y scroll position
  const navigate = useNavigate();
  const theme = useTheme();

  // Media query to detect if the screen is a mobile screen
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  // Navigate to selected route and close menu
  const handleMenuItemClick = (path) => {
    navigate(path);
    setMenuAnchorEl(null); // Close menu
  };

  // Handle logout and close account menu
  const handleLogout = () => {
    onLogout();
    navigate('/'); // Redirect to welcome page
    setAccountAnchorEl(null); // Close account menu
  };

  // Handle scrolling behavior: show navbar on scroll up, hide on scroll down
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.pageYOffset;

      if (currentScrollY > lastScrollY) {
        setShowNavbar(false); // Hide navbar on scroll down
      } else {
        setShowNavbar(true); // Show navbar on scroll up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Apply "navbar" class and "navbar-hidden" if showNavbar is false */}
      <AppBar
        position="fixed"
        className={`navbar ${showNavbar ? 'navbar-visible' : 'navbar-hidden'}`}
        sx={{ backgroundColor: '#33333378', transition: 'transform 0.5s ease-in-out' }}
      >
        <Toolbar sx={{ fontFamily: "'Sacramento', cursive" }}>
          {/* Show Hamburger Menu only on Mobile */}
          {isMobile ? (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={handleMenuClick} // Open navigation menu
            >
              <MenuIcon />
            </IconButton>
          ) : (
            // Show text-based menu on desktop
            <Box sx={{ display: 'flex', flexGrow: 1, fontFamily: "'Sacramento', cursive" }}>
              <Typography
                variant="h6"
                component="div"
                onClick={() => navigate('/home')}
                sx={{
                  cursor: 'pointer',
                  marginRight: '40px',
                  fontFamily: "'Sacramento', cursive",
                  fontSize: '24px',
                  '&:hover': {
                    backgroundColor: 'rgba(156, 0, 68, 0.1)',
                    borderRadius: '20px',
                  },
                }}
              >
                Home
              </Typography>
              <Typography
                variant="h6"
                component="div"
                onClick={() => navigate('/about')}
                sx={{
                  cursor: 'pointer',
                  marginRight: '40px',
                  fontFamily: "'Sacramento', cursive",
                  fontSize: '24px',
                  '&:hover': {
                    backgroundColor: 'rgba(156, 0, 68, 0.1)',
                    borderRadius: '20px',
                  },
                }}
              >
                Story
              </Typography>
              <Typography
                variant="h6"
                component="div"
                onClick={() => navigate('/gallery')}
                sx={{
                  cursor: 'pointer',
                  marginRight: '40px',
                  fontFamily: "'Sacramento', cursive",
                  fontSize: '24px',
                  '&:hover': {
                    backgroundColor: 'rgba(156, 0, 68, 0.1)',
                    borderRadius: '20px',
                  },
                }}
              >
                Gallery
              </Typography>
              <Typography
                variant="h6"
                component="div"
                onClick={() => navigate('/rsvp')}
                sx={{
                  cursor: 'pointer',
                  marginRight: '40px',
                  fontFamily: "'Sacramento', cursive",
                  fontSize: '24px',
                  '&:hover': {
                    backgroundColor: 'rgba(156, 0, 68, 0.1)',
                    borderRadius: '10px',
                  },
                }}
              >
                RSVP
              </Typography>
            </Box>
          )}

          {/* Display Welcome Message */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              textAlign: 'right',
              marginRight: '20px',
              fontFamily: "'Sacramento', cursive",
              fontSize: '24px',
              color: '#fff', // White text color
            }}
          >
            Welcome {familyName}
          </Typography>

          {/* Account Circle Icon for Logout */}
          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="account-menu-appbar"
              aria-haspopup="true"
              onClick={handleAccountMenuClick} // Open account menu
              color="inherit"
              sx={{
                transition: 'background-color 0.3s ease', // Smooth transition
                '&:hover': {
                  backgroundColor: 'rgba(156, 0, 68, 0.1)', // Add hover effect for the profile icon
                },
              }}
            >
              <AccountCircle />
            </IconButton>

            {/* Menu for Account Actions */}
            <Menu
              id="account-menu-appbar"
              anchorEl={accountAnchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(accountAnchorEl)}
              onClose={handleAccountMenuClose} // Close account menu
            >
              {/* Logout Option */}
              <MenuItem onClick={handleLogout} sx={{ fontFamily: "'Sacramento', cursive" }}>
                Logout
              </MenuItem>
            </Menu>
          </div>

          {/* Navigation Menu for Mobile (Hamburger Menu) */}
          {isMobile && (
            <Menu
              id="menu-appbar"
              anchorEl={menuAnchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
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
                  '&:hover': {
                    backgroundColor: 'rgba(156, 0, 68, 0.1)',
                    color: 'rgb(156 0 68)',
                  },
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
                  '&:hover': {
                    backgroundColor: 'rgba(156, 0, 68, 0.1)',
                    color: 'rgb(156 0 68)',
                  },
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
                  '&:hover': {
                    backgroundColor: 'rgba(156, 0, 68, 0.1)',
                    color: 'rgb(156 0 68)',
                  },
                }}
              >
                Gallery
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
                  '&:hover': {
                    backgroundColor: 'rgba(156, 0, 68, 0.1)',
                    color: 'rgb(156 0 68)',
                  },
                }}
              >
                RSVP
              </MenuItem>
            </Menu>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
