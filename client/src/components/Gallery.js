// File: Gallery.js
import React, { useState, useEffect } from "react";
import { useTheme, useMediaQuery, Pagination } from "@mui/material";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import LightboxGallery from "./LightboxGallery";
import "./Gallery.css";

const Gallery = () => {
  // Gallery image URLs
  const galleryItems = [
    "https://storage.googleapis.com/carranzawedding/Gallery/SNY00648-2.jpg",
    "https://storage.googleapis.com/carranzawedding/Gallery/SNY00676.jpg",
    "https://storage.googleapis.com/carranzawedding/Gallery/SNY00684.jpg",
    "https://storage.googleapis.com/carranzawedding/Gallery/SNY00712.jpg",
    "https://storage.googleapis.com/carranzawedding/Gallery/SNY00720.jpg",
    "https://storage.googleapis.com/carranzawedding/Gallery/SNY00752.jpg",
    "https://storage.googleapis.com/carranzawedding/Gallery/SNY00838.jpg",
    "https://storage.googleapis.com/carranzawedding/Gallery/SNY01102.jpg",
    "https://storage.googleapis.com/carranzawedding/Gallery/SNY01315.jpg",
    "https://storage.googleapis.com/carranzawedding/Gallery/SNY01336.jpg",
    "https://storage.googleapis.com/carranzawedding/Gallery/SNY01352.jpg",
    "https://storage.googleapis.com/carranzawedding/Gallery/0005.jpg",
    "https://storage.googleapis.com/carranzawedding/Gallery/0006.jpg",
    "https://storage.googleapis.com/carranzawedding/Gallery/0019.jpg",
    "https://storage.googleapis.com/carranzawedding/Gallery/0020.jpg",
    "https://storage.googleapis.com/carranzawedding/Gallery/0022.jpg",
    "https://storage.googleapis.com/carranzawedding/Gallery/0146.jpg",
    "https://storage.googleapis.com/carranzawedding/Gallery/0159.jpg",
    "https://storage.googleapis.com/carranzawedding/Gallery/0270.jpg",
    "https://storage.googleapis.com/carranzawedding/Gallery/JPEG-021.jpg",
    "https://storage.googleapis.com/carranzawedding/Gallery/JPEG-061.jpg",
  ];

  // Use MUI breakpoints to define even grid layout.
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm")); // Mobile (<600px)
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md")); // 600px - 900px
  const isMd = useMediaQuery(theme.breakpoints.between("md", "lg")); // 900px - 1200px
  const isLg = useMediaQuery(theme.breakpoints.up("lg")); // >1200px

  // Define grid columns and rows based on breakpoints to enforce even numbers.
  let columns, rows;
  if (isXs) {
    columns = 2;
    rows = 2;
  } else if (isSm) {
    columns = 4;
    rows = 2;
  } else if (isMd) {
    columns = 4;
    rows = 3;
  } else if (isLg) {
    columns = 6;
    rows = 3;
  } else {
    columns = 4;
    rows = 3;
  }
  const computedPageSize = columns * rows;

  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(computedPageSize);

  // Update pageSize when breakpoint values change.
  useEffect(() => {
    setPageSize(computedPageSize);
    setCurrentPage(0); // Reset to first page on layout change.
  }, [computedPageSize]);

  // Compute balanced pagination only for non-large screens.
  const totalPages = Math.ceil(galleryItems.length / pageSize);
  const startIndex = currentPage * pageSize;
  const paginatedItems = galleryItems.slice(startIndex, startIndex + pageSize);

  // Handle clicking an image.
  // For mosaic view, the index is already absolute; for grid view, convert paginated index.
  const handleImageClick = (index, mosaic = false) => {
    const absoluteIndex = mosaic ? index : currentPage * pageSize + index;
    setCurrentIndex(absoluteIndex);
    setIsOpen(true);
  };

  // Download all images as a zip file.
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
          Captured photos from our special moments. Click on any photo to view it in detail.
        </p>
      </header>

      {isLg ? (
        // Mosaic view for large screens: display ALL images with natural aspect ratios and enhanced hover overlay.
        <div className="gallery-mosaic">
          {galleryItems.map((item, index) => (
            <div
              key={index}
              className="mosaic-item"
              onClick={() => handleImageClick(index, true)}
            >
              <img src={item} alt={`Gallery item ${index + 1}`} />
              <div className="mosaic-overlay">
                <span>View Photo</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
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

          {totalPages > 1 && (
            <Pagination
              count={totalPages}
              page={currentPage + 1} // MUI Pagination is 1-indexed.
              onChange={(event, value) => {
                setCurrentPage(value - 1);
                document.getElementById("gallery").scrollIntoView({ behavior: "smooth" });
              }}
              sx={{
                display: "flex",
                justifyContent: "center",
                margin: "20px 0",
                "& .MuiPaginationItem-root": {
                  color: "black",
                  backgroundColor: "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "black",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "black",
                      opacity: 0.8,
                    },
                  },
                },
              }}
            />
          )}
        </>
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
