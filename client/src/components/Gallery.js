import React, { useState, useEffect } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import LightboxGallery from "./LightboxGallery";
import Pagination from "@mui/material/Pagination";
import "./Gallery.css";

// Import local images from src/img
import gallery1 from "../img/gallery-1.jpg";
import gallery2 from "../img/gallery-2.jpg";
import gallery3 from "../img/gallery-3.jpg";
import gallery4 from "../img/gallery-4.jpg";
import gallery5 from "../img/gallery-5.jpg";
import gallery6 from "../img/gallery-6.jpg";
import gallery7 from "../img/gallery-7.jpg";
import gallery8 from "../img/gallery-8.jpg";
import SNY00580_2 from "../img/SNY00580-2.jpg";
import SNY00616 from "../img/SNY00616.jpg";
import SNY00676 from "../img/SNY00676.jpg";
import SNY00712 from "../img/SNY00712.jpg";
import SNY00752 from "../img/SNY00752.jpg";
import SNY00848 from "../img/SNY00848.jpg";
// Note: Replace the original SNY00884-2 with SNY00648-2 per your file naming
import SNY00648_2 from "../img/SNY00648-2.jpg";
import SNY01164 from "../img/SNY01164.jpg";
import SNY01177 from "../img/SNY01177.jpg";
import SNY01291 from "../img/SNY01291.jpg";
import SNY01307 from "../img/SNY01307.jpg";
import SNY01352 from "../img/SNY01352.jpg";
import SNY01132 from "../img/SNY01132.jpg";
import SNY01092 from "../img/SNY01092.jpg";
import SNY00859 from "../img/SNY00859.jpg";
import SNY00684 from "../img/SNY00684.jpg";

const Gallery = () => {
  // Flag: set to true if you want larger desktop images (with pagination),
  // set to false if you want small desktop thumbnails that show all images.
  const desktopLarge = false;

  // Gallery image imports
  const galleryItems = [
    gallery1,
    gallery2,
    gallery3,
    gallery4,
    gallery5,
    gallery6,
    gallery7,
    gallery8,
    SNY00580_2,
    SNY00616,
    SNY00676,
    SNY00712,
    SNY00752,
    SNY00848,
    SNY00648_2,
    SNY01164,
    SNY01177,
    SNY01291,
    SNY01307,
    SNY01352,
    SNY01132,
    SNY01092,
    SNY00859,
    SNY00684,
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
