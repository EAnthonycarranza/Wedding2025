// File: Hotel.js

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Collapse,
  Rating,
  Modal,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Marker icon for the map
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Fixed destination coordinates
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

const Hotel = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [selectedLat, setSelectedLat] = useState(null);
  const [selectedLng, setSelectedLng] = useState(null);
  const [listings, setListings] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCollapse = () => {
    setCollapsed(true);
  };

  const handleExpand = () => {
    setCollapsed(false);
  };

  const handleOpenModal = (description, lat, lng) => {
    setSelectedDescription(description);
    setSelectedLat(lat);
    setSelectedLng(lng);
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  useEffect(() => {
    const fetchAndEnrichListings = async () => {
      setLoading(true);
      setTimeout(() => {
        const listingsData = [
          {
            airbnbId: "hotel1",
            title: "Drury Inn & Suites San Antonio North Stone Oak",
            description:
              "Drury Inn & Suites San Antonio North Stone Oak is in a suburb north of San Antonio. Visitors enjoy Hill Country winery tours and upscale shopping at nearby La Cantera. Free hot breakfast is served daily as well as free hot food and cold beverages at our evening 5:30 Kickback®.",
            rating: 4.6,
            lat: 29.610849774499812,
            lng: -98.48206093558174,
            hotelUrl: "https://www.druryhotels.com/locations/san-antonio-tx/drury-inn-and-suites-san-antonio-north-stone-oak",
            etaToFirstAssemblyofGodatSanAntonio: { distance: "5.2 miles", duration: "10 minutes" },
            etaToTheClubatGardenRidge: { distance: "11.8 miles", duration: "18 minutes" },
          },
          {
            airbnbId: "hotel2",
            title: "SpringHill Suites San Antonio Airport",
            description: "Redefine the concept of comfortable hotel living at the SpringHill Suites San Antonio Airport. We offer everything you need for a relaxing and invigorating stay, including free WiFi, complimentary shuttle service to and from San Antonio International Airport and free full hot breakfast buffet every morning.",
            rating: 3.8,
            lat: 29.518390716869536,
            lng: -98.47394591875964,
            hotelUrl: "https://www.marriott.com/en-us/hotels/satsa-springhill-suites-san-antonio-airport/overview/",
            etaToFirstAssemblyofGodatSanAntonio: { distance: "4.8 miles", duration: "12 minutes" },
            etaToTheClubatGardenRidge: { distance: "15.2 miles", duration: "22 minutes" },
          },
          {
            airbnbId: "hotel3",
            title: "TownePlace Suites San Antonio Universal City/Live Oak",
            description: "Our beautiful TownePlace Suites has golf course views and is perfect for families, groups or business travelers wanting an extended stay with all the comforts of home.",
            rating: 4.3,
            lat: 29.579334964537463,
            lng: -98.31348771928904,
            hotelUrl: "https://www.marriott.com/en-us/hotels/sattu-towneplace-suites-san-antonio-universal-city-live-oak/overview/",
            etaToFirstAssemblyofGodatSanAntonio: { distance: "12.5 miles", duration: "20 minutes" },
            etaToTheClubatGardenRidge: { distance: "4.2 miles", duration: "8 minutes" },
          },
          {
            airbnbId: "hotel4",
            title: "Hotel Valencia Riverwalk",
            description: "Hotel Valencia Riverwalk welcomes you to San Antonio with Mediterranean-inspired luxury and contemporary comfort. You’ll find our downtown luxury hotel tucked away along a quieter section of the city’s iconic River Walk.",
            rating: 4.4,
            lat: 29.4241,
            lng: -98.4936,
            hotelUrl: "https://www.hotelvalencia-riverwalk.com/",
            etaToFirstAssemblyofGodatSanAntonio: { distance: "9.8 miles", duration: "18 minutes" },
            etaToTheClubatGardenRidge: { distance: "16.5 miles", duration: "28 minutes" },
          },
        ];
        setListings(listingsData);
        setDataLoaded(true);
        setLoading(false);
      }, 800);
    };

    fetchAndEnrichListings();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: "800px", margin: "auto", mt: 4, px: 2 }}>
        <Alert severity="error">Error: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: "800px", margin: "auto", mt: 4, px: 2, width: "100%" }}>
      {dataLoaded && collapsed && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <Button 
            variant="contained" 
            onClick={handleExpand}
            fullWidth
            sx={{
              backgroundColor: "#1a73e8",
              color: "#fff",
              py: 1.5,
              borderRadius: "8px",
              textTransform: "none",
              fontSize: "1.1rem",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#1557b0" },
            }}
          >
            View Hotel Listings
          </Button>
        </Box>
      )}

      <Collapse in={!collapsed} timeout="auto" unmountOnExit>
        {dataLoaded && (
          <>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
              <Button 
                variant="outlined" 
                onClick={handleCollapse}
                sx={{
                  borderColor: "#1a73e8",
                  color: "#1a73e8",
                  textTransform: "none",
                  "&:hover": { borderColor: "#1557b0", backgroundColor: "rgba(26,115,232,0.04)" },
                }}
              >
                Hide Hotel Listings
              </Button>
            </Box>

            {listings.map((listing, index) => (
              <Card 
                key={listing.airbnbId} 
                sx={{ 
                  mb: 4,
                  borderRadius: "16px",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                  borderLeft: "8px solid #1a73e8",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "translateY(-4px)" }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: "bold", color: "#222", mb: 1 }}>
                    {listing.title}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Rating value={listing.rating} precision={0.1} readOnly size="small" />
                    <Typography variant="body2" sx={{ ml: 1, fontWeight: "bold" }}>
                      {listing.rating.toFixed(2)}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mt: 2 }}>
                    {destinations.map((destination, destIndex) => {
                      const etaKey = `etaTo${destination.name.replace(/\s+/g, "")}`;
                      const eta = listing[etaKey] || { distance: "N/A", duration: "N/A" };
                      return (
                        <Box key={destIndex} sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                          <InfoIcon sx={{ color: "#1a73e8", fontSize: "1.2rem" }} />
                          <Typography variant="body2">
                            <strong>{destination.name}:</strong> {eta.distance} • {eta.duration}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 2 }}>
                    <Button
                      variant="outlined"
                      sx={{
                        flex: 1,
                        borderColor: "#222",
                        color: "#222",
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: "bold",
                        "&:hover": { borderColor: "#000", backgroundColor: "#f0f0f0" },
                      }}
                      onClick={() =>
                        handleOpenModal(
                          listing.description,
                          listing.lat,
                          listing.lng
                        )
                      }
                    >
                      View More
                    </Button>

                    <Button
                      variant="contained"
                      href={listing.hotelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        flex: 1.5,
                        backgroundColor: "#1a73e8",
                        color: "#fff",
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: "bold",
                        "&:hover": { backgroundColor: "#1557b0" },
                      }}
                    >
                      Visit Hotel
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}

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
          </>
        )}
      </Collapse>

      <Modal open={modalOpen} onClose={handleCloseModal}>
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
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
            Hotel Details
          </Typography>
          
          <Typography
            sx={{ mb: 4, lineHeight: 1.7, color: "#444" }}
            dangerouslySetInnerHTML={{ __html: selectedDescription }}
          ></Typography>

          {selectedLat && selectedLng && (
            <Box sx={{ mt: 4, borderRadius: "12px", overflow: "hidden", border: "1px solid #ddd" }}>
              <MapContainer center={[selectedLat, selectedLng]} zoom={15} style={{ height: "300px", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                <Marker position={[selectedLat, selectedLng]} icon={markerIcon}>
                  <Popup>Hotel Location</Popup>
                </Marker>
                {destinations.map((destination, index) => (
                  <Marker key={index} position={[destination.lat, destination.lon]} icon={markerIcon}>
                    <Popup>{destination.name}</Popup>
                  </Marker>
                ))}
              </MapContainer>
            </Box>
          )}

          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              onClick={handleCloseModal}
              sx={{ backgroundColor: "#222", color: "#fff", px: 6, py: 1, borderRadius: "8px", "&:hover": { backgroundColor: "#000" } }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Hotel;
