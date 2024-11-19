import React, { useState } from 'react';
import axios from 'axios';
import { Box, Select, MenuItem, IconButton, FormControl, InputLabel } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExitToAppIcon from '@mui/icons-material/ExitToApp'; // Logout icon

const GalleryTabs = ({
  filterOption,
  setFilterOption,
  refreshGallery,
  enableMultiSelect,
  setEnableMultiSelect,
  applyFilters,
  setImages,
  onLogout, // Add the logout handler as a prop
}) => {
  const [viewOption, setViewOption] = useState(filterOption || 'allUploads');
  
  const handleViewChange = async (event) => {
    setViewOption(event.target.value);
    setFilterOption(event.target.value);
    try {
      const response = await axios.get(`http://localhost:3001/get-cloud-images`, {
        params: {
          filter: event.target.value,
        },
      });
      setImages(response.data.images);  // This will update the images in the parent component
    } catch (error) {
      console.error('Error fetching filtered images:', error);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center', // Center the tabs
        maxWidth: '700px',
        margin: '0 auto',
        padding: 1,
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      {/* Dropdown Menu */}
      <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
        <InputLabel id="view-select-label">View</InputLabel>
        <Select
          labelId="view-select-label"
          id="view-select"
          value={viewOption}
          onChange={handleViewChange}
          label="View"
        >
          <MenuItem value="justPhotos">Just Photos</MenuItem>
          <MenuItem value="justVideos">Just Videos</MenuItem>
          <MenuItem value="myUploads">My Uploads</MenuItem>
          <MenuItem value="allUploads">All Uploads</MenuItem>
        </Select>
      </FormControl>

      {/* Icons */}
      <IconButton onClick={refreshGallery}>
        <RefreshIcon />
      </IconButton>

      <IconButton onClick={() => setEnableMultiSelect((prev) => !prev)}>
        <SelectAllIcon color={enableMultiSelect ? 'primary' : 'inherit'} />
      </IconButton>

      <IconButton>
        <FilterListIcon />
      </IconButton>

      {/* Google Logout Icon */}
      <IconButton onClick={onLogout}>
        <ExitToAppIcon />
      </IconButton>
    </Box>
  );
};

export default GalleryTabs;
