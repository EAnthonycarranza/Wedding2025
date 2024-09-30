import React, { useState, useEffect, useRef } from "react";
import { Box, Button } from "@mui/material";
import axios from "axios";
import GalleryTabs from "./GalleryTabs";
import LightboxGallery from "./LightboxGallery";
import BottomNavigationBar from "./BottomNavigationBar";
import DownloadIcon from '@mui/icons-material/Download';
import { saveAs } from "file-saver";
import GalleryPreview from './GalleryPreview';

const UploadPage = () => {
  // Existing state variables
  const [selectedImages, setSelectedImages] = useState([]);
  const [isOpen, setIsOpen] = useState(false); // Lightbox open state
  const [photoIndex, setPhotoIndex] = useState(0);
  const [cloudImages, setCloudImages] = useState([]);
  const [myUploads, setMyUploads] = useState([]);
  const [bottomNavValue, setBottomNavValue] = useState('gallery');

  const fileInputRef = useRef(null);

  // **New state variables for view options and filters**
  const [filterOption, setFilterOption] = useState('allUploads'); // For the dropdown menu
  const [enableMultiSelect, setEnableMultiSelect] = useState(false); // Multi-select mode
  const [sortBy, setSortBy] = useState('timeUploaded');
  const [orderBy, setOrderBy] = useState('newestFirst');
  const [setAsDefault, setSetAsDefault] = useState(false);

  // **Combined images array**
  const [allImages, setAllImages] = useState([]);

  // **Fetch images and combine them**
  useEffect(() => {
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
  }, []);

  // **Update allImages whenever cloudImages or myUploads change**
  useEffect(() => {
    setAllImages([...cloudImages, ...myUploads]);
  }, [cloudImages, myUploads]);

  // **Derive images array based on filterOption and sorting**
  const images = React.useMemo(() => {
    let filteredImages = [];

    if (filterOption === 'justPhotos') {
      filteredImages = allImages.filter((img) => img.type === 'photo');
    } else if (filterOption === 'justVideos') {
      filteredImages = allImages.filter((img) => img.type === 'video');
    } else if (filterOption === 'myUploads') {
      filteredImages = myUploads;
    } else {
      // 'allUploads'
      filteredImages = allImages;
    }

    // **Sort the images based on sortBy and orderBy**
    filteredImages.sort((a, b) => {
      let dateA, dateB;

      if (sortBy === 'timeUploaded') {
        dateA = new Date(a.uploadedAt);
        dateB = new Date(b.uploadedAt);
      } else if (sortBy === 'timeTaken') {
        dateA = new Date(a.takenAt);
        dateB = new Date(b.takenAt);
      }

      if (orderBy === 'newestFirst') {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

    return filteredImages;
  }, [filterOption, sortBy, orderBy, allImages, myUploads]);

  // **Refresh gallery**
  const refreshGallery = () => {
    // Logic to refresh the gallery, e.g., re-fetch images
    console.log('Refreshing gallery...');
    // Re-fetch cloud images
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

  // **Apply filters**
  const applyFilters = ({ sortBy, orderBy, setAsDefault }) => {
    setSortBy(sortBy);
    setOrderBy(orderBy);
    setSetAsDefault(setAsDefault);
    // If setAsDefault is true, save preferences
    if (setAsDefault) {
      localStorage.setItem('gallerySortBy', sortBy);
      localStorage.setItem('galleryOrderBy', orderBy);
    }
  };

  // **Handle file input change (uploads)**
  const handleFileInputChange = (event) => {
    const files = Array.from(event.target.files);
    const uploadedImages = files.map(file => {
      return {
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'photo' : 'video',
        uploadedAt: new Date().toISOString(),
        takenAt: file.lastModifiedDate ? file.lastModifiedDate.toISOString() : new Date().toISOString(),
      };
    });

    // Update myUploads
    setMyUploads((prevUploads) => [...prevUploads, ...uploadedImages]);
  };

  // **Handle selecting/deselecting images**
  const handleSelectImage = (image) => {
    setSelectedImages(prevSelectedImages =>
      prevSelectedImages.includes(image)
        ? prevSelectedImages.filter((img) => img !== image)
        : [...prevSelectedImages, image]
    );
  };

  // **Handle open lightbox**
  const handleOpenLightbox = (index) => {
    setPhotoIndex(index);
    setIsOpen(true);
  };

  // **Handle close lightbox**
  const handleCloseLightbox = () => {
    setIsOpen(false);
  };

  // **Ensure photoIndex is valid when images change**
  useEffect(() => {
    if (images.length > 0 && photoIndex >= images.length) {
      setPhotoIndex(0);
    }
  }, [images, photoIndex]);

  // **Handle next and previous in lightbox**
  const handleNext = () => {
    setPhotoIndex((photoIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setPhotoIndex((photoIndex + images.length - 1) % images.length);
  };

  // **Handle download selected images**
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
      <GalleryTabs
        filterOption={filterOption}
        setFilterOption={setFilterOption}
        refreshGallery={refreshGallery}
        enableMultiSelect={enableMultiSelect}
        setEnableMultiSelect={setEnableMultiSelect}
        applyFilters={applyFilters}
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

      {/* Pass images to GalleryPreview */}
      <GalleryPreview
        images={images}
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
      {isOpen && images.length > 0 && (
        <LightboxGallery
          isOpen={isOpen}
          images={images}
          photoIndex={photoIndex}
          handleCloseLightbox={handleCloseLightbox}
          handleNext={handleNext}
          handlePrev={handlePrev}
        />
      )}

      {/* Pass file input ref and isOpen to BottomNavigationBar */}
      <BottomNavigationBar 
        bottomNavValue={bottomNavValue}
        setBottomNavValue={setBottomNavValue}
        fileInputRef={fileInputRef}
        isOpen={isOpen}
      />
    </Box>
  );
};

export default UploadPage;
