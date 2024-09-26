import React, { useState, useEffect } from "react";
import { Box, Button, Grid, Typography, CircularProgress, Checkbox, BottomNavigation, BottomNavigationAction, IconButton, LinearProgress, Tabs, Tab } from "@mui/material";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import VoicemailIcon from "@mui/icons-material/Voicemail";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleOutlineIcon from '@mui/icons-material/RadioButtonUnchecked'; // Empty circle for unselected
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Filled circle with check for selected
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'; // Eye crossed icon
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css"; // Lightbox styles
import axios from "axios";
import { saveAs } from "file-saver"; // Import file-saver for downloading images

const UploadPage = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [cloudImages, setCloudImages] = useState([]); // All images in the gallery
  const [myUploads, setMyUploads] = useState([]); // User's own uploads (starts empty)
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bottomNavValue, setBottomNavValue] = useState('gallery'); // Tracks which bottom nav is selected
  const [checkedImages, setCheckedImages] = useState([]); // Tracks the images that are selected
  const [tabValue, setTabValue] = useState(0); // Track which tab is selected
  const [lightboxImages, setLightboxImages] = useState([]); // Dynamic lightbox images for the current tab

  // Fetch existing images from Google Cloud Storage (for gallery)
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get("http://localhost:3001/get-cloud-images");
        setCloudImages(response.data.images); // Gallery gets all images
      } catch (error) {
        console.error("Error fetching cloud images", error);
      }
    };
    fetchImages();
  }, []);

  // Handle image selection from the file system and trigger automatic upload
  const handleImageChange = async (event) => {
    const files = Array.from(event.target.files);
    const updatedImages = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    // Automatically upload selected images and add them to the "My Uploads" tab
    setSelectedImages(updatedImages);

    for (const image of updatedImages) {
      await uploadImage(image.file);
    }
  };

  // Upload the image to Google Cloud Storage with progress tracking
  const uploadImage = async (imageFile) => {
    const formData = new FormData();
    formData.append("files", imageFile);

    setUploading(true); // Start uploading state

    try {
      const response = await axios.post("http://localhost:3001/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress); // Set the progress based on the event
        },
      });

      // Once the image is uploaded, add it to "My Uploads"
      const newUpload = response.data.fileLinks[0]; // Assuming the first image uploaded
      setMyUploads((prev) => [...prev, newUpload]);
      setUploadProgress(0); // Reset progress bar once upload is done
    } catch (error) {
      console.error("Error uploading images", error);
    } finally {
      setUploading(false); // End uploading state
    }
  };

  // Handle individual image selection/deselection
  const handleSelectImage = (imageUrl) => {
    setCheckedImages((prevCheckedImages) =>
      prevCheckedImages.includes(imageUrl)
        ? prevCheckedImages.filter((url) => url !== imageUrl)
        : [...prevCheckedImages, imageUrl]
    );
  };

  // Download selected images
  const handleDownloadSelected = async () => {
    for (let imageUrl of checkedImages) {
      try {
        const response = await axios.get(imageUrl, { responseType: 'blob' });
        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        saveAs(blob, `SelectedImage-${Date.now()}.jpg`);
      } catch (error) {
        console.error("Error downloading image", error);
      }
    }
  };

  // Download the currently previewed image in the Lightbox
  const handleDownloadCurrent = async () => {
    try {
      const imageUrl = lightboxImages[photoIndex]; // Now uses the current tab's images
      const response = await axios.get(imageUrl, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      saveAs(blob, `Image-${photoIndex + 1}.jpg`);
    } catch (error) {
      console.error("Error downloading image", error);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 0) {
      setLightboxImages(cloudImages); // Use gallery images
    } else {
      setLightboxImages(myUploads); // Use my uploads
    }
  };

  // Open lightbox for the correct tab
  const handleOpenLightbox = (index) => {
    setPhotoIndex(index);
    setIsOpen(true);
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #86C6C1 100%)",
        minHeight: "100vh",
        paddingBottom: "60px", // Add padding to avoid content being cut off by the navbar
      }}
    >
      {/* Tabs for navigating between Gallery and My Uploads */}
      <Tabs value={tabValue} onChange={handleTabChange} centered>
        <Tab label="Gallery" />
        <Tab label="My Uploads" />
      </Tabs>

      {/* My Uploads Tab Content */}
      {tabValue === 1 && (
        <Box sx={{ padding: 2 }}>
          <Typography variant="h5" sx={{ marginBottom: "10px", textAlign: "center" }}>
            My Uploads
          </Typography>

          {/* Display Upload Progress */}
          {uploading && uploadProgress > 0 && (
            <Box sx={{ width: '100%', marginY: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="caption" display="block" textAlign="center">
                Uploading {uploadProgress}%...
              </Typography>
            </Box>
          )}

          {/* Show user's own uploaded images */}
          <Grid container spacing={2} justifyContent="center">
            {myUploads.map((imageUrl, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                {/* Wrap the image and checkbox in a relative container */}
                <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img
                    src={imageUrl}
                    alt={`User upload ${index}`}
                    style={{ width: "100%", height: "auto", cursor: "pointer" }}
                    onClick={() => handleOpenLightbox(index)} // Now opens the correct image
                  />
                  {/* Indicating that image is private until approved */}
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
                  <Typography
                    variant="body2"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      padding: '5px',
                      width: '100%',
                      textAlign: 'center',
                    }}
                  >
                    Only you can see this image. Waiting for admin approval.
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Gallery Tab Content */}
      {tabValue === 0 && (
        <Box sx={{ padding: 2 }}>
          <Typography variant="h5" sx={{ marginBottom: "10px", textAlign: "center" }}>
            Gallery
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {cloudImages.map((imageUrl, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                {/* Wrap the image and checkbox in a relative container */}
                <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img
                    src={imageUrl}
                    alt={`Gallery image ${index}`}
                    style={{ width: "100%", height: "auto", cursor: "pointer" }}
                    onClick={() => handleOpenLightbox(index)} // Now opens the correct image
                  />
                  {/* The checkbox is now positioned relative to the image */}
                  <Checkbox
                    icon={<CheckCircleOutlineIcon sx={{ fontSize: 50 }} />} // Larger empty circle
                    checkedIcon={<CheckCircleIcon sx={{ fontSize: 50, color: "blue" }} />} // Larger highlighted circle with checkmark
                    checked={checkedImages.includes(imageUrl)}
                    onChange={() => handleSelectImage(imageUrl)}
                    sx={{ 
                      position: 'absolute', 
                      bottom: 10, 
                      left: 10, 
                      zIndex: 10 
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Lightbox for image preview */}
      {isOpen && (
        <Lightbox
          mainSrc={lightboxImages[photoIndex]}
          nextSrc={lightboxImages[(photoIndex + 1) % lightboxImages.length]}
          prevSrc={lightboxImages[(photoIndex + lightboxImages.length - 1) % lightboxImages.length]}
          onCloseRequest={() => setIsOpen(false)}
          onMoveNextRequest={() => setPhotoIndex((photoIndex + 1) % lightboxImages.length)}
          onMovePrevRequest={() => setPhotoIndex((photoIndex + lightboxImages.length - 1) % lightboxImages.length)}
          toolbarButtons={[
            <IconButton key="download" onClick={handleDownloadCurrent} color="primary" sx={{ color: "#fff", marginRight: 2 }}>
              <DownloadIcon sx={{ fontSize: 30 }} />
            </IconButton>,
          ]}
        />
      )}

      {/* Bottom Navigation Bar */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.1)",
          zIndex: 1200, // Ensure it's above other components
        }}
      >
        <BottomNavigation
          value={bottomNavValue}
          onChange={(event, newValue) => {
            setBottomNavValue(newValue);
            if (newValue === "upload") {
              document.getElementById("file-upload-input").click();
            }
          }}
          showLabels
        >
          <BottomNavigationAction
            label="Galleries"
            value="gallery"
            icon={<PhotoLibraryIcon />}
          />
          <BottomNavigationAction
            label="Upload"
            value="upload"
            icon={<AddCircleIcon />}
          />
          <BottomNavigationAction
            label="Voicemail"
            value="voicemail"
            icon={<VoicemailIcon />}
          />
        </BottomNavigation>

        {/* Hidden Input for Image Selection */}
        <input
          type="file"
          id="file-upload-input"
          accept="image/*"
          multiple
          hidden
          onChange={handleImageChange}
        />
      </Box>
    </Box>
  );
};

export default UploadPage;
