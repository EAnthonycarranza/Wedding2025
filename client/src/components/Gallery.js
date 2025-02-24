import React, { useState, useEffect } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import LightboxGallery from "./LightboxGallery";
import Pagination from "@mui/material/Pagination";
import "./Gallery.css";

const Gallery = () => {
  // Flag: set to true if you want larger desktop images (with pagination),
  // set to false if you want small desktop thumbnails that show all images.
  const desktopLarge = false;

  // Gallery image URLs (remote URLs)
  const galleryItems = [
    "https://storage.googleapis.com/galleryimageswedding/gallery-1.jpg",
    "https://storage.googleapis.com/galleryimageswedding/gallery-2.jpg",
    "https://storage.googleapis.com/galleryimageswedding/gallery-3.jpg",
    "https://storage.googleapis.com/galleryimageswedding/gallery-4.jpg",
    "https://storage.googleapis.com/galleryimageswedding/gallery-5.jpg",
    "https://storage.googleapis.com/galleryimageswedding/gallery-6.jpg",
    "https://storage.googleapis.com/galleryimageswedding/gallery-7.jpg",
    "https://storage.googleapis.com/galleryimageswedding/gallery-8.jpg",
    "https://storage.googleapis.com/galleryimageswedding/SNY00580-2.jpg",
    "https://storage.googleapis.com/galleryimageswedding/SNY00616.jpg",
    "https://storage.googleapis.com/galleryimageswedding/SNY00676.jpg",
    "https://storage.googleapis.com/galleryimageswedding/SNY00712.jpg",
    "https://storage.googleapis.com/galleryimageswedding/SNY00752.jpg",
    "https://storage.googleapis.com/galleryimageswedding/SNY00848.jpg",
    "https://storage.googleapis.com/galleryimageswedding/SNY00884-2.jpg",
    "https://storage.googleapis.com/galleryimageswedding/SNY01164.jpg",
    "https://storage.googleapis.com/galleryimageswedding/SNY01177.jpg",
    "https://storage.googleapis.com/galleryimageswedding/SNY01291.jpg",
    "https://storage.googleapis.com/galleryimageswedding/SNY01307.jpg",
    "https://storage.googleapis.com/galleryimageswedding/SNY01352.jpg",
    "https://storage.googleapis.com/galleryimageswedding/SNY01132.jpg",
    "https://storage.googleapis.com/galleryimageswedding/SNY01092.jpg",
    "https://storage.googleapis.com/galleryimageswedding/SNY00859.jpg",
    "https://storage.googleapis.com/galleryimageswedding/SNY00684.jpg",
  ];

  // Determine page size based on device width and the desktopLarge flag.
  function getPageSize() {
    if (window.innerWidth < 768) {
      // For mobile devices, show fewer images per page
      return 6;
    } else {
      // For desktop: if large images are desired, paginate (e.g., 12 per page),
      // otherwise, show all images in one grid.
      return desktopLarge ? 12 : galleryItems.length;
    }
  }

  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(getPageSize());

  // Update pageSize on window resize
  useEffect(() => {
    const handleResize = () => {
      const newPageSize = getPageSize();
      setPageSize(newPageSize);
      setCurrentPage(0); // Reset to first page on resize
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate pagination based on pageSize
  const totalPages = Math.ceil(galleryItems.length / pageSize);
  const startIndex = currentPage * pageSize;
  const paginatedItems = galleryItems.slice(startIndex, startIndex + pageSize);

  // Handle clicking an image (converts paginated index to absolute index)
  const handleImageClick = (index) => {
    const absoluteIndex = currentPage * pageSize + index;
    setCurrentIndex(absoluteIndex);
    setIsOpen(true);
  };

  // Download all images as a zipped file
  const downloadAllPhotos = async () => {
    try {
      const zip = new JSZip();
      const folder = zip.folder("wedding-gallery");

      for (let i = 0; i < galleryItems.length; i++) {
        const url = galleryItems[i];
        const filename = `image-${i + 1}.jpg`;

        console.log(`Fetching ${url}...`);
        const response = await fetch(url);

        if (!response.ok) {
          console.error(`Failed to fetch ${url}: ${response.statusText}`);
          continue;
        }

        const blob = await response.blob();
        folder.file(filename, blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "wedding-gallery.zip");
    } catch (error) {
      console.error("Error downloading photos:", error.message);
    }
  };

  return (
    <div id="gallery" className="gallery-container">
      <header className="gallery-header">
        <h2>Photo Gallery</h2>
        <p>
          Captured moments from our special day. Click on any photo to view it in
          detail.
        </p>
      </header>

      <div className="gallery-grid">
        {paginatedItems.map((item, index) => (
          <div
            key={index}
            className="gallery-item"
            style={{ backgroundImage: `url(${item})` }}
            onClick={() => handleImageClick(index)}
          >
            <div className="gallery-overlay">
              <span>View Photo</span>
            </div>
          </div>
        ))}
      </div>

      {/* Use MUI Pagination for navigation if there is more than one page */}
      {totalPages > 1 && (
        <Pagination
          count={totalPages}
          page={currentPage + 1} // MUI Pagination is 1-indexed
          onChange={(event, value) => setCurrentPage(value - 1)}
          color="primary"
          sx={{ display: "flex", justifyContent: "center", margin: "20px 0" }}
        />
      )}

      <LightboxGallery
        isOpen={isOpen}
        currentIndex={currentIndex}
        images={galleryItems}
        onClose={() => setIsOpen(false)}
        setCurrentIndex={setCurrentIndex}
      />

      <div className="download-all-container">
        <button className="download-all-button" onClick={downloadAllPhotos}>
          Download All Photos
        </button>
      </div>
    </div>
  );
};

export default Gallery;
