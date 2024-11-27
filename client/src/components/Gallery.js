import React, { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import LightboxGallery from "./LightboxGallery";

const Gallery = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Gallery image URLs
  const galleryItems = [
    "https://storage.googleapis.com/galleryimageswedding/gallery-1.jpg",
    "https://storage.googleapis.com/galleryimageswedding/gallery-2.jpg",
    "https://storage.googleapis.com/galleryimageswedding/gallery-3.jpg",
    "https://storage.googleapis.com/galleryimageswedding/gallery-4.jpg",
    "https://storage.googleapis.com/galleryimageswedding/gallery-5.jpg",
    "https://storage.googleapis.com/galleryimageswedding/gallery-6.jpg",
    "https://storage.googleapis.com/galleryimageswedding/gallery-7.jpg",
    "https://storage.googleapis.com/galleryimageswedding/gallery-8.jpg",
  ];

  // Handle clicking an image
  const handleImageClick = (index) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

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
      <div className="gallery-header text-center">
        <h2>Photo Gallery</h2>
        <p>
          Captured moments from our special day. Click on any photo to view it
          in detail.
        </p>
      </div>
      <div className="gallery-grid">
        {galleryItems.map((item, index) => (
          <div
            key={index}
            className="gallery-item"
            onClick={() => handleImageClick(index)}
            style={{ backgroundImage: `url(${item})` }}
          >
            <div className="gallery-overlay">
              <span>View Photo</span>
            </div>
          </div>
        ))}
      </div>
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
