import React, { useMemo } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Download from "yet-another-react-lightbox/plugins/download";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Share from "yet-another-react-lightbox/plugins/share";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

const LightboxGallery = ({ isOpen, currentIndex, images, onClose, setCurrentIndex }) => {
  // Memoize slides to avoid unnecessary recalculations
  const slides = useMemo(
    () =>
      images.map((image) => ({
        src: image,
      })),
    [images]
  );

  // Handle view changes safely
  const handleViewChange = (viewEvent) => {
    const newIndex = typeof viewEvent === "number" ? viewEvent : viewEvent?.index; // Extract index
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  return (
    <Lightbox
      open={isOpen}
      close={onClose}
      slides={slides}
      index={currentIndex}
      on={{
        view: handleViewChange, // Handle view changes
      }}
      plugins={[
        Counter,     // Counter at the top-center
        Thumbnails,  // Thumbnails at the bottom
        Zoom,        // Zoom functionality
        Fullscreen,  // Fullscreen toggle
        Download,    // Download button
        Share,       // Share button
        Slideshow,   // Slideshow autoplay
      ]}
      zoom={{ maxZoomPixelRatio: 3 }} // Configure zoom behavior
      download={{ filename: `image-${currentIndex + 1}.jpg` }} // Configure download functionality
      thumbnails={{ width: 100, height: 80, borderRadius: 5 }} // Configure thumbnail behavior
      fullscreen={{ auto: false }} // Configure fullscreen behavior
      slideshow={{ autoplay: false, delay: 3000 }} // Configure slideshow settings
      counter={{ position: "top-center" }} // Configure counter position
      share={{
        url: window.location.href, // Use current page URL
        socialMedia: ["facebook", "twitter", "email"], // Share options
      }}
      styles={{
        container: { backgroundColor: "rgba(0, 0, 0, 0.95)" },
        image: {
          display: "block",
          margin: "auto",
          maxWidth: "90%",
          maxHeight: "90%",
          objectFit: "contain",
        },
      }}
    />
  );
};

export default LightboxGallery;