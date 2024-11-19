import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardMedia, CardContent, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';

const AdminPhotos = () => {
  const [pendingImages, setPendingImages] = useState([]);

  useEffect(() => {
    fetchPendingImages();
  }, []);

  const fetchPendingImages = async () => {
    try {
      const response = await axios.get('http://localhost:3001/get-pending-images');
      setPendingImages(response.data.images);
    } catch (error) {
      console.error('Error fetching pending images', error);
    }
  };

  const handleApprove = async (imageId, category) => {
    try {
      await axios.post('http://localhost:3001/approve-image', { imageId, category });
      fetchPendingImages(); // Refresh the pending images list after approval
    } catch (error) {
      console.error('Error approving image', error);
    }
  };

  const handleReject = async (imageId) => {
    try {
      await axios.post('http://localhost:3001/reject-image', { imageId });
      fetchPendingImages(); // Refresh the pending images list after rejection
    } catch (error) {
      console.error('Error rejecting image', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Admin - Pending Photo Approvals
      </Typography>

      <Box display="flex" flexWrap="wrap" gap={4}>
        {pendingImages.map((image) => (
          <Card key={image._id} sx={{ width: 300 }}>
            <CardMedia
              component="img"
              height="200"
              image={image.url}
              alt="Pending Image"
            />
            <CardContent>
              <Typography variant="body2">Uploaded By: {image.uploader}</Typography>
              <Typography variant="body2">Category: {image.category}</Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="category-select-label">Update Category</InputLabel>
                <Select
                  labelId="category-select-label"
                  defaultValue={image.category}
                  label="Category"
                  onChange={(e) => handleApprove(image._id, e.target.value)}
                >
                  <MenuItem value="Ceremony & Reception">Ceremony & Reception</MenuItem>
                  <MenuItem value="Getting Ready">Getting Ready</MenuItem>
                  <MenuItem value="Day Before">Day Before</MenuItem>
                  <MenuItem value="Engagement Party">Engagement Party</MenuItem>
                </Select>
              </FormControl>
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Button variant="contained" color="primary" onClick={() => handleApprove(image._id, image.category)}>
                  Approve
                </Button>
                <Button variant="outlined" color="error" onClick={() => handleReject(image._id)}>
                  Reject
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default AdminPhotos;
