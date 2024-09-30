// TabsSection.js
import React from "react";
import { Box, Grid, Typography, Tabs, Tab, Checkbox, IconButton } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const TabsSection = ({ tabValue, setTabValue, cloudImages, myUploads, handleSelectImage, checkedImages, handleOpenLightbox }) => {

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Tabs value={tabValue} onChange={handleTabChange} centered>
        <Tab label="Gallery" />
        <Tab label="My Uploads" />
      </Tabs>

      {tabValue === 0 && (
        <Box sx={{ padding: 2 }}>
          <Typography variant="h5" sx={{ marginBottom: "10px", textAlign: "center" }}>
            Gallery
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {cloudImages.map((imageUrl, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img
                    src={imageUrl}
                    alt={`Gallery image ${index}`}
                    style={{ width: "100%", height: "auto", cursor: "pointer" }}
                    onClick={() => handleOpenLightbox(index)}
                  />
                  <Checkbox
                    icon={<CheckCircleOutlineIcon sx={{ fontSize: 50 }} />}
                    checkedIcon={<CheckCircleIcon sx={{ fontSize: 50, color: "blue" }} />}
                    checked={checkedImages.includes(imageUrl)}
                    onChange={() => handleSelectImage(imageUrl)}
                    sx={{ position: 'absolute', bottom: 10, left: 10, zIndex: 10 }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {tabValue === 1 && (
        <Box sx={{ padding: 2 }}>
          <Typography variant="h5" sx={{ marginBottom: "10px", textAlign: "center" }}>
            My Uploads
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {myUploads.map((imageUrl, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img
                    src={imageUrl}
                    alt={`User upload ${index}`}
                    style={{ width: "100%", height: "auto", cursor: "pointer" }}
                    onClick={() => handleOpenLightbox(index)}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      backgroundColor: 'white',
                      color: 'gray',
                    }}
                  >
                      <VisibilityOffIcon />
                  </IconButton>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default TabsSection;
