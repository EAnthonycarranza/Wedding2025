import React, { useMemo } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Download from "yet-another-react-lightbox/plugins/download";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Share from "yet-another-react-lightbox/plugins/share";
import { saveAs } from "file-saver";

import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

// 1) A tiny custom plugin to add a "Save to Photos" button in the top toolbar.
function SaveToPhotosPlugin({ getSlides, currentIndex }) {
  // This function attempts to use the Web Share API with a File object:
  const handleSaveToPhotos = async () => {
    try {
      const slides = getSlides();
      const { src } = slides[currentIndex];

      // Attempt to fetch the image as a blob
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${src}`);
      }
      const blob = await response.blob();
      const file = new File([blob], "gallery-image.jpg", { type: blob.type });

      // Check if the browser can share a file
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Wedding Photo",
          text: "Check out this wedding photo!",
        });
      } else {
        // If not supported, fallback to normal download
        fallbackDownload(blob);
      }
    } catch (error) {
      console.error("Save to Photos error:", error);
    }
  };

  // Fallback: normal download with a fixed filename
  const fallbackDownload = (blob) => {
    saveAs(blob, "gallery-image.jpg");
  };

  return {
    // YARL calls this to render a custom toolbar button
    render: {
      button: ({ slideIndex }) => {
        // Only show the button on the currently displayed slide
        if (slideIndex !== currentIndex) return null;

        return {
          key: "saveToPhotos",
          label: "Save to Photos",
          onClick: handleSaveToPhotos,
          // An optional icon SVG
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
              <path d="M5 4v16h14V4H5zm2 2h10v8H7V6zm0 10h10v2H7v-2z" />
            </svg>
          ),
        };
      },
    },
  };
}

const LightboxGallery = ({
  isOpen,
  currentIndex,
  images,
  onClose,
  setCurrentIndex,
}) => {
  // Build slides from your images array
  const slides = useMemo(
    () =>
      images.map((image) => ({
        src: image,
      })),
    [images]
  );

  // Keep the current index in sync
  const handleViewChange = (viewEvent) => {
    const newIndex =
      typeof viewEvent === "number" ? viewEvent : viewEvent?.index;
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  // A custom function for the built-in Download plugin to force a specific filename
  const customDownloadFn = async (slide, number) => {
    try {
      const response = await fetch(slide.src);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${slide.src}`);
      }
      const blob = await response.blob();
      // Force the filename here, e.g. gallery-1.jpg, gallery-2.jpg, etc.
      saveAs(blob, `gallery-${number + 1}.jpg`);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  return (
    <Lightbox
      open={isOpen}
      close={onClose}
      slides={slides}
      index={currentIndex}
      on={{
        view: handleViewChange,
      }}
      plugins={[
        Counter,
        Thumbnails,
        Zoom,
        Fullscreen,
        Download,
        Share,
        Slideshow,
        // 2) Add our custom "Save to Photos" plugin
        SaveToPhotosPlugin,
      ]}
      zoom={{ maxZoomPixelRatio: 3 }}
      // The key part: pass our custom downloadFn to override the default
      download={{
        downloadFn: customDownloadFn,
      }}
      thumbnails={{ width: 100, height: 80, borderRadius: 5 }}
      fullscreen={{ auto: false }}
      slideshow={{ autoplay: false, delay: 3000 }}
      counter={{ position: "top-center" }}
      share={{
        url: window.location.href,
        socialMedia: ["facebook", "twitter", "email"],
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