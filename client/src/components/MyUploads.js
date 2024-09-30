import React from 'react';
import { Box, Grid, Typography, IconButton, Button } from '@mui/material';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleOutlineIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';

const MyUploads = ({ myUploads, selectedImages, handleOpenLightbox, handleSelectImage, handleDeleteSelected, handleDownloadSelected }) => {
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" sx={{ marginBottom: '10px', textAlign: 'center' }}>
        My Uploads
      </Typography>

      {/* Download and Delete Buttons for selected images */}
      {selectedImages.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2, gap: 2 }}>
          {/* Download Button */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadSelected}
          >
            Download {selectedImages.length} Selected
          </Button>

          {/* Delete Button */}
          <Button
            variant="contained"
            color="secondary"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteSelected}
          >
            Delete {selectedImages.length} Selected
          </Button>
        </Box>
      )}

      <Grid container spacing={2} justifyContent="center">
        {myUploads.map((imageUrl, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img
                src={imageUrl}
                alt={`User upload ${index}`}
                style={{ width: '100%', cursor: 'pointer' }}
                onClick={() => handleOpenLightbox(index)}
              />

              {/* Selection Checkbox */}
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 10,
                  left: 10,
                  color: 'white',
                  backgroundColor: selectedImages.includes(imageUrl) ? 'blue' : 'rgba(255, 255, 255, 0.5)',
                }}
                onClick={() => handleSelectImage(imageUrl)} // Select image on click
              >
                {selectedImages.includes(imageUrl) ? <CheckCircleIcon /> : <CheckCircleOutlineIcon />}
              </IconButton>

              {/* Private Image Visibility Icon */}
              <IconButton sx={{ position: 'absolute', top: 10, left: 10 }}>
                <VisibilityOffIcon />
              </IconButton>

              <Typography
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  textAlign: 'center',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                }}
              >
                Only you can see this image.
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MyUploads;
