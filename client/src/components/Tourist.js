// File: Tourist.js

import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Autocomplete,
  TextField,
  Paper,
  Pagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
} from "@mui/material";
import "leaflet/dist/leaflet.css";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import L from "leaflet";
import "leaflet-fullscreen";
import "./Tourist.css";
import placesData from "./places.json";
import RoutingControl from "./RoutingControl";
import Airbnb from "./Airbnb"; // Your existing Airbnb component
import Hotel from "./Hotel";
import bgImage from "../img/TravelImg.jpg"; // Background image

// Fix for default Marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Helper functions
function formatDuration(duration) {
  if (!duration) return "";
  // Remove "0 hours" if present so that only minutes are visible
  return duration.replace(/^0 hours\s*/i, "").trim();
}

function mapOldCategoryToNew(oldCategory) {
  switch (oldCategory) {
    case "seasonal_event":
      return "seasonal_event";
    case "adventure":
    case "sports_games":
    case "unique_experience":
    case "unique_attraction":
      return "adventure_sports";
    case "history":
    case "art":
    case "specialty_museum":
      return "culture_history";
    case "nature":
    case "animals":
    case "nature_retreat":
      return "nature_animals";
    case "family":
    case "day_trip":
    case "local_hidden_gem":
    case "shopping_dining":
      return "family_leisure";
    default:
      return "family_leisure";
  }
}

function displayCategory(typeKey) {
  switch (typeKey) {
    case "nature_animals":
      return "Nature & Animals";
    case "adventure_sports":
      return "Adventure & Sports";
    case "culture_history":
      return "Culture & History";
    case "family_leisure":
      return "Family & Leisure";
    case "seasonal_event":
      return "Seasonal Event";
    default:
      return "Other";
  }
}

// Calculate distance between two coordinates in kilometers using the Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * FullscreenControl component - adds the Leaflet fullscreen control
 */
const FullscreenControl = () => {
  const map = useMap();
  useEffect(() => {
    const existingFullscreenControl = document.querySelector(
      ".leaflet-control-fullscreen-button"
    );
    if (!existingFullscreenControl) {
      L.control.fullscreen({ position: "topleft" }).addTo(map);
    }
  }, [map]);
  return null;
};

/**
 * MapCenterChanger component - pans the map when a location is selected
 */
const MapCenterChanger = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

const Tourist = () => {
  // States
  const [filter, setFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("closest");
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [etaData, setEtaData] = useState({});
  const [airbnbListings, setAirbnbListings] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [modalPlace, setModalPlace] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  // New state for expand/collapse of the Locations List; initially collapsed.
  const [listExpanded, setListExpanded] = useState(false);

  // Ref for Locations List to enable scrolling to it
  const listRef = useRef(null);
  // Ref for the selected marker to automatically open its popup
  const selectedMarkerRef = useRef(null);

  // Default map center
  const center = { lat: 29.553690332030882, lng: -98.37144804803549 };

  // Convert placesData from old categories to new 5 categories
  const updatedPlaces = placesData.map((p) => ({
    ...p,
    type: mapOldCategoryToNew(p.type),
  }));

  // Filter by category first
  const filteredPlaces =
    filter === "all"
      ? updatedPlaces
      : updatedPlaces.filter((place) => place.type === filter);

  // Autocomplete search uses the filtered list
  const searchOptions = filteredPlaces;

  // For the Locations List, further filter by search query (if any)
  const searchedLocations = searchQuery
    ? searchOptions.filter((place) =>
        place.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : searchOptions;

  // Clear selected place if filter changes
  useEffect(() => {
    setSelectedPlace(null);
  }, [filter]);

  // Get user's geolocation
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => console.error("Error fetching user location:", err)
    );
  }, []);

  // Fetch Airbnb listings
  useEffect(() => {
    fetch("/api/airbnb-listings")
      .then((res) => res.json())
      .then((data) => {
        const fetched = data.message || [];
        const validAirbnbs = fetched.filter((l) => l.latitude && l.longitude);
        setAirbnbListings(validAirbnbs);
      })
      .catch((err) => console.error("Failed to load Airbnb listings:", err));
  }, []);

  // Recompute ETAs whenever userLocation or filter changes
  useEffect(() => {
    if (!userLocation) return;
    filteredPlaces.forEach((place) => fetchETA(place));
  }, [userLocation, filter]);

  // Fetch ETA from server
  const fetchETA = async (destination) => {
    if (!userLocation) return;
    try {
      const res = await fetch(
        `/api/eta?originLat=${userLocation.lat}&originLon=${userLocation.lng}&destLat=${destination.lat}&destLon=${destination.lon}`
      );
      const data = await res.json();
      if (res.ok) {
        setEtaData((prev) => ({ ...prev, [destination.id]: data }));
      } else {
        console.error("Error fetching ETA:", data.error);
      }
    } catch (e) {
      console.error("Error fetching ETA:", e);
    }
  };

  // Handle marker click or search selection
  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
  };

  // When a search result is selected, open its popup automatically
  useEffect(() => {
    if (selectedPlace && selectedMarkerRef.current) {
      selectedMarkerRef.current.openPopup();
    }
  }, [selectedPlace]);

  // Pagination logic
  const totalPages = Math.ceil(searchedLocations.length / itemsPerPage);
  const sortedLocations = userLocation
    ? [...searchedLocations].sort((a, b) => {
        const dA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lon);
        const dB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lon);
        return sortOrder === "closest" ? dA - dB : dB - dA;
      })
    : searchedLocations;
  const currentItems = sortedLocations.slice(
    (page - 1) * itemsPerPage,
    (page - 1) * itemsPerPage + itemsPerPage
  );
  
  const handleChangePage = (event, value) => {
    setPage(value);
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div>
      {/* Header Section */}
      <div
        style={{
          height: "900px",
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          textShadow: "2px 2px 5px rgba(0, 0, 0, 0.7)",
          fontFamily: "'Sacramento', cursive",
        }}
      >
        <h1
          style={{
            fontSize: "5rem",
            margin: "0",
            textAlign: "center",
            letterSpacing: "2px",
            fontFamily: "'Sacramento', cursive",
            color: "#fff",
          }}
        >
          Travel Page
        </h1>
        <p
          style={{
            fontSize: "2rem",
            marginTop: "10px",
            textAlign: "center",
            maxWidth: "600px",
            lineHeight: "1.6",
          }}
        >
          Explore San Antonio and discover amazing places to stay & visit.
        </p>
      </div>

      {/* Airbnb & Hotel Buttons */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          margin: "20px auto",
          width: "90%",
          maxWidth: "600px",
          alignItems: "center",
        }}
      >
        <Airbnb />
        <Hotel />
      </Box>

      {/* Category Filter Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#f9f9f9",
          borderRadius: "12px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          maxWidth: "500px",
          margin: "0 auto",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, marginBottom: "10px", color: "#333" }}>
          Filter by Category:
        </Typography>
        <FormControl fullWidth sx={{ maxWidth: "400px" }}>
          <InputLabel id="filter-label">Category</InputLabel>
          <Select
            labelId="filter-label"
            id="filter"
            value={filter}
            label="Category"
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="adventure_sports">Adventure & Sports</MenuItem>
            <MenuItem value="culture_history">Culture & History</MenuItem>
            <MenuItem value="nature_animals">Nature & Animals</MenuItem>
            <MenuItem value="family_leisure">Family & Leisure</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Sort Order Dropdown */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#f9f9f9",
          borderRadius: "12px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          maxWidth: "500px",
          margin: "0 auto",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, marginBottom: "10px", color: "#333" }}>
          Sort by:
        </Typography>
        <FormControl fullWidth sx={{ maxWidth: "400px" }}>
          <InputLabel id="sort-label">Sort Order</InputLabel>
          <Select
            labelId="sort-label"
            id="sort"
            value={sortOrder}
            label="Sort Order"
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <MenuItem value="closest">Closest to your location</MenuItem>
            <MenuItem value="furthest">Furthest from your location</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Autocomplete Search Section with extra vertical spacing */}
      <Box
        sx={{
          maxWidth: "500px",
          margin: "0 auto",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <Autocomplete
          options={searchOptions}
          getOptionLabel={(option) => option.name}
          inputValue={searchQuery}
          onInputChange={(event, newInputValue) => setSearchQuery(newInputValue)}
          onChange={(event, value) => {
            if (value) {
              handleSelectPlace(value);
              // Force pagination to page 1 when a search result is clicked
              setPage(1);
            }
          }}
          renderInput={(params) => (
            <TextField {...params} label="Search Locations" variant="outlined" />
          )}
        />
      </Box>

      {/* Expand/Collapse Locations List Button and Listing Component */}
      <Box sx={{ maxWidth: "800px", margin: "20px auto", padding: "15px" }}>
        {/* Top Toggle Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={() => setListExpanded(!listExpanded)}
          sx={{
            mb: 2,
            background: "linear-gradient(135deg, #6a11cb, #2575fc)",
            color: "#fff",
            textTransform: "none",
          }}
        >
          {listExpanded ? "Collapse Locations List" : "Expand Locations List"}
        </Button>
        <Collapse in={listExpanded} timeout="auto" unmountOnExit>
          <Box ref={listRef}>
            <Typography
              variant="h5"
              sx={{ marginBottom: "15px", fontWeight: "bold", textAlign: "center" }}
            >
              Locations List
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {currentItems.map((place) => (
                <Paper
                  key={place.id}
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    padding: { xs: "10px", sm: "10px" },
                    gap: { xs: "10px", sm: "15px" },
                    borderRadius: "8px",
                    width: "100%",
                  }}
                >
                  {place.image ? (
                    <Box sx={{ width: { xs: "100%", sm: "100px" } }}>
                      <img
                        src={place.image}
                        alt={place.name}
                        style={{ width: "100%", height: "auto", borderRadius: "8px" }}
                      />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: { xs: "100%", sm: "100px" },
                        height: { xs: "auto", sm: "80px" },
                        backgroundColor: "#ccc",
                        borderRadius: "8px",
                      }}
                    />
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      {place.name}
                    </Typography>
                    {userLocation && (
                      <>
                        <Typography variant="body2" sx={{ color: "#555" }}>
                          Distance:{" "}
                          {(
                            calculateDistance(
                              userLocation.lat,
                              userLocation.lng,
                              place.lat,
                              place.lon
                            ) * 0.621371
                          ).toFixed(2)}{" "}
                          miles
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#555" }}>
                          ETA: {etaData[place.id] ? formatDuration(etaData[place.id].duration) : "N/A"}
                        </Typography>
                      </>
                    )}
                    <Typography variant="body2" sx={{ color: "#555" }}>
                      Category: {displayCategory(place.type)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "column" },
                      gap: "5px",
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        background: "linear-gradient(135deg, #6a11cb, #2575fc)",
                        color: "#fff",
                        textTransform: "none",
                        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #2575fc, #6a11cb)",
                        },
                      }}
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`,
                          "_blank"
                        )
                      }
                    >
                      Get Directions
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{
                        color: "#6a11cb",
                        borderColor: "#6a11cb",
                        textTransform: "none",
                      }}
                      onClick={() => {
                        setModalPlace(place);
                        setOpenModal(true);
                      }}
                    >
                      View Details
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
              <Pagination count={totalPages} page={page} onChange={handleChangePage} color="primary" />
            </Box>
            {/* Bottom Collapse Button */}
            <Box sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => setListExpanded(false)}
                sx={{
                  background: "linear-gradient(135deg, #6a11cb, #2575fc)",
                  color: "#fff",
                  textTransform: "none",
                }}
              >
                Collapse Locations List
              </Button>
            </Box>
          </Box>
        </Collapse>
      </Box>

      {/* Map Section */}
      <div className="flex-container">
        <div className="map-section">
          <MapContainer
            center={[center.lat, center.lng]}
            zoom={12}
            className="map-container"
            style={{ height: "700px", width: "100%" }}
            fullscreenControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <FullscreenControl />
            {selectedPlace && (
              <MapCenterChanger center={[selectedPlace.lat, selectedPlace.lon]} zoom={14} />
            )}
            {userLocation && (
              <Marker
                position={[userLocation.lat, userLocation.lng]}
                icon={
                  new L.Icon({
                    iconUrl: "https://cdn-icons-png.flaticon.com/256/0/619.png",
                    iconSize: [40, 40],
                    iconAnchor: [20, 40],
                    popupAnchor: [0, -40],
                  })
                }
              >
                <Tooltip permanent>Your Current Location</Tooltip>
              </Marker>
            )}
            <Marker
              position={[29.63717945364847, -98.31090798995758]}
              icon={
                new L.Icon({
                  iconUrl: "https://freesvg.org/img/map-pin.png",
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                })
              }
            >
              <Tooltip permanent>The Club at Garden Ridge - The Venue</Tooltip>
            </Marker>
            <Marker
              position={[29.56512967904875, -98.49049598737209]}
              icon={
                new L.Icon({
                  iconUrl: "https://freesvg.org/img/map-pin.png",
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                })
              }
            >
              <Tooltip permanent>First Assembly of God at San Antonio - The Ceremony</Tooltip>
            </Marker>
            {selectedPlace ? (
              <Marker
                key={selectedPlace.id}
                position={[selectedPlace.lat, selectedPlace.lon]}
                ref={selectedMarkerRef}
                eventHandlers={{
                  click: () => handleSelectPlace(selectedPlace),
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  {selectedPlace.name}
                </Tooltip>
                <Popup>
                  <strong
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: "700",
                      fontFamily: "'Roboto Slab', serif",
                      color: "#1a73e8",
                      marginBottom: "8px",
                      display: "block",
                      textAlign: "center",
                      textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    {selectedPlace.name}
                  </strong>
                  <div
                    style={{
                      fontSize: "1rem",
                      fontWeight: "500",
                      fontFamily: "'Open Sans', sans-serif",
                      color: "#4a4a4a",
                      lineHeight: "1.6",
                      textAlign: "left",
                      marginTop: "5px",
                    }}
                  >
                    <span style={{ display: "block", marginBottom: "5px" }}>
                      <strong style={{ color: "#000", fontWeight: "600" }}>
                        Type:
                      </strong>{" "}
                      {displayCategory(selectedPlace.type)}
                    </span>
                    {etaData[selectedPlace.id] && (
                      <>
                        <span style={{ display: "block", marginBottom: "5px" }}>
                          <strong style={{ color: "#000", fontWeight: "600" }}>
                            ETA:
                          </strong>{" "}
                          {formatDuration(etaData[selectedPlace.id].duration)}
                        </span>
                        <span style={{ display: "block" }}>
                          <strong style={{ color: "#000", fontWeight: "600" }}>
                            Distance:
                          </strong>{" "}
                          {etaData[selectedPlace.id].distance}
                        </span>
                      </>
                    )}
                  </div>
                  <Button
                    variant="contained"
                    sx={{
                      fontSize: "0.9rem",
                      color: "#ffffff",
                      background: "linear-gradient(135deg, #6a11cb, #2575fc)",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      textTransform: "none",
                      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                      transition: "background 0.3s ease-in-out, transform 0.2s",
                      border: "none",
                      cursor: "pointer",
                      mb: 1,
                    }}
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lon}`,
                        "_blank"
                      )
                    }
                  >
                    Get Directions
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{
                      fontSize: "0.9rem",
                      color: "#6a11cb",
                      borderColor: "#6a11cb",
                      textTransform: "none",
                    }}
                    onClick={() => {
                      setModalPlace(selectedPlace);
                      setOpenModal(true);
                    }}
                  >
                    View Details
                  </Button>
                </Popup>
              </Marker>
            ) : (
              filteredPlaces.map((place) => (
                <Marker
                  key={place.id}
                  position={[place.lat, place.lon]}
                  eventHandlers={{
                    click: () => handleSelectPlace(place),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                    {place.name}
                  </Tooltip>
                  <Popup>
                    <strong
                      style={{
                        fontSize: "1.3rem",
                        fontWeight: "700",
                        fontFamily: "'Roboto Slab', serif",
                        color: "#1a73e8",
                        marginBottom: "8px",
                        display: "block",
                        textAlign: "center",
                        textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)",
                      }}
                    >
                      {place.name}
                    </strong>
                    <div
                      style={{
                        fontSize: "1rem",
                        fontWeight: "500",
                        fontFamily: "'Open Sans', sans-serif",
                        color: "#4a4a4a",
                        lineHeight: "1.6",
                        textAlign: "left",
                        marginTop: "5px",
                      }}
                    >
                      <span style={{ display: "block", marginBottom: "5px" }}>
                        <strong style={{ color: "#000", fontWeight: "600" }}>
                          Type:
                        </strong>{" "}
                        {displayCategory(place.type)}
                      </span>
                      {etaData[place.id] && (
                        <>
                          <span style={{ display: "block", marginBottom: "5px" }}>
                            <strong style={{ color: "#000", fontWeight: "600" }}>
                              ETA:
                            </strong>{" "}
                            {formatDuration(etaData[place.id].duration)}
                          </span>
                          <span style={{ display: "block" }}>
                            <strong style={{ color: "#000", fontWeight: "600" }}>
                              Distance:
                            </strong>{" "}
                            {etaData[place.id].distance}
                          </span>
                        </>
                      )}
                    </div>
                    <Button
                      variant="contained"
                      sx={{
                        fontSize: "0.9rem",
                        color: "#ffffff",
                        background: "linear-gradient(135deg, #6a11cb, #2575fc)",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        textTransform: "none",
                        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                        transition: "background 0.3s ease-in-out, transform 0.2s",
                        border: "none",
                        cursor: "pointer",
                        mb: 1,
                      }}
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`,
                          "_blank"
                        )
                      }
                    >
                      Get Directions
                    </Button>
                    <Button
                      variant="outlined"
                      sx={{
                        fontSize: "0.9rem",
                        color: "#6a11cb",
                        borderColor: "#6a11cb",
                        textTransform: "none",
                      }}
                      onClick={() => {
                        setModalPlace(place);
                        setOpenModal(true);
                      }}
                    >
                      View Details
                    </Button>
                  </Popup>
                </Marker>
              ))
            )}
            {selectedPlace && userLocation && (
              <RoutingControl
                userLocation={userLocation}
                destination={selectedPlace}
                routerOptions={{ showAlternatives: false }}
                lineOptions={{
                  extendToWaypoints: false,
                  addWaypoints: false,
                  draggableWaypoints: false,
                }}
              />
            )}
          </MapContainer>
        </div>
      </div>

      {/* Modal for View Details */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        {modalPlace && (
          <>
            <DialogTitle>{modalPlace.name}</DialogTitle>
            <DialogContent dividers>
              {modalPlace.image && (
                <Box sx={{ width: "100%", mb: 2 }}>
                  <img
                    src={modalPlace.image}
                    alt={modalPlace.name}
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                </Box>
              )}
              <Typography variant="body1" sx={{ mb: 2 }}>
                {modalPlace.description}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Category: {displayCategory(modalPlace.type)}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                variant="contained"
                sx={{
                  background: "linear-gradient(135deg, #6a11cb, #2575fc)",
                  color: "#fff",
                  textTransform: "none",
                }}
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${modalPlace.lat},${modalPlace.lon}`,
                    "_blank"
                  )
                }
              >
                Get Directions
              </Button>
              <Button
                onClick={() => setOpenModal(false)}
                variant="outlined"
                sx={{
                  textTransform: "none",
                  color: "#6a11cb",
                  borderColor: "#6a11cb",
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
};

export default Tourist;