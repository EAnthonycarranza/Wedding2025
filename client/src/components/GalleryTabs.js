// GalleryTabs.js

import React, { useState } from 'react';
import {
  Box,
  Select,
  MenuItem,
  IconButton,
  Modal,
  Typography,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Slider,
  Button,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import FilterListIcon from '@mui/icons-material/FilterList';

const GalleryTabs = ({
  filterOption,
  setFilterOption,
  refreshGallery,
  enableMultiSelect,
  setEnableMultiSelect,
  applyFilters,
}) => {
  // State for the dropdown menu
  const [viewOption, setViewOption] = useState('allUploads');

  // State for the filter modal
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('timeUploaded');
  const [orderBy, setOrderBy] = useState('newestFirst');
  const [setAsDefault, setSetAsDefault] = useState(false);

  const handleViewChange = (event) => {
    setViewOption(event.target.value);
    // You can add logic here to filter the gallery based on the selected view
    setFilterOption(event.target.value);
  };

  const handleRefresh = () => {
    refreshGallery();
  };

  const handleMultiSelectToggle = () => {
    setEnableMultiSelect((prev) => !prev);
  };

  const handleFilterModalOpen = () => {
    setIsFilterModalOpen(true);
  };

  const handleFilterModalClose = () => {
    setIsFilterModalOpen(false);
  };

  const handleApplyFilters = () => {
    applyFilters({ sortBy, orderBy, setAsDefault });
    setIsFilterModalOpen(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: 1,
        borderBottom: 1,
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
      <IconButton onClick={handleRefresh}>
        <RefreshIcon />
      </IconButton>

      <IconButton onClick={handleMultiSelectToggle}>
        <SelectAllIcon color={enableMultiSelect ? 'primary' : 'inherit'} />
      </IconButton>

      <IconButton onClick={handleFilterModalOpen}>
        <FilterListIcon />
      </IconButton>

      {/* Filter Modal */}
      <Modal
        open={isFilterModalOpen}
        onClose={handleFilterModalClose}
        aria-labelledby="filter-modal-title"
        aria-describedby="filter-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 300,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="filter-modal-title" variant="h6" component="h2">
            Filter Options
          </Typography>

          {/* Sort By Dropdown */}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="sort-by-label">Sort By</InputLabel>
            <Select
              labelId="sort-by-label"
              id="sort-by-select"
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="timeUploaded">Time Uploaded</MenuItem>
              <MenuItem value="timeTaken">Time Taken</MenuItem>
            </Select>
          </FormControl>

          {/* Order By Dropdown */}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="order-by-label">Order By</InputLabel>
            <Select
              labelId="order-by-label"
              id="order-by-select"
              value={orderBy}
              label="Order By"
              onChange={(e) => setOrderBy(e.target.value)}
            >
              <MenuItem value="newestFirst">Newest First</MenuItem>
              <MenuItem value="oldestFirst">Oldest First</MenuItem>
            </Select>
          </FormControl>

          {/* Set as Default Switch */}
          <FormControlLabel
            control={
              <Switch
                checked={setAsDefault}
                onChange={(e) => setSetAsDefault(e.target.checked)}
                color="primary"
              />
            }
            label="Set as Default"
            sx={{ mt: 2 }}
          />

          {/* Apply and Cancel Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button onClick={handleFilterModalClose} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleApplyFilters}>
              Apply
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default GalleryTabs;
