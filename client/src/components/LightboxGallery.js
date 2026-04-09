// File: LightboxGallery.js
import React, { useState, useEffect, useCallback } from "react";
import { Box, IconButton, Typography, CircularProgress, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import DownloadIcon from "@mui/icons-material/Download";
import ShareIcon from "@mui/icons-material/Share";
import { saveAs } from "file-saver";
import { motion, AnimatePresence } from "framer-motion";

const LightboxGallery = ({
  isOpen,
  currentIndex,
  images,
  onClose,
  setCurrentIndex,
}) => {
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(0);

  const handleNext = useCallback(() => {
    setDirection(1);
    setLoading(true);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length, setCurrentIndex]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setLoading(true);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length, setCurrentIndex]);

  const handleDownload = async () => {
    try {
      const src = images[currentIndex];
      const filename = src.split("/").pop() || "wedding-photo.jpg";
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(src)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      saveAs(blob, filename);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const handleShare = async () => {
    try {
      const src = images[currentIndex];
      const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(src)}`);
      const blob = await response.blob();
      const file = new File([blob], "wedding-photo.jpg", { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Wedding Photo",
          text: "Check out this photo from the wedding!",
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen) return null;

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        bgcolor: "rgba(0, 0, 0, 0.98)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Top Toolbar */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
          zIndex: 100,
        }}
      >
        <Typography sx={{ color: "#fff", fontWeight: "bold" }}>
          {currentIndex + 1} / {images.length}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Share">
            <IconButton onClick={handleShare} sx={{ color: "#fff" }}>
              <ShareIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton onClick={handleDownload} sx={{ color: "#fff" }}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose} sx={{ color: "#fff" }}>
            <CloseIcon fontSize="large" />
          </IconButton>
        </Box>
      </Box>

      {/* Main Image Container with Framer Motion */}
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -10000) {
                handleNext();
              } else if (swipe > 10000) {
                handlePrev();
              }
            }}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "grab",
            }}
          >
            {loading && (
              <CircularProgress
                sx={{ position: "absolute", color: "#fff" }}
              />
            )}
            <motion.img
              src={images[currentIndex]}
              alt={`Gallery item ${currentIndex + 1}`}
              onLoad={() => setLoading(false)}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                userSelect: "none",
                WebkitUserDrag: "none",
              }}
            />
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Desktop Navigation Arrows */}
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <IconButton
          onClick={handlePrev}
          sx={{
            position: "absolute",
            left: 20,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#fff",
            bgcolor: "rgba(255,255,255,0.1)",
            zIndex: 101,
            "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
          }}
        >
          <ArrowBackIosNewIcon fontSize="large" />
        </IconButton>
        <IconButton
          onClick={handleNext}
          sx={{
            position: "absolute",
            right: 20,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#fff",
            bgcolor: "rgba(255,255,255,0.1)",
            zIndex: 101,
            "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
          }}
        >
          <ArrowForwardIosIcon fontSize="large" />
        </IconButton>
      </Box>

      {/* Mobile Swipe Hint */}
      <Box
        sx={{
          position: "absolute",
          bottom: 30,
          display: { xs: "block", md: "none" },
          textAlign: "center",
          width: "100%",
          zIndex: 10,
        }}
      >
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", letterSpacing: 1 }}>
          SWIPE TO NAVIGATE
        </Typography>
      </Box>
    </Box>
  );
};

export default LightboxGallery;
