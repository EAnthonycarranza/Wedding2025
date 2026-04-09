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
  // Mock data for Airbnb listings
  const mockListings = [
    {
      airbnbId: "1",
      thumbnail: "https://a0.muscache.com/im/pictures/miso/hosting-46699110/original/99a67460-b72c-4dc3-bcaf-50d424d057ff.jpeg",
      previewImages: [
        { baseUrl: "https://a0.muscache.com/im/pictures/miso/hosting-46699110/original/99a67460-b72c-4dc3-bcaf-50d424d057ff.jpeg", accessibilityLabel: "Living Room" },
        { baseUrl: "https://a0.muscache.com/im/pictures/miso/hosting-46699110/original/12398412-2342-4234-2342-234234234234.jpeg", accessibilityLabel: "Bedroom" },
      ],
      listingTitle: "Elegant Historic Home near Riverwalk",
      maxGuestCapacity: "6",
      roomType: "Entire home",
      pricePerNight: "$150",
      hostName: "Sarah",
      hostProfilePicture: "https://a0.muscache.com/im/pictures/user/12345678/original/abcdef.jpeg",
      hostRating: 4.95,
      hostReviews: "124",
      hostAbout: "I love hosting travelers and sharing the beauty of San Antonio!",
      yearsHosting: "5",
      description: "A beautiful historic home with modern amenities, located just minutes from the famous San Antonio Riverwalk. Perfect for families or groups attending special events.",
      accordionData: {
        theSpace: "Spacious living area, fully equipped kitchen, and a cozy backyard garden.",
        otherThings: "Free parking available on site. Quiet hours after 10 PM.",
      },
      lat: 29.4241,
      lng: -98.4936,
      beds: "4",
      baths: "2",
      bedrooms: "3",
      hostRatingHost: 4.95,
      hostReviewsHost: "124",
      isSuperhost: true,
      isVerified: true,
      etaToFirstAssemblyofGodatSanAntonio: { distance: "8.5 miles", duration: "15 minutes" },
      etaToTheClubatGardenRidge: { distance: "12.2 miles", duration: "22 minutes" },
    },
    {
      airbnbId: "2",
      thumbnail: "https://a0.muscache.com/im/pictures/5027a548-ba99-4aac-ad2d-ee5e8f2ad58e.jpg",
      previewImages: [
        { baseUrl: "https://a0.muscache.com/im/pictures/5027a548-ba99-4aac-ad2d-ee5e8f2ad58e.jpg", accessibilityLabel: "Modern Loft Interior" },
      ],
      listingTitle: "Modern Loft with Skyline Views",
      maxGuestCapacity: "4",
      roomType: "Entire loft",
      pricePerNight: "$120",
      hostName: "Michael",
      hostProfilePicture: "https://a0.muscache.com/im/pictures/user/87654321/original/fedcba.jpeg",
      hostRating: 4.88,
      hostReviews: "89",
      hostAbout: "Urban dweller and tech enthusiast. Welcome to my loft!",
      yearsHosting: "3",
      description: "Enjoy stunning views of the San Antonio skyline from this sleek, modern loft. Located in the heart of the Pearl District, close to dining and shopping.",
      accordionData: {
        theSpace: "Open floor plan with high ceilings and floor-to-ceiling windows.",
        otherThings: "Walking distance to numerous cafes and boutiques.",
      },
      lat: 29.4150,
      lng: -98.4850,
      beds: "2",
      baths: "1",
      bedrooms: "1",
      hostRatingHost: 4.88,
      hostReviewsHost: "89",
      isSuperhost: false,
      isVerified: true,
      etaToFirstAssemblyofGodatSanAntonio: { distance: "9.2 miles", duration: "18 minutes" },
      etaToTheClubatGardenRidge: { distance: "14.5 miles", duration: "25 minutes" },
    }
  ];

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

  // Instead of fetching, just use mock data
  const fetchListings = () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setListings(mockListings);
      setDataLoaded(true);
      setLoading(false);
    }, 800);
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
                  <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
                    {listing.pricePerNight} / night
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
