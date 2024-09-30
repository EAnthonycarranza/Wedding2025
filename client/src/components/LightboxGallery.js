// LightboxGallery.js

import React from 'react';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import { IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';
import { saveAs } from 'file-saver';

const LightboxGallery = ({
  isOpen,
  images,
  photoIndex,
  handleCloseLightbox,
  handleNext,
  handlePrev,
}) => {
  const handleDownloadCurrent = async () => {
    try {
      const imageUrl = images[photoIndex];
      const response = await axios.get(imageUrl, { responseType: 'blob' });
      const blob = new Blob([response.data], {
        type: response.headers['content-type'],
      });
      saveAs(blob, `Image-${photoIndex + 1}.jpg`);
    } catch (error) {
      console.error('Error downloading image', error);
    }
  };

  return isOpen && images.length > 0 ? (
    <Lightbox
      mainSrc={images[photoIndex]}
      nextSrc={images[(photoIndex + 1) % images.length]}
      prevSrc={images[(photoIndex + images.length - 1) % images.length]}
      onCloseRequest={handleCloseLightbox}
      onMoveNextRequest={handleNext}
      onMovePrevRequest={handlePrev}
      toolbarButtons={[
        <IconButton
          key="download"
          onClick={handleDownloadCurrent}
          sx={{ color: '#fff', marginRight: 2 }}
        >
          <DownloadIcon sx={{ fontSize: 30, color: '#fff' }} />
        </IconButton>,
      ]}
      clickOutsideToClose={false}
      reactModalProps={{
        shouldCloseOnEsc: false,
        style: {
          overlay: {
            backgroundColor: '#000',
            zIndex: 1300,
          },
          content: {
            backgroundColor: '#000',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
          },
        },
      }}
    />
  ) : null;
};

export default LightboxGallery;
