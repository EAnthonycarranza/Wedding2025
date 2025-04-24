// File: Navbar.js
import React, { useState, useEffect } from 'react';
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
import './Navbar.css';

export default function Navbar({ familyName, onLogout }) {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [accountAnchorEl, setAccountAnchorEl] = useState(null);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(window.pageYOffset);
  const [pulse, setPulse] = useState(false);
  const [hasRSVPData, setHasRSVPData] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(true);

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Pulse hamburger icon periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 1500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Hide/show navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.pageYOffset;
      if (currentY === 0) setShowNavbar(true);
      else if (currentY > lastScrollY) setShowNavbar(false);
      else setShowNavbar(true);
      setLastScrollY(currentY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Fetch RSVP data to determine if link should appear
  useEffect(() => {
    const fetchRSVP = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('/api/rsvp', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.mongoData?.familyMembers?.length > 0) {
          setHasRSVPData(true);
        }
      } catch (err) {
        console.error('RSVP fetch error:', err);
      } finally {
        setRsvpLoading(false);
      }
    };
    fetchRSVP();
  }, []);

  const handleMenuClick = (e) => setMenuAnchorEl(e.currentTarget);
  const handleMenuClose = () => setMenuAnchorEl(null);
  const handleAccountMenuClick = (e) => setAccountAnchorEl(e.currentTarget);
  const handleAccountMenuClose = () => setAccountAnchorEl(null);
  const handleMenuItemClick = (path) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(path);
    setMenuAnchorEl(null);
  };
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
          {/* Mobile: show hamburger icon */}
          {isMobile ? (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={handleMenuClick}
              className={pulse ? 'pulse' : ''}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            // Desktop: show nav links
            <Box sx={{ display: 'flex', flexGrow: 1, fontFamily: "'Sacramento', cursive" }}>
              <Typography
                variant="h6"
                component="div"
                onClick={() => handleMenuItemClick('/home')}
                sx={{
                  cursor: 'pointer', marginRight: '20px', padding: '10px 20px',
                  fontFamily: "'Sacramento', cursive", fontSize: '26px', fontWeight: '500',
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                  borderRadius: '15px', '&:hover': { backgroundColor: '#6f6f6f33' },
                }}
              >Home</Typography>
              <Typography
                variant="h6"
                component="div"
                onClick={() => handleMenuItemClick('/about')}
                sx={{
                  cursor: 'pointer', marginRight: '20px', padding: '10px 20px',
                  fontFamily: "'Sacramento', cursive", fontSize: '26px', fontWeight: '500',
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                  borderRadius: '15px', '&:hover': { backgroundColor: '#6f6f6f33' },
                }}
              >Story</Typography>
              <Typography
                variant="h6"
                component="div"
                onClick={() => handleMenuItemClick('/gallery')}
                sx={{
                  cursor: 'pointer', marginRight: '20px', padding: '10px 20px',
                  fontFamily: "'Sacramento', cursive", fontSize: '26px', fontWeight: '500',
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                  borderRadius: '15px', '&:hover': { backgroundColor: '#6f6f6f33' },
                }}
              >Gallery</Typography>
              <Typography
                variant="h6"
                component="div"
                onClick={() => handleMenuItemClick('/tour')}
                sx={{
                  cursor: 'pointer', marginRight: '20px', padding: '10px 20px',
                  fontFamily: "'Sacramento', cursive", fontSize: '26px', fontWeight: '500',
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                  borderRadius: '15px', '&:hover': { backgroundColor: '#6f6f6f33' },
                }}
              >Travel</Typography>
              {hasRSVPData && (
                <Typography
                  variant="h6"
                  component="div"
                  onClick={() => handleMenuItemClick('/rsvp')}
                  sx={{
                    cursor: 'pointer', marginRight: '20px', padding: '10px 20px',
                    fontFamily: "'Sacramento', cursive", fontSize: '26px', fontWeight: '500',
                    transition: 'background-color 0.3s ease, color 0.3s ease',
                    borderRadius: '15px', '&:hover': { backgroundColor: '#6f6f6f33' },
                  }}
                >RSVP</Typography>
              )}
              <Typography
                variant="h6"
                component="div"
                onClick={() => handleMenuItemClick('/registry')}
                sx={{
                  cursor: 'pointer', marginRight: '20px', padding: '10px 20px',
                  fontFamily: "'Sacramento', cursive", fontSize: '26px', fontWeight: '500',
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                  borderRadius: '15px', '&:hover': { backgroundColor: '#6f6f6f33' },
                }}
              >Registry</Typography>
            </Box>
          )}

          {/* Welcome & Account */}
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
              sx={{ transition: 'background-color 0.3s ease', '&:hover': { backgroundColor: '#6f6f6f33' } }}
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
              PaperProps={{
                sx: {
                  width: '100%',
                  bgcolor: 'rgba(50, 50, 50, 0.53)',
                  borderRadius: 0,
                  mt: '56px',
                  boxShadow: 'none',
                  backdropFilter: 'blur(8px)',
                },
              }}
              MenuListProps={{ sx: { p: 0 } }}
            >
              <MenuItem
                onClick={() => handleMenuItemClick('/home')}
                sx={{
                  fontFamily: "'Sacramento', cursive",
                  fontSize: '20px',
                  justifyContent: 'center',
                  py: 2,
                  borderBottom: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >Home</MenuItem>
              <MenuItem
                onClick={() => handleMenuItemClick('/about')}
                sx={{
                  fontFamily: "'Sacramento', cursive",
                  fontSize: '20px',
                  justifyContent: 'center',
                  py: 2,
                  borderBottom: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >Story</MenuItem>
              <MenuItem
                onClick={() => handleMenuItemClick('/gallery')}
                sx={{
                  fontFamily: "'Sacramento', cursive",
                  fontSize: '20px',
                  justifyContent: 'center',
                  py: 2,
                  borderBottom: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >Gallery</MenuItem>
              <MenuItem
                onClick={() => handleMenuItemClick('/tour')}
                sx={{
                  fontFamily: "'Sacramento', cursive",
                  fontSize: '20px',
                  justifyContent: 'center',
                  py: 2,
                  borderBottom: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >Travel</MenuItem>
              {hasRSVPData && (
                <MenuItem
                  onClick={() => handleMenuItemClick('/rsvp')}
                  sx={{
                    fontFamily: "'Sacramento', cursive",
                    fontSize: '20px',
                    justifyContent: 'center',
                    py: 2,
                    borderBottom: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                >RSVP</MenuItem>
              )}
              <MenuItem
                onClick={() => handleMenuItemClick('/registry')}
                sx={{
                  fontFamily: "'Sacramento', cursive",
                  fontSize: '20px',
                  justifyContent: 'center',
                  py: 2,
                  color: '#fff',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >Registry</MenuItem>
            </Menu>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
