// File: Airbnb.js

import React, { useState, useEffect, useRef } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Card,
  CardContent,
  Typography,
  Rating,
  Button,
  Modal,
  Pagination,
  Tooltip,
  Collapse,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BedIcon from "@mui/icons-material/Bed";
import KingBedIcon from "@mui/icons-material/KingBed";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import GroupIcon from "@mui/icons-material/Group";
import StarIcon from "@mui/icons-material/Star";
import BathtubIcon from "@mui/icons-material/Bathtub";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import InfoIcon from "@mui/icons-material/Info";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Loading from "./Loading";

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
      listingTitle: "Elegant Historic Home near Riverwalk",
      maxGuestCapacity: "6",
      roomType: "Entire home",
      pricePerNight: "$150",
      hostName: "Sarah",
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
      listingTitle: "Modern Loft with Skyline Views",
      maxGuestCapacity: "4",
      roomType: "Entire loft",
      pricePerNight: "$120",
      hostName: "Michael",
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
  const [selectedAccordionData, setSelectedAccordionData] = useState({
    theSpace: null,
    otherThings: null,
  });
  const [aboutHostOpen, setAboutHostOpen] = useState(false);
  const [hostAboutText, setHostAboutText] = useState("");
  const [selectedHostName, setSelectedHostName] = useState("");
  const [hostRatingHost, setHostRatingHost] = useState(0);
  const [hostReviewsHost, setHostReviewsHost] = useState("0");
  const [isSuperhost, setIsSuperhost] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

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

  const fetchListings = () => {
    setLoading(true);
    setTimeout(() => {
      setListings(mockListings);
      setDataLoaded(true);
      setLoading(false);
    }, 800);
  };

  const handleOpenModal = (description, lat, lng, accordionData) => {
    setSelectedDescription(description);
    setSelectedLat(lat);
    setSelectedLng(lng);
    setSelectedAccordionData(accordionData);
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  const handleOpenAboutHostModal = (
    aboutText,
    hostName,
    ratingHost,
    reviewsHost,
    superhostStatus,
    verifiedStatus
  ) => {
    const decodedAboutText = decodeHtml(aboutText);
    setHostAboutText(decodedAboutText);
    setSelectedHostName(hostName);
    setHostRatingHost(ratingHost);
    setHostReviewsHost(reviewsHost);
    setIsSuperhost(superhostStatus);
    setIsVerified(verifiedStatus);
    setAboutHostOpen(true);
  };

  const handleCloseAboutHostModal = () => setAboutHostOpen(false);

  const indexOfLastListing = currentPage * listingsPerPage;
  const indexOfFirstListing = indexOfLastListing - listingsPerPage;
  const currentListings = listings.slice(indexOfFirstListing, indexOfLastListing);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    if (topRef.current) {
      const topOffset = topRef.current.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

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
      <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", flexDirection: "row", p: 2 }}>
        <Loading />
      </Box>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  function listingYearsHosting() {
    const selectedListing = listings.find((listing) => listing.hostName === selectedHostName);
    return selectedListing ? selectedListing.yearsHosting : "0";
  }

  function hostYearsHosting() {
    const years = parseInt(listingYearsHosting(), 10);
    return isNaN(years) ? 0 : years;
  }

  return (
    <Box ref={topRef} sx={{ width: "100%" }}>
      {!dataLoaded && (
        <Button
          variant="contained"
          onClick={fetchListings}
          fullWidth
          sx={{
            mb: 4,
            backgroundColor: "#ff385c",
            color: "#fff",
            py: 1.5,
            borderRadius: "8px",
            textTransform: "none",
            fontSize: "1.1rem",
            fontWeight: "bold",
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
                variant="outlined"
                onClick={handleCollapse}
                sx={{
                  borderColor: "#ff385c",
                  color: "#ff385c",
                  textTransform: "none",
                  "&:hover": { borderColor: "#e03852", backgroundColor: "rgba(255,56,92,0.04)" },
                }}
              >
                Hide Airbnb Listings
              </Button>
            </Box>
            {currentListings.map((listing, index) => (
              <Card 
                key={index} 
                sx={{ 
                  mb: 4, 
                  borderRadius: "16px", 
                  boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                  borderLeft: "8px solid #ff385c",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "translateY(-4px)" }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: "bold", color: "#222", mb: 0.5 }}>
                        {listing.listingTitle}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                        {listing.roomType} in San Antonio
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#ff385c" }}>
                      {listing.pricePerNight} <Typography component="span" variant="body2" color="text.secondary">/ night</Typography>
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      mt: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <GroupIcon fontSize="small" sx={{ color: "#717171", mr: 0.5 }} />
                      <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                        {listing.maxGuestCapacity} {listing.maxGuestCapacity === "1" ? "Guest" : "Guests"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <KingBedIcon fontSize="small" sx={{ color: "#717171", mr: 0.5 }} />
                      <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                        {listing.bedrooms} {listing.bedrooms === "1" ? "Bedroom" : "Bedrooms"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <BedIcon fontSize="small" sx={{ color: "#717171", mr: 0.5 }} />
                      <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                        {listing.beds} {listing.beds === "1" ? "Bed" : "Beds"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <BathtubIcon fontSize="small" sx={{ color: "#717171", mr: 0.5 }} />
                      <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                        {listing.baths} {listing.baths === "1" ? "Bath" : "Baths"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mt: 3,
                      p: 2,
                      bgcolor: "#f7f7f7",
                      borderRadius: "12px",
                      flexWrap: "wrap",
                      gap: 2
                    }}
                  >
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        Host: {listing.hostName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {listing.yearsHosting} {listing.yearsHosting === "1" ? "Year" : "Years"} Hosting
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                        <Typography variant="h6" sx={{ mr: 1 }}>{listing.hostRating.toFixed(2)}</Typography>
                        <Rating value={listing.hostRating || 0} precision={0.1} readOnly size="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        ({listing.hostReviews} reviews)
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    {destinations.map((destination, destIndex) => {
                      const etaKey = `etaTo${destination.name.replace(/\s+/g, "")}`;
                      const eta = listing[etaKey] || { distance: "N/A", duration: "N/A" };
                      return (
                        <Box key={destIndex} sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                          <InfoIcon sx={{ color: "#ff385c", fontSize: "1.2rem" }} />
                          <Typography variant="body2">
                            <strong>{destination.name}:</strong> {eta.distance} • {eta.duration}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>

                  <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        handleOpenModal(
                          listing.description,
                          listing.lat,
                          listing.lng,
                          listing.accordionData
                        )
                      }
                      sx={{
                        flex: 1,
                        borderColor: "#222",
                        color: "#222",
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: "bold",
                        "&:hover": { borderColor: "#000", backgroundColor: "#f0f0f0" },
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
                          listing.hostRatingHost,
                          listing.hostReviewsHost,
                          listing.isSuperhost,
                          listing.isVerified
                        )
                      }
                      sx={{
                        flex: 1,
                        borderColor: "#222",
                        color: "#222",
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: "bold",
                        "&:hover": { borderColor: "#000", backgroundColor: "#f0f0f0" },
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
                      sx={{
                        flex: { xs: "1 1 100%", sm: 1.5 },
                        backgroundColor: "#ff385c",
                        color: "#fff",
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: "bold",
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
              backgroundColor: "#222",
              color: "#fff",
              textTransform: "none",
              px: 4,
              "&:hover": { backgroundColor: "#000" },
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
              textTransform: "none",
              px: 4,
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
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95%", md: "80%" },
            maxWidth: 800,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: "16px",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Typography id="description-modal-title" variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
            Property Details
          </Typography>
          
          <Typography sx={{ mb: 4, lineHeight: 1.7, color: "#444" }}>
            {selectedDescription}
          </Typography>

          {selectedLat && selectedLng && (
            <Box sx={{ mt: 4, borderRadius: "12px", overflow: "hidden", border: "1px solid #ddd" }}>
              <MapContainer center={[selectedLat, selectedLng]} zoom={15} style={{ height: "300px", width: "100%" }}>
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
              <Box sx={{ p: 2, bgcolor: "#f9f9f9" }}>
                <Typography variant="body2" sx={{ textAlign: "center", fontStyle: "italic" }}>
                  Approximate location. Exact address provided after booking.
                </Typography>
              </Box>
            </Box>
          )}

          <Box sx={{ mt: 4 }}>
            <Accordion sx={{ boxShadow: "none", border: "1px solid #eee", mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: "bold" }}>The Space</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  {selectedAccordionData?.theSpace || "Details about the space are not available."}
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion sx={{ boxShadow: "none", border: "1px solid #eee" }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: "bold" }}>Other Things to Note</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  {selectedAccordionData?.otherThings || "Details about other things to note are not available."}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>

          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Button variant="contained" onClick={handleCloseModal} sx={{ backgroundColor: "#222", color: "#fff", px: 6, py: 1, borderRadius: "8px", "&:hover": { backgroundColor: "#000" } }}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={aboutHostOpen}
        onClose={handleCloseAboutHostModal}
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
            borderRadius: "16px",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>Meet {selectedHostName}</Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {hostYearsHosting()} {hostYearsHosting() === 1 ? "Year" : "Years"} Hosting
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3, p: 2, bgcolor: "#f7f7f7", borderRadius: "12px" }}>
            {isSuperhost && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <StarIcon sx={{ color: "gold", mr: 0.5 }} />
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>Superhost</Typography>
              </Box>
            )}
            {isVerified && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <VerifiedUserIcon sx={{ color: "blue", mr: 0.5 }} />
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>Verified</Typography>
              </Box>
            )}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Rating value={hostRatingHost} precision={0.1} readOnly size="small" />
              <Typography variant="body2" sx={{ ml: 1, fontWeight: "bold" }}>{hostRatingHost.toFixed(2)}</Typography>
            </Box>
          </Box>

          <Typography variant="body1" sx={{ whiteSpace: "pre-line", lineHeight: 1.6 }}>
            {hostAboutText}
          </Typography>
          
          {hostAboutText === "Information not available" && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: "italic" }}>
              No additional information about the host is available.
            </Typography>
          )}

          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Button variant="contained" onClick={handleCloseAboutHostModal} sx={{ backgroundColor: "#222", color: "#fff", px: 6, borderRadius: "8px", "&:hover": { backgroundColor: "#000" } }}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

export default Airbnb;
