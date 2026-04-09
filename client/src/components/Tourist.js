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
import Airbnb from "./Airbnb";
import Hotel from "./Hotel";
import bgImage from "../img/TravelImg.jpg";

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

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
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
  const [filter, setFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("closest");
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [etaData, setEtaData] = useState({});
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [modalPlace, setModalPlace] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [listExpanded, setListExpanded] = useState(false);

  const listRef = useRef(null);
  const center = { lat: 29.553690332030882, lng: -98.37144804803549 };

  const updatedPlaces = placesData.map((p) => ({
    ...p,
    type: mapOldCategoryToNew(p.type),
  }));

  const filteredPlaces =
    filter === "all"
      ? updatedPlaces
      : updatedPlaces.filter((place) => place.type === filter);

  const searchOptions = filteredPlaces;

  const searchedLocations = searchQuery
    ? searchOptions.filter((place) =>
        place.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : searchOptions;

  useEffect(() => {
    setSelectedPlace(null);
  }, [filter]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => console.error("Error fetching user location:", err)
    );
  }, []);

  useEffect(() => {
    if (!userLocation) return;
    filteredPlaces.forEach((place) => fetchETA(place));
  }, [userLocation, filter]);

  const fetchETA = async (destination) => {
    if (!userLocation) return;
    setTimeout(() => {
      const dist = (calculateDistance(userLocation.lat, userLocation.lng, destination.lat, destination.lon) * 0.621371).toFixed(2);
      const dur = Math.round(dist * 2) + " minutes";
      setEtaData((prev) => ({ 
        ...prev, 
        [destination.id]: { distance: dist + " miles", duration: dur } 
      }));
    }, 500);
  };

  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
  };

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
      {/* Header Section with background image restored */}
      <Box
        sx={{
          height: "600px",
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          px: 2
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "3.5rem", md: "5rem" },
            margin: "0",
            textAlign: "center",
            fontFamily: "'Sacramento', cursive",
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)"
          }}
        >
          Travel & Stay
        </Typography>
        <Typography
          variant="h5"
          sx={{
            marginTop: "20px",
            textAlign: "center",
            maxWidth: "600px",
            lineHeight: "1.6",
            fontWeight: 300,
            opacity: 0.9
          }}
        >
          Discover San Antonio and find the perfect place to rest during our celebration.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          margin: "-50px auto 40px",
          width: "90%",
          maxWidth: "800px",
          alignItems: "center",
          zIndex: 2,
          position: "relative"
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
          padding: "25px",
          backgroundColor: "#fff",
          borderRadius: "16px",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
          maxWidth: "500px",
          margin: "0 auto 20px",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", marginBottom: "15px", color: "#333" }}>
          Explore by Category
        </Typography>
        <FormControl fullWidth sx={{ maxWidth: "400px" }}>
          <InputLabel id="filter-label">Category</InputLabel>
          <Select
            labelId="filter-label"
            id="filter"
            value={filter}
            label="Category"
            onChange={(e) => setFilter(e.target.value)}
            sx={{ borderRadius: "8px" }}
          >
            <MenuItem value="all">All Attractions</MenuItem>
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
          padding: "25px",
          backgroundColor: "#fff",
          borderRadius: "16px",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
          maxWidth: "500px",
          margin: "0 auto 20px",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", marginBottom: "15px", color: "#333" }}>
          Sort Locations
        </Typography>
        <FormControl fullWidth sx={{ maxWidth: "400px" }}>
          <InputLabel id="sort-label">Sort Order</InputLabel>
          <Select
            labelId="sort-label"
            id="sort"
            value={sortOrder}
            label="Sort Order"
            onChange={(e) => setSortOrder(e.target.value)}
            sx={{ borderRadius: "8px" }}
          >
            <MenuItem value="closest">Closest to you</MenuItem>
            <MenuItem value="furthest">Furthest from you</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Autocomplete Search Section */}
      <Box
        sx={{
          maxWidth: "500px",
          margin: "0 auto 40px",
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
              setPage(1);
            }
          }}
          renderInput={(params) => (
            <TextField {...params} label="Search for a specific place" variant="outlined" sx={{ bgcolor: "#fff", borderRadius: "8px" }} />
          )}
        />
      </Box>

      <Box sx={{ maxWidth: "800px", margin: "20px auto", padding: "15px" }}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => setListExpanded(!listExpanded)}
          sx={{
            mb: 2,
            background: "#222",
            color: "#fff",
            textTransform: "none",
            py: 1.5,
            borderRadius: "8px",
            fontSize: "1rem",
            "&:hover": { background: "#000" }
          }}
        >
          {listExpanded ? "Hide Locations List" : "Show All Locations List"}
        </Button>
        <Collapse in={listExpanded} timeout="auto" unmountOnExit>
          <Box ref={listRef}>
            <Typography
              variant="h5"
              sx={{ marginBottom: "20px", fontWeight: "bold", textAlign: "center" }}
            >
              Nearby Points of Interest
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {currentItems.map((place) => (
                <Paper
                  key={place.id}
                  elevation={0}
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "20px",
                    borderRadius: "12px",
                    width: "100%",
                    border: "1px solid #eee",
                    borderLeft: `6px solid ${
                      place.type === "adventure_sports" ? "#FF5722" : 
                      place.type === "culture_history" ? "#9C27B0" :
                      place.type === "nature_animals" ? "#4CAF50" : "#2196F3"
                    }`,
                    transition: "all 0.2s",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      borderColor: "#ddd"
                    }
                  }}
                >
                  <Box sx={{ flex: 1, width: "100%" }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", mb: 0.5 }}>
                      {place.name}
                    </Typography>
                    <Box sx={{ display: "flex", gap: "15px", flexWrap: "wrap", mb: 1 }}>
                      <Typography variant="body2" sx={{ bgcolor: "#f0f0f0", px: 1, py: 0.5, borderRadius: "4px", fontSize: "12px", fontWeight: "bold", color: "#666" }}>
                        {displayCategory(place.type)}
                      </Typography>
                      {userLocation && (
                        <>
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            <strong>Distance:</strong> {(calculateDistance(userLocation.lat, userLocation.lng, place.lat, place.lon) * 0.621371).toFixed(2)} miles
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            <strong>ETA:</strong> {etaData[place.id] ? formatDuration(etaData[place.id].duration) : "calculating..."}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                  
                  <Box
                    sx={{
                      display: "flex",
                      gap: "10px",
                      width: { xs: "100%", sm: "auto" },
                      mt: { xs: 2, sm: 0 }
                    }}
                  >
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{
                        color: "#222",
                        borderColor: "#222",
                        textTransform: "none",
                        borderRadius: "8px",
                        fontWeight: "bold"
                      }}
                      onClick={() => {
                        setModalPlace(place);
                        setOpenModal(true);
                      }}
                    >
                      Details
                    </Button>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        background: "#222",
                        color: "#fff",
                        textTransform: "none",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        px: 3,
                        "&:hover": { background: "#000" }
                      }}
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`,
                          "_blank"
                        )
                      }
                    >
                      Maps
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
              <Pagination count={totalPages} page={page} onChange={handleChangePage} color="primary" />
            </Box>
          </Box>
        </Collapse>
      </Box>

      {/* Map Section */}
      <Box sx={{ p: { xs: 1, md: 4 }, bgcolor: "#f9f9f9" }}>
        <Box sx={{ borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", border: "1px solid #ddd" }}>
          <MapContainer
            center={[center.lat, center.lng]}
            zoom={12}
            style={{ height: "600px", width: "100%" }}
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
                <Tooltip permanent>You</Tooltip>
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
              <Tooltip permanent>The Venue</Tooltip>
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
              <Tooltip permanent>
                The Ceremony
              </Tooltip>
            </Marker>
            {filteredPlaces.map((place) => (
              <Marker
                key={place.id}
                position={[place.lat, place.lon]}
                eventHandlers={{
                  click: () => handleSelectPlace(place),
                }}
              >
                <Tooltip direction="top" offset={[0, -10]}>
                  {place.name}
                </Tooltip>
                <Popup>
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#1a73e8", mb: 1 }}>
                      {place.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <strong>Category:</strong> {displayCategory(place.type)}
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      size="small"
                      sx={{
                        background: "linear-gradient(135deg, #6a11cb, #2575fc)",
                        mb: 1,
                        textTransform: "none"
                      }}
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`,
                          "_blank"
                        )
                      }
                    >
                      Directions
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      size="small"
                      sx={{ textTransform: "none", color: "#222", borderColor: "#222" }}
                      onClick={() => {
                        setModalPlace(place);
                        setOpenModal(true);
                      }}
                    >
                      View Details
                    </Button>
                  </Box>
                </Popup>
              </Marker>
            ))}
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
        </Box>
      </Box>

      {/* Modal for View Details */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        {modalPlace && (
          <>
            <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>{modalPlace.name}</DialogTitle>
            <DialogContent dividers>
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7, color: "#444" }}>
                {modalPlace.description}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" sx={{ bgcolor: "#f0f0f0", px: 1.5, py: 0.5, borderRadius: "20px", fontWeight: "bold", color: "#666" }}>
                  {displayCategory(modalPlace.type)}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button
                variant="contained"
                sx={{
                  background: "#222",
                  color: "#fff",
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 4,
                  "&:hover": { background: "#000" }
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
                  color: "#222",
                  borderColor: "#222",
                  borderRadius: "8px"
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
