import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Tabs, Tab, Modal, Typography } from "@mui/material";
import { GoogleLogin, googleLogout } from '@react-oauth/google'; // Import Google OAuth components
import axios from "axios";
import GalleryTabs from "./GalleryTabs";
import LightboxGallery from "./LightboxGallery";
import BottomNavigationBar from "./BottomNavigationBar";
import DownloadIcon from '@mui/icons-material/Download';
import { saveAs } from "file-saver";
import GalleryPreview from './GalleryPreview';

const UploadPage = () => {
  // State variables
  const [selectedImages, setSelectedImages] = useState([]);
  const [isOpen, setIsOpen] = useState(false); // Lightbox open state
  const [photoIndex, setPhotoIndex] = useState(0);
  const [cloudImages, setCloudImages] = useState([]);
  const [myUploads, setMyUploads] = useState([]);
  const [bottomNavValue, setBottomNavValue] = useState('gallery');
  const [category, setCategory] = useState('Engagement Party'); // Default category
  const [profileImageUrl, setProfileImageUrl] = useState(null); // Store Google profile image
  const [isModalOpen, setIsModalOpen] = useState(true); // Modal state for forcing login
  const fileInputRef = useRef(null);

  // New state variables for view options and filters
  const [filterOption, setFilterOption] = useState('allUploads'); // For the dropdown menu
  const [enableMultiSelect, setEnableMultiSelect] = useState(false); // Multi-select mode
  const [sortBy, setSortBy] = useState('timeUploaded');
  const [orderBy, setOrderBy] = useState('newestFirst');
  const [setAsDefault, setSetAsDefault] = useState(false);

  // Combined images array
  const [allImages, setAllImages] = useState([]);

  // Handle category tab change
  const handleCategoryChange = (event, newValue) => {
    setCategory(newValue);
  };

// Ensure JWT token is sent with Axios requests
useEffect(() => {
const fetchImages = async () => {
  try {
    const token = localStorage.getItem('jwtToken');  // Retrieve the token from localStorage

    // Check if the token exists
    if (!token) {
      console.error("JWT token not found in localStorage");
      return;
    }

    const response = await axios.get("http://localhost:3001/get-cloud-images", {
      headers: {
        'Authorization': `Bearer ${token}`  // Send the token in Authorization header
      }
    });

    console.log("JWT Token sent in Axios request:", token);  // Log the token to confirm it is sent

    const fetchedImages = Array.isArray(response.data.images) ? response.data.images : [];
    setCloudImages(fetchedImages);
  } catch (error) {
    console.error("Error fetching cloud images", error);
    setCloudImages([]);
  }
};
  fetchImages();
}, []);

  // Update allImages whenever cloudImages or myUploads change
  useEffect(() => {
    setAllImages([...cloudImages, ...myUploads]);
  }, [cloudImages, myUploads]);

  // Derive filteredImages array based on filterOption, category, and sorting
  const filteredImages = React.useMemo(() => {
    let filteredImages = [];
  
    if (filterOption === 'justPhotos') {
      filteredImages = allImages.filter((img) => img.type === 'photo' && img.category === category);
    } else if (filterOption === 'justVideos') {
      filteredImages = allImages.filter((img) => img.type === 'video' && img.category === category);
    } else if (filterOption === 'myUploads') {
      filteredImages = myUploads.filter((img) => img.category === category);
    } else {
      filteredImages = allImages.filter((img) => img.category === category);
    }
  
    // Sort the images based on sortBy and orderBy
    filteredImages.sort((a, b) => {
      let dateA, dateB;
  
      if (sortBy === 'timeUploaded') {
        dateA = new Date(a.uploadedAt);
        dateB = new Date(b.uploadedAt);
      } else if (sortBy === 'timeTaken') {
        dateA = new Date(a.takenAt);
        dateB = new Date(b.takenAt);
      }
  
      return orderBy === 'newestFirst' ? dateB - dateA : dateA - dateB;
    });
  
    console.log("Filtered Images:", filteredImages); // Log the filtered and sorted images
    return filteredImages;
  }, [filterOption, sortBy, orderBy, allImages, myUploads, category]);
  

  // Refresh gallery
  const refreshGallery = () => {
    console.log('Refreshing gallery...');
    const fetchImages = async () => {
      try {
        const response = await axios.get("http://localhost:3001/get-cloud-images");
        const fetchedImages = Array.isArray(response.data.images) ? response.data.images : [];
        setCloudImages(fetchedImages);
      } catch (error) {
        console.error("Error fetching cloud images", error);
        setCloudImages([]);
      }
    };
    fetchImages();
  };

  // Apply filters
  const applyFilters = ({ sortBy, orderBy, setAsDefault }) => {
    setSortBy(sortBy);
    setOrderBy(orderBy);
    setSetAsDefault(setAsDefault);
    if (setAsDefault) {
      localStorage.setItem('gallerySortBy', sortBy);
      localStorage.setItem('galleryOrderBy', orderBy);
    }
  };

  // Handle Google Logout
  const handleLogout = () => {
    googleLogout(); // Perform Google logout
    setProfileImageUrl(null); // Clear profile image on logout
    console.log('User has logged out');
    setIsModalOpen(true); // Reopen login modal
  };

  // Handle Google login success
  const handleGoogleLoginSuccess = async (response) => {
    try {
      const token = response.credential;
    
      // Send the Google ID token to your backend for verification and get user info
      const res = await axios.post('http://localhost:3001/google-auth', { token });
    
      const { token: jwtToken, user } = res.data; // Extract the JWT token from the response
      
      // Log and store the JWT token
      console.log("JWT Token received from backend:", jwtToken);
      localStorage.setItem('jwtToken', jwtToken);  // Store the JWT token
    
      setProfileImageUrl(user.picture); // Set the profile image URL
      console.log('Google Login successful. Profile picture URL:', user.picture);
      setIsModalOpen(false); // Close the modal on successful login
    } catch (err) {
      console.error('Failed to login with Google', err);
    }
  };  

  // Handle file input change (uploads)
  const handleFileInputChange = (event) => {
    const files = Array.from(event.target.files);
    const uploadedImages = files.map(file => {
      return {
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'photo' : 'video',
        uploadedAt: new Date().toISOString(),
        takenAt: file.lastModifiedDate ? file.lastModifiedDate.toISOString() : new Date().toISOString(),
        category: category,
      };
    });

    setMyUploads((prevUploads) => [...prevUploads, ...uploadedImages]);
  };

  // Handle selecting/deselecting images
  const handleSelectImage = (image) => {
    setSelectedImages(prevSelectedImages =>
      prevSelectedImages.includes(image)
        ? prevSelectedImages.filter((img) => img !== image)
        : [...prevSelectedImages, image]
    );
  };

  // Handle open lightbox
  const handleOpenLightbox = (index) => {
    setPhotoIndex(index);
    setIsOpen(true);
  };

  // Handle close lightbox
  const handleCloseLightbox = () => {
    setIsOpen(false);
  };

  // Ensure photoIndex is valid when images change
  useEffect(() => {
    if (filteredImages.length > 0 && photoIndex >= filteredImages.length) {
      setPhotoIndex(0);
    }
  }, [filteredImages, photoIndex]);

  // Handle next and previous in lightbox
  const handleNext = () => {
    setPhotoIndex((photoIndex + 1) % filteredImages.length);
  };

  const handlePrev = () => {
    setPhotoIndex((photoIndex + filteredImages.length - 1) % filteredImages.length);
  };

  // Handle download selected images
  const handleDownloadSelected = async () => {
    for (let image of selectedImages) {
      try {
        const response = await axios.get(image.url, { responseType: 'blob' });
        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        saveAs(blob, `SelectedImage-${Date.now()}.jpg`);
      } catch (error) {
        console.error("Error downloading image", error);
      }
    }
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #86C6C1 100%)",
        minHeight: "100vh",
        paddingBottom: "80px",
      }}
    >
      {/* Modal for forcing user to log in */}
      <Modal open={isModalOpen} aria-labelledby="login-modal-title">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" component="h2" id="login-modal-title">
            Please sign in with Google to continue
          </Typography>

          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={() => console.error('Google Login Failed')}
          />
        </Box>
      </Modal>

      {/* Category Tabs */}
      <Tabs
        value={category}
        onChange={handleCategoryChange}
        centered
        sx={{ maxWidth: 700, margin: '0 auto', marginBottom: 2 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Ceremony & Reception" value="Ceremony & Reception" />
        <Tab label="Getting Ready" value="Getting Ready" />
        <Tab label="Day Before" value="Day Before" />
        <Tab label="Engagement Party" value="Engagement Party" />
      </Tabs>

      <GalleryTabs
        filterOption={filterOption}
        setFilterOption={setFilterOption}
        refreshGallery={refreshGallery}
        enableMultiSelect={enableMultiSelect}
        setEnableMultiSelect={setEnableMultiSelect}
        applyFilters={applyFilters}
        onLogout={handleLogout} // Pass logout handler to GalleryTabs
      />

      {/* Download Button for selected images */}
      {selectedImages.length > 0 && (
        <Box sx={{ position: 'absolute', top: 10, right: 20 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadSelected}
          >
            Download {selectedImages.length} Selected
          </Button>
        </Box>
      )}

      {/* Pass filteredImages to GalleryPreview */}
      <GalleryPreview
        images={filteredImages}
        checkedImages={selectedImages}
        handleSelectImage={handleSelectImage}
        handleOpenLightbox={handleOpenLightbox}
        enableMultiSelect={enableMultiSelect}
      />

      {/* Hidden file input for the upload process */}
      <input
        type="file"
        id="file-upload-input"
        accept="image/*,video/*"
        multiple
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileInputChange}
      />

      {/* Lightbox for viewing images */}
      {isOpen && filteredImages.length > 0 && (
        <LightboxGallery
          isOpen={isOpen}
          images={filteredImages}
          photoIndex={photoIndex}
          handleCloseLightbox={handleCloseLightbox}
          handleNext={handleNext}
          handlePrev={handlePrev}
        />
      )}

      {/* Pass file input ref, isOpen, and profileImageUrl to BottomNavigationBar */}
      <BottomNavigationBar 
        bottomNavValue={bottomNavValue}
        setBottomNavValue={setBottomNavValue}
        fileInputRef={fileInputRef}
        isOpen={isOpen}
        profileImageUrl={profileImageUrl} 
      />
    </Box>
  );
};

export default UploadPage;
