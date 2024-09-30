import React, { useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Box } from '@mui/material';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import VoicemailIcon from '@mui/icons-material/Voicemail';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'; // For the reminder icon

const BottomNavigationBar = ({
  bottomNavValue,
  setBottomNavValue,
  fileInputRef,
  isOpen,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Do not render the BottomNavigationBar when the lightbox is open
  if (isOpen) {
    return null;
  }

  const handleBottomNavChange = (event, newValue) => {
    if (newValue === 'more') {
      setShowMoreMenu(true);
    } else {
      setShowMoreMenu(false);
      setBottomNavValue(newValue);
    }

    // Trigger file input click for upload when the 'upload' button is clicked
    if (newValue === 'upload' && fileInputRef && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)',
        zIndex: 1000, // Decrease z-index
      }}
    >
      {!showMoreMenu ? (
        <BottomNavigation
          value={bottomNavValue}
          onChange={handleBottomNavChange}
          showLabels
          sx={{
            height: '60px',
            backgroundColor: 'white',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          <BottomNavigationAction
            label="Galleries"
            value="gallery"
            icon={<PhotoLibraryIcon sx={{ fontSize: 28 }} />}
            sx={{
              color: bottomNavValue === 'gallery' ? '#5B6ACF' : 'black',
            }}
          />
          <BottomNavigationAction
            label="Voicemail"
            value="voicemail"
            icon={<VoicemailIcon sx={{ fontSize: 28 }} />}
            sx={{
              color: bottomNavValue === 'voicemail' ? 'black' : 'black',
            }}
          />
          <BottomNavigationAction
            label="Upload"
            value="upload"
            icon={<AddCircleIcon sx={{ fontSize: 28 }} />}
            sx={{
              color: bottomNavValue === 'upload' ? 'black' : 'black',
            }}
          />
          <BottomNavigationAction
            label="More"
            value="more"
            icon={<MoreHorizIcon sx={{ fontSize: 28 }} />}
            sx={{
              color: 'black',
            }}
          />
        </BottomNavigation>
      ) : (
        <BottomNavigation
          onChange={handleBottomNavChange}
          showLabels
          sx={{
            height: '60px',
            backgroundColor: 'white',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          <BottomNavigationAction
            label="Go Back"
            value="back"
            icon={<ArrowBackIcon sx={{ fontSize: 28, color: '#5B6ACF' }} />}
            onClick={() => setShowMoreMenu(false)}
            sx={{
              color: '#5B6ACF',
            }}
          />
          <BottomNavigationAction
            label="Home"
            value="home"
            icon={<HomeIcon sx={{ fontSize: 28 }} />}
            sx={{
              color: 'black',
            }}
          />
          <BottomNavigationAction
            label="Reminder"
            value="reminder"
            icon={<NotificationsNoneIcon sx={{ fontSize: 28 }} />}
            sx={{
              color: 'black',
            }}
          />
        </BottomNavigation>
      )}
    </Box>
  );
};

export default BottomNavigationBar;
