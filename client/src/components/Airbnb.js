// File: Airbnb.js

import React, { useState, useEffect, useRef } from "react";
import Slider from "react-slick";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Avatar,
  Rating,
  Button,
  Modal,
  Pagination,
  Tooltip,
  Collapse,
  Paper,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BedIcon from "@mui/icons-material/Bed";
import KingBedIcon from "@mui/icons-material/KingBed";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import GroupIcon from "@mui/icons-material/Group";
import StarIcon from "@mui/icons-material/Star";
import BathtubIcon from "@mui/icons-material/Bathtub";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Loading from "./Loading";
import useMediaQuery from "@mui/material/useMediaQuery";

// Helper function to decode HTML entities
function decodeHtml(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

// Custom icon for the map marker
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function Airbnb() {
  // State declarations
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const listingsPerPage = 10;
  const [selectedLat, setSelectedLat] = useState(null);
  const [selectedLng, setSelectedLng] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedAccordionData, setSelectedAccordionData] = useState({
    theSpace: null,
    otherThings: null,
  });
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [aboutHostOpen, setAboutHostOpen] = useState(false);
  const [hostAboutText, setHostAboutText] = useState("");
  const [selectedHostName, setSelectedHostName] = useState("");
  const [selectedHostProfilePicture, setSelectedHostProfilePicture] = useState("");
  const [hostRatingHost, setHostRatingHost] = useState(0);
  const [hostReviewsHost, setHostReviewsHost] = useState("0");
  const [isSuperhost, setIsSuperhost] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [dotOffset, setDotOffset] = useState(0);
  const dotsPerGroup = 5;
  const [collapsed, setCollapsed] = useState(false);
  const isWideScreen = useMediaQuery("(min-width:700px)");

  const destinations = [
    {
      name: "First Assembly of God at San Antonio",
      lat: 29.56517815357653,
      lon: -98.49057444759886,
    },
    {
      name: "The Club at Garden Ridge",
      lat: 29.637170128414255,
      lon: -98.31085434574706,
    },
  ];

  const topRef = useRef(null);

  // Fetch listings from the API
  const fetchListings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/airbnb-listings");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const { results } = await response.json();
      console.log("Fetched Airbnb Listings:", results);

      const listingsData = [];
      for (const listing of results) {
        const airbnbId = listing.airbnb_id;
        try {
          const detailResponse = await fetch(`/api/airbnb-detail?id=${airbnbId}`);
          const detailData = await detailResponse.json();

          const singleResponse = await fetch(`/api/single-listing-detail?id=${airbnbId}`);
          const singleData = await singleResponse.json();

          // Extract Host Information
          const hostSection = detailData.find(
            (section) => section.__typename === "MeetYourHostSection"
          );
          const availabilitySection = detailData.find(
            (section) => section.__typename === "AvailabilityCalendarSection"
          );

          const hostName = hostSection?.cardData?.name || "Host not specified";
          const hostProfilePicture = hostSection?.cardData?.profilePictureUrl || null;

          // Extract hostRating and hostReviews
          const reviewsSection = detailData.find(
            (section) => section.__typename === "StayPdpReviewsSection"
          );
          const hostRating = parseFloat(reviewsSection?.overallRating) || 0;
          const hostReviews = reviewsSection?.overallCount || "0";

          // Extract hostAbout
          const hostAbout = hostSection?.about || "Information not available";

          const yearsHosting =
            hostSection?.cardData?.stats?.find((stat) => stat.type === "YEARS_HOSTING")?.value || "0";

          // Extract Host Review Statistics
          const hostRatingStat = hostSection?.cardData?.stats?.find((stat) => stat.type === "RATING");
          const hostReviewsStat = hostSection?.cardData?.stats?.find((stat) => stat.type === "REVIEW_COUNT");

          const hostRatingHostValue = parseFloat(hostRatingStat?.value) || 0;
          const hostReviewsHostValue = hostReviewsStat?.value || "0";

          // Extract Superhost and Verified status
          const isSuperhostValue = hostSection?.cardData?.isSuperhost || false;
          const isVerifiedValue = hostSection?.cardData?.isVerified || false;

          // Extract Location Information
          const locationSection = detailData.find(
            (section) => section.__typename === "LocationSection"
          );
          const lat = locationSection?.lat || null;
          const lng = locationSection?.lng || null;

          // Extract General List Content and Descriptions
          const generalListContentSection = detailData.find(
            (section) => section.__typename === "GeneralListContentSection"
          );
          const items = generalListContentSection?.items;
          const theSpaceHtml = items.find((item) => item.title === "The space")?.html?.htmlText;
          const otherThingsHtml = items.find((item) => item.title === "Other things to note")?.html?.htmlText;

          // Extract Preview Images
          const pdpHeroSection = detailData.find(
            (section) => section.__typename === "PdpHeroSection"
          );
          const previewImages = pdpHeroSection?.previewImages || [];
          console.log("Preview Images for Airbnb ID:", airbnbId, previewImages);

          // Extract Primary HTML Text if needed
          const primaryHtmlText =
            generalListContentSection?.items?.[0]?.html?.htmlText || "No description available.";

          // Extract Beds, Baths, and Guest Count
          let beds = "N/A";
          let baths = "N/A";
          let maxGuestCapacity = availabilitySection?.maxGuestCapacity
            ? availabilitySection.maxGuestCapacity.toString()
            : "N/A";

          if (availabilitySection?.descriptionItems) {
            const bedsItem = availabilitySection.descriptionItems.find((item) =>
              item.title.toLowerCase().includes("bed")
            );
            const bathsItem = availabilitySection.descriptionItems.find((item) =>
              item.title.toLowerCase().includes("bath")
            );
            if (bedsItem) {
              const bedsMatch = bedsItem.title.match(/(\d+)\s*bed/);
              beds = bedsMatch ? bedsMatch[1] : "N/A";
            }
            if (bathsItem) {
              const bathsMatch = bathsItem.title.match(/([\d.]+)\s*bath/);
              baths = bathsMatch ? bathsMatch[1] : "Shared, Dedicated, or Private";
            }
          }

          // Extract bedroom count from the sharingConfig title in PdpTitleSection
          let bedrooms = "N/A";
          const titleSection = detailData.find(
            (section) => section.__typename === "PdpTitleSection"
          );
          if (
            titleSection &&
            titleSection.shareSave &&
            titleSection.shareSave.sharingConfig &&
            titleSection.shareSave.sharingConfig.title
          ) {
            const title = titleSection.shareSave.sharingConfig.title;
            const parts = title.split("&middot;");
            const bedroomPart = parts.find((part) =>
              part.toLowerCase().includes("bedroom")
            );
            if (bedroomPart) {
              const numberMatch = bedroomPart.match(/(\d+)/);
              if (numberMatch) {
                bedrooms = numberMatch[1];
              }
            }
          }

          listingsData.push({
            airbnbId,
            thumbnail: availabilitySection?.thumbnail?.baseUrl || null,
            previewImages,
            listingTitle: availabilitySection?.listingTitle || "No Title Available",
            maxGuestCapacity,
            lastUpdated: singleData.results[0]?.last_updated || "Unknown",
            roomType: singleData.results[0]?.roomType || "Unknown",
            hostName,
            hostProfilePicture,
            hostRating,
            hostReviews,
            hostAbout,
            yearsHosting,
            accordionData: {
              theSpace: theSpaceHtml || null,
              otherThings: otherThingsHtml || null,
            },
            lat,
            lng,
            beds,
            baths,
            bedrooms,
            hostRatingHost: hostRatingHostValue,
            hostReviewsHost: hostReviewsHostValue,
            isSuperhost: isSuperhostValue,
            isVerified: isVerifiedValue,
          });
        } catch (innerError) {
          console.error(`Error fetching data for Airbnb ID ${airbnbId}:`, innerError.message);
        }
      }

      // Fetch ETA for each listing to each destination
      const enrichedListings = await Promise.all(
        listingsData.map(async (listing) => {
          if (listing.lat && listing.lng) {
            try {
              const etaPromises = destinations.map(async (destination) => {
                try {
                  const etaResponse = await fetch(
                    `/api/eta?originLat=${listing.lat}&originLon=${listing.lng}&destLat=${destination.lat}&destLon=${destination.lon}`
                  );
                  if (etaResponse.ok) {
                    const etaData = await etaResponse.json();
                    let durationString = "";
                    const durationParts = etaData.duration.split(" ");
                    if (durationParts.includes("hours")) {
                      const hoursIndex = durationParts.indexOf("hours");
                      const hours = parseInt(durationParts[hoursIndex - 1], 10);
                      if (hours > 0) {
                        durationString += `${hours} hour${hours > 1 ? "s" : ""} `;
                      }
                    }
                    const minutesIndex = durationParts.indexOf("minutes");
                    if (minutesIndex !== -1) {
                      const minutes = parseInt(durationParts[minutesIndex - 1], 10);
                      durationString += `${minutes} minute${minutes !== 1 ? "s" : ""}`;
                    }
                    if (durationString.trim() === "") {
                      durationString = "N/A";
                    }
                    return {
                      name: destination.name,
                      distance: etaData.distance,
                      duration: durationString.trim(),
                    };
                  } else {
                    console.warn(
                      `Failed to fetch ETA for listing ID ${listing.airbnbId} to ${destination.name}: ${etaResponse.statusText}`
                    );
                    return { name: destination.name, distance: "N/A", duration: "N/A" };
                  }
                } catch (etaError) {
                  console.error(`Error fetching ETA for listing ID ${listing.airbnbId} to ${destination.name}:`, etaError.message);
                  return { name: destination.name, distance: "N/A", duration: "N/A" };
                }
              });
              const etaResults = await Promise.all(etaPromises);
              const etaData = {};
              etaResults.forEach((result) => {
                const keyName = `etaTo${result.name.replace(/\s+/g, "")}`;
                etaData[keyName] = {
                  distance: result.distance,
                  duration: result.duration !== "0 minutes" ? result.duration : "N/A",
                };
              });
              return { ...listing, ...etaData };
            } catch (etaError) {
              console.error(`Error fetching ETAs for listing ID ${listing.airbnbId}:`, etaError.message);
              const etaData = {};
              destinations.forEach((destination) => {
                const keyName = `etaTo${destination.name.replace(/\s+/g, "")}`;
                etaData[keyName] = { distance: "N/A", duration: "N/A" };
              });
              return { ...listing, ...etaData };
            }
          } else {
            const etaData = {};
            destinations.forEach((destination) => {
              const keyName = `etaTo${destination.name.replace(/\s+/g, "")}`;
              etaData[keyName] = { distance: "N/A", duration: "N/A" };
            });
            return { ...listing, ...etaData };
          }
        })
      );

      setListings(enrichedListings);
      setDataLoaded(true);
    } catch (err) {
      console.error("Error fetching listings:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const handleOpenModal = (description, lat, lng, accordionData, images) => {
    setSelectedDescription(description);
    setSelectedLat(lat);
    setSelectedLng(lng);
    setSelectedAccordionData(accordionData);
    setSelectedImages(images || []);
    setModalOpen(true);
    setDotOffset(0);
  };

  const handleCloseModal = () => setModalOpen(false);

  // About Host modal handlers
  const handleOpenAboutHostModal = (
    aboutText,
    hostName,
    hostProfilePicture,
    ratingHost,
    reviewsHost,
    superhostStatus,
    verifiedStatus
  ) => {
    const decodedAboutText = decodeHtml(aboutText);
    setHostAboutText(decodedAboutText);
    setSelectedHostName(hostName);
    setSelectedHostProfilePicture(hostProfilePicture);
    setHostRatingHost(ratingHost);
    setHostReviewsHost(reviewsHost);
    setIsSuperhost(superhostStatus);
    setIsVerified(verifiedStatus);
    setAboutHostOpen(true);
  };

  const handleCloseAboutHostModal = () => setAboutHostOpen(false);

  // Pagination logic
  const indexOfLastListing = currentPage * listingsPerPage;
  const indexOfFirstListing = indexOfLastListing - listingsPerPage;
  const currentListings = listings.slice(indexOfFirstListing, indexOfLastListing);

  // Updated Pagination: Scroll to the top of the component using window.scrollTo
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    if (topRef.current) {
      const topOffset = topRef.current.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

  // Effect to reset dotOffset if total dots are less than or equal to dotsPerGroup
  useEffect(() => {
    if (dotOffset + dotsPerGroup >= selectedImages.length) {
      setDotOffset(Math.max(selectedImages.length - dotsPerGroup, 0));
    }
  }, [selectedImages, dotOffset]);

  // Collapse/Expand handlers with scroll to top using window.scrollTo
  const handleCollapse = () => {
    setCollapsed(true);
    if (topRef.current) {
      const topOffset = topRef.current.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

  const handleExpand = () => {
    setCollapsed(false);
    if (topRef.current) {
      const topOffset = topRef.current.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
          <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", flexDirection: "row" }}>

        <Loading />
      </Box>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Box ref={topRef}>
      {!dataLoaded && (
        <Button
          variant="contained"
          onClick={fetchListings}
          sx={{
            mb: 4,
            backgroundColor: "#ff385c",
            color: "#fff",
            "&:hover": { backgroundColor: "#e03852" },
          }}
        >
          View Airbnb Selections
        </Button>
      )}

      <Collapse in={!collapsed} timeout="auto" unmountOnExit>
        {dataLoaded && (
          <>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
              <Button
                variant="contained"
                onClick={handleCollapse}
                sx={{
                  backgroundColor: "#ff385c",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#e03852" },
                }}
              >
                Hide Airbnb Listings
              </Button>
            </Box>
            {currentListings.map((listing, index) => (
              <Card key={index} sx={{ mb: 4 }}>
                {listing.thumbnail && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={listing.thumbnail}
                    alt="Listing Thumbnail"
                  />
                )}
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {listing.listingTitle}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mt: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Tooltip title="Maximum Guests">
                        <GroupIcon fontSize="small" color="action" aria-label="Guests" />
                      </Tooltip>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        {listing.maxGuestCapacity} {listing.maxGuestCapacity === "1" ? "Guest" : "Guests"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Tooltip title="Number of Bedrooms">
                        <KingBedIcon fontSize="small" color="action" aria-label="Bedrooms" />
                      </Tooltip>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        {listing.bedrooms} {listing.bedrooms === "1" ? "Bedroom" : "Bedrooms"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Tooltip title="Number of Beds">
                        <BedIcon fontSize="small" color="action" aria-label="Beds" />
                      </Tooltip>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        {listing.beds} {listing.beds === "1" ? "Bed" : "Beds"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Tooltip title="Number of Baths">
                        <BathtubIcon fontSize="small" color="action" aria-label="Baths" />
                      </Tooltip>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        {listing.baths} {listing.baths === "1" ? "Bath" : "Baths"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Tooltip title="Type of Room">
                        <MeetingRoomIcon fontSize="small" color="action" />
                      </Tooltip>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        {listing.roomType}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mt: 2,
                      gap: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      {listing.hostProfilePicture && (
                        <Avatar
                          src={listing.hostProfilePicture}
                          alt={listing.hostName}
                          sx={{ width: 56, height: 56 }}
                        />
                      )}
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {listing.hostName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {listing.yearsHosting} {listing.yearsHosting === "1" ? "Year" : "Years"} Hosting
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box
  sx={{
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    flexWrap: "wrap",
    alignItems: "center",
    alignContent: "flex-start",
  }}
>

                        <Typography variant="h6" color="text.primary">
                          {listing.hostRating.toFixed(2)}
                        </Typography>
                        <Rating value={listing.hostRating || 0} precision={0.1} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary">
                          ({listing.hostReviews} {listing.hostReviews === "1" ? "review" : "reviews"})
                        </Typography>
                      </Box>
                      <Box>
                        {destinations.map((destination, destIndex) => {
                          const etaKey = `etaTo${destination.name.replace(/\s+/g, "")}`;
                          const eta = listing[etaKey] || { distance: "N/A", duration: "N/A" };
                          return (
                            <Box key={destIndex} sx={{ mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>From Airbnb → {destination.name}</strong>
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Distance: {eta.distance}
                              </Typography>
                              {eta.duration !== "N/A" && eta.duration !== "0 minutes" && (
                                <Typography variant="body2" color="text.secondary">
                                  Estimated Duration: {eta.duration}
                                </Typography>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        handleOpenModal(
                          listing.description,
                          listing.lat,
                          listing.lng,
                          listing.accordionData,
                          listing.previewImages
                        )
                      }
                      sx={{
                        borderColor: "#ff385c",
                        color: "#ff385c",
                        "&:hover": { borderColor: "#e03852", backgroundColor: "rgba(255,56,92,0.04)" },
                      }}
                    >
                      View More
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        handleOpenAboutHostModal(
                          listing.hostAbout,
                          listing.hostName,
                          listing.hostProfilePicture,
                          listing.hostRatingHost,
                          listing.hostReviewsHost,
                          listing.isSuperhost,
                          listing.isVerified
                        )
                      }
                      sx={{
                        borderColor: "#ff385c",
                        color: "#ff385c",
                        "&:hover": { borderColor: "#e03852", backgroundColor: "rgba(255,56,92,0.04)" },
                      }}
                    >
                      About Host
                    </Button>
                    <Button
                      variant="contained"
                      component="a"
                      href={`https://www.airbnb.com/rooms/${listing.airbnbId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit Airbnb page for ${listing.listingTitle}`}
                      sx={{
                        backgroundColor: "#ff385c",
                        color: "#fff",
                        "&:hover": { backgroundColor: "#e03852" },
                      }}
                    >
                      Visit Airbnb Page
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={Math.ceil(listings.length / listingsPerPage)}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          </>
        )}
      </Collapse>

      {dataLoaded && !collapsed && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Button
            variant="contained"
            onClick={handleCollapse}
            sx={{
              backgroundColor: "#ff385c",
              color: "#fff",
              "&:hover": { backgroundColor: "#e03852" },
            }}
          >
            Collapse
          </Button>
        </Box>
      )}

      {dataLoaded && collapsed && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Button
            variant="contained"
            onClick={handleExpand}
            sx={{
              backgroundColor: "#ff385c",
              color: "#fff",
              "&:hover": { backgroundColor: "#e03852" },
            }}
          >
            View Airbnb Listings
          </Button>
        </Box>
      )}

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="description-modal-title"
        aria-describedby="description-modal-content"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", md: "80%" },
            maxWidth: 800,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Slider
              dots
              infinite
              speed={500}
              slidesToShow={1}
              slidesToScroll={1}
              adaptiveHeight
              arrows
              appendDots={(dots) => {
                const visibleDots = dots.slice(dotOffset, dotOffset + dotsPerGroup);
                return (
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mt: 2 }}>
                    {dotOffset > 0 && (
                      <Button onClick={() => setDotOffset(Math.max(dotOffset - dotsPerGroup, 0))} sx={{ minWidth: "auto", p: 0, mr: 2 }}>
                        &lt;
                      </Button>
                    )}
                    <Box component="ul" sx={{ display: "flex", p: 0, m: 0, listStyle: "none", gap: 1 }}>
                      {visibleDots}
                    </Box>
                    {dotOffset + dotsPerGroup < dots.length && (
                      <Button onClick={() => setDotOffset(Math.min(dotOffset + dotsPerGroup, dots.length - dotsPerGroup))} sx={{ minWidth: "auto", p: 0, ml: 2 }}>
                        &gt;
                      </Button>
                    )}
                  </Box>
                );
              }}
              customPaging={() => (
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "grey.400" }} />
              )}
              beforeChange={(current, next) => {
                const newGroup = Math.floor(next / dotsPerGroup);
                const newOffset = newGroup * dotsPerGroup;
                if (newOffset !== dotOffset) setDotOffset(newOffset);
              }}
            >
              {selectedImages.map((image, index) => (
                <Card key={index} sx={{ px: 1 }}>
                  <CardMedia
                    component="img"
                    image={image.baseUrl}
                    alt={image.accessibilityLabel || "Image"}
                    sx={{
                      height: isWideScreen ? 300 : 150,
                      objectFit: "cover",
                      borderRadius: 2,
                      boxShadow: 3,
                    }}
                  />
                </Card>
              ))}
            </Slider>
          </Box>
          <Typography id="description-modal-title" variant="h5" sx={{ fontWeight: 600 }}>
            Full Description
          </Typography>
          <Typography id="description-modal-content" sx={{ mt: 2 }} dangerouslySetInnerHTML={{ __html: selectedDescription }} />
          {selectedLat && selectedLng && (
            <Box sx={{ mt: 4 }}>
              <MapContainer center={[selectedLat, selectedLng]} zoom={15} style={{ height: "300px", width: "100%", mb: 2 }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                <Marker position={[selectedLat, selectedLng]} icon={markerIcon}>
                  <Popup>Airbnb Location</Popup>
                </Marker>
                {destinations.map((destination, index) => (
                  <Marker key={index} position={[destination.lat, destination.lon]} icon={markerIcon}>
                    <Popup>{destination.name}</Popup>
                  </Marker>
                ))}
                <Circle center={[selectedLat, selectedLng]} radius={482.8} pathOptions={{ color: "blue", fillColor: "lightblue", fillOpacity: 0.5 }} />
              </MapContainer>
              <Typography variant="body1" sx={{ textAlign: "center", fontStyle: "italic", mt: 2 }}>
                The Airbnb is located within this radius. The exact address will be shared with you after your booking is confirmed.
              </Typography>
            </Box>
          )}
          <Box sx={{ mt: 3 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>The Space</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" dangerouslySetInnerHTML={{ __html: selectedAccordionData?.theSpace || "Details about the space are not available." }} />
              </AccordionDetails>
            </Accordion>
            <Accordion sx={{ mt: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>Other Things to Note</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" dangerouslySetInnerHTML={{ __html: selectedAccordionData?.otherThings || "Details about other things to note are not available." }} />
              </AccordionDetails>
            </Accordion>
          </Box>
          <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
            <Button variant="contained" onClick={handleCloseModal} sx={{ backgroundColor: "#ff385c", color: "#fff", "&:hover": { backgroundColor: "#e03852" } }}>
              Close & Return
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={aboutHostOpen}
        onClose={handleCloseAboutHostModal}
        aria-labelledby="about-host-modal-title"
        aria-describedby="about-host-modal-content"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", md: "60%" },
            maxWidth: 600,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            {selectedHostProfilePicture && (
              <Avatar src={selectedHostProfilePicture} alt={selectedHostName} sx={{ width: 80, height: 80, mr: 2 }} />
            )}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>{selectedHostName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {hostYearsHosting()} {hostYearsHosting() === 1 ? "Year" : "Years"} Hosting
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            {isSuperhost && (
              <Tooltip title="Superhost">
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <StarIcon sx={{ color: "gold", mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">Superhost</Typography>
                </Box>
              </Tooltip>
            )}
            {isVerified && (
              <Tooltip title="Verified Host">
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <VerifiedUserIcon sx={{ color: "blue", mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">Verified</Typography>
                </Box>
              </Tooltip>
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Rating value={hostRatingHost} precision={0.1} readOnly />
            <Typography variant="body2" color="text.secondary">
              {hostRatingHost.toFixed(2)} ({hostReviewsHost} reviews)
            </Typography>
          </Box>
          <Typography id="about-host-modal-content" variant="body1" sx={{ whiteSpace: "pre-line" }}>
            {hostAboutText}
          </Typography>
          {hostAboutText === "Information not available" && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: "italic" }}>
              No additional information about the host is available at this time.
            </Typography>
          )}
          <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
            <Button variant="contained" onClick={handleCloseAboutHostModal} sx={{ backgroundColor: "#ff385c", color: "#fff", "&:hover": { backgroundColor: "#e03852" } }}>
              Close & Return
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );

  function listingYearsHosting() {
    const selectedListing = listings.find((listing) => listing.hostName === selectedHostName);
    return selectedListing ? selectedListing.yearsHosting : "0";
  }

  function hostYearsHosting() {
    const years = parseInt(listingYearsHosting(), 10);
    return isNaN(years) ? 0 : years;
  }
}

export default Airbnb;
