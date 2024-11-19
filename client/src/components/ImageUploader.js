import React, { useState } from 'react';
import { Box, LinearProgress, Typography, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import axios from 'axios';

const ImageUploader = ({ setMyUploads }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [category, setCategory] = useState('Engagement Party'); // Default category

  const handleImageChange = async (event) => {
    const files = Array.from(event.target.files);
    for (const file of files) {
      await uploadImage(file);
    }
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const uploadImage = async (imageFile) => {
    const formData = new FormData();
    formData.append('files', imageFile);
    formData.append('category', category); // Add category to the formData

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
      
      {/* Category Dropdown */}
      <FormControl fullWidth>
        <InputLabel id="category-select-label">Category</InputLabel>
        <Select
          labelId="category-select-label"
          value={category}
          label="Category"
          onChange={handleCategoryChange}
        >
          <MenuItem value="Ceremony & Reception">Ceremony & Reception</MenuItem>
          <MenuItem value="Getting Ready">Getting Ready</MenuItem>
          <MenuItem value="Day Before">Day Before</MenuItem>
          <MenuItem value="Engagement Party">Engagement Party</MenuItem>
        </Select>
      </FormControl>

      {/* Hidden File Input */}
      <input type="file" accept="image/*" multiple hidden onChange={handleImageChange} />
    </Box>
  );
};

export default ImageUploader;
