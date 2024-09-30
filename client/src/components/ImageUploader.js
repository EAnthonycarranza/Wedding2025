import React, { useState } from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import axios from 'axios';
import { saveAs } from 'file-saver';

const ImageUploader = ({ setMyUploads }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageChange = async (event) => {
    const files = Array.from(event.target.files);
    for (const file of files) {
      await uploadImage(file);
    }
  };

  const uploadImage = async (imageFile) => {
    const formData = new FormData();
    formData.append('files', imageFile);
    setUploading(true);

    try {
      const response = await axios.post('http://localhost:3001/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      const newUpload = response.data.fileLinks[0];
      setMyUploads((prev) => [...prev, newUpload]);
    } catch (error) {
      console.error('Error uploading images', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Box>
      {uploading && (
        <Box sx={{ width: '100%', marginY: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="caption" textAlign="center">
            Uploading {uploadProgress}%...
          </Typography>
        </Box>
      )}
      <input type="file" accept="image/*" multiple hidden onChange={handleImageChange} />
    </Box>
  );
};

export default ImageUploader;
