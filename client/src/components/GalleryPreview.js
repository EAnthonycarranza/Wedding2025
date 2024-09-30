// GalleryPreview.js

import React from 'react';
import { Box, Grid, Checkbox } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckIcon from '@mui/icons-material/Check';

const GalleryPreview = ({
  images,
  checkedImages,
  handleSelectImage,
  handleOpenLightbox,
}) => {
  return (
    <Box
      sx={{
        padding: 2,
        maxWidth: '700px',
        margin: '0 auto',
      }}
    >
      <Grid container spacing={1} justifyContent="center">
        {(images || []).map((imageUrl, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            key={index}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: '335px',
                height: '300px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                borderRadius: '10px',
                overflow: 'hidden',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '&:hover .unselectedCheckbox': {
                  opacity: 1,
                  transition: 'opacity 0.5s ease-in-out',
                },
              }}
            >
              <img
                src={imageUrl}
                alt={`Gallery image ${index}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  cursor: 'pointer',
                }}
                onClick={() => handleOpenLightbox(index)}
              />
              <Checkbox
                icon={<CheckCircleOutlineIcon sx={{ fontSize: 50 }} />}
                checkedIcon={<CheckIcon sx={{ fontSize: 50, color: 'white' }} />}
                checked={checkedImages.includes(imageUrl)}
                onChange={() => handleSelectImage(imageUrl)}
                onClick={(e) => e.stopPropagation()}
                disableRipple
                sx={{
                  position: 'absolute',
                  bottom: 10,
                  left: 10,
                  zIndex: 10,
                  backgroundColor: checkedImages.includes(imageUrl)
                    ? '#5A5BFF'
                    : 'transparent',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '5px',
                  opacity: checkedImages.includes(imageUrl) ? 1 : 0,
                  transition: checkedImages.includes(imageUrl)
                    ? 'none'
                    : 'opacity 0.5s ease-in-out',
                  display: 'block',
                  '&:hover': {
                    backgroundColor: checkedImages.includes(imageUrl)
                      ? '#5A5BFF'
                      : 'transparent',
                  },
                }}
                className={
                  !checkedImages.includes(imageUrl)
                    ? 'unselectedCheckbox'
                    : ''
                }
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default GalleryPreview;
