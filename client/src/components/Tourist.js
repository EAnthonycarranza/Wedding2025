// File: Tourist.js

import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
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
} from "@mui/material";
import "leaflet/dist/leaflet.css";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import L from "leaflet";
import "leaflet-fullscreen";
import "./Tourist.css";
import placesData from "./places.json";
import RoutingControl from "./RoutingControl";
import Airbnb from "./Airbnb"; // Your existing Airbnb component
import bgImage from "../img/TravelImg.jpg"; // Import the background image
import Hotel from "./Hotel";

// Fix for default Marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});


function formatDuration(duration) {
  if (!duration) return "";
  return duration.replace(/^0 hours\s*/i, "").trim();
}

/**
 * Example function mapping old categories to the new 5 categories.
 */
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

/**
 * In-case you want to rename your categories to display text with ampersands:
 */
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

const Tourist = () => {
  // States
  const [filter, setFilter] = useState("all");
  const [userLocation, setUserLocation] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [etaData, setEtaData] = useState({});
  const [descriptionOpen, setDescriptionOpen] = useState(false);

  // Default map center
  const center = { lat: 29.4241, lng: -98.4936 };

  // Convert placesData from old categories to new 5 categories
  const updatedPlaces = placesData.map((p) => ({
    ...p,
    type: mapOldCategoryToNew(p.type),
  }));

  // Filtered places based on new 5 categories
  const filteredPlaces =
    filter === "all"
      ? updatedPlaces
      : updatedPlaces.filter((place) => place.type === filter);

  // Clear selected place if filter changes
  useEffect(() => {
    setSelectedPlace(null);
  }, [filter]);

  // Grab user’s geolocation
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => console.error("Error fetching user location:", err)
    );
  }, []);

  // Example: Suppose we also fetch the Airbnb listings here.
  // For a real scenario, you might do the fetch or pass them as props from <Airbnb/>.
  const [airbnbListings, setAirbnbListings] = useState([]);
  useEffect(() => {
    // Example fetch from same endpoint used by Airbnb.js
    fetch("/api/airbnb-listings")
      .then((res) => res.json())
      .then((data) => {
        const fetched = data.message || [];
        // Filter out if needed, e.g. remove null-lat/lng
        const validAirbnbs = fetched.filter(
          (l) => l.latitude && l.longitude
        );
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

  // Handle marker click
  const handleMarkerClick = (place) => {
    setSelectedPlace(place);
    setDescriptionOpen(true);
  };

  // Scroll if on mobile
  const scrollToDetails = () => {
    const descriptionSection = document.querySelector(".description-section");
    descriptionSection?.scrollIntoView({ behavior: "smooth" });
  };

  // Check if user is on mobile
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

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
      fontFamily: "'Sacramento', cursive", // Ensure the title is cursive
      color: "rgb(255, 255, 255)",
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

      {/* Wrapper to place buttons side by side */}
      <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
        <Airbnb />
        <Hotel />
      </div>

      {/* Filter Section */}
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
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            marginBottom: "10px",
            color: "#333",
          }}
        >
          Filter by Category:
        </Typography>
        <FormControl fullWidth sx={{ maxWidth: "400px" }}>
          <InputLabel id="filter-label">Category</InputLabel>
          <Select
            labelId="filter-label"
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            {/* <MenuItem value="seasonal_event">Seasonal Event</MenuItem> */}
            <MenuItem value="adventure_sports">Adventure & Sports</MenuItem>
            <MenuItem value="culture_history">Culture & History</MenuItem>
            <MenuItem value="nature_animals">Nature & Animals</MenuItem>
            <MenuItem value="family_leisure">Family & Leisure</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Container with Map & Description */}
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
            {/* Add custom FullscreenControl */}
            <FullscreenControl />

            {/* User's Current Location */}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>Your Current Location</Popup>
              </Marker>
            )}

            {/* The Club at Garden Ridge Marker + Circle */}
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
              <Tooltip permanent>
                The Club at Garden Ridge - The Venue
              </Tooltip>
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
                First Assembly of God at San Antonio - The Ceremony
              </Tooltip>
            </Marker>

            {/* 2) Markers for the “touristy places” matching the filter */}
            {filteredPlaces.map((place) => (
              <Marker
                key={place.id}
                position={[place.lat, place.lon]}
                eventHandlers={{
                  click: () => handleMarkerClick(place),
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
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation?.lat},${userLocation?.lng}&destination=${encodeURIComponent(
                      place.name
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "0.9rem",
                      color: "#ffffff",
                      textDecoration: "none",
                      background: "linear-gradient(135deg, #6a11cb, #2575fc)",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      display: "inline-block",
                      textAlign: "center",
                      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                      transition: "background 0.3s ease-in-out, transform 0.2s",
                    }}
                  >
                    Get Directions
                  </a>
                  {isMobile && (
                    <button
                      onClick={scrollToDetails}
                      style={{
                        fontSize: "0.9rem",
                        color: "#ffffff",
                        textDecoration: "none",
                        background: "#f39c12",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        display: "inline-block",
                        textAlign: "center",
                        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                        marginLeft: "10px",
                        transition: "background 0.3s ease-in-out",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Show Details
                    </button>
                  )}
                </Popup>
              </Marker>
            ))}

            {/* If the user has selected a place & we have userLocation, add RoutingControl */}
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

        {/* Description Section */}
        <div
          className="description-section"
          style={{
            marginTop: "20px",
            padding: "20px",
            backgroundColor: "#f4f4fc",
            borderRadius: "15px",
            boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.1)",
            border: "1px solid #d6d6f0",
          }}
        >
          {selectedPlace ? (
            <>
              <h2
                style={{
                  fontSize: "1.8rem",
                  fontFamily: "'Playfair Display', serif",
                  color: "#1a1a2e",
                  marginBottom: "10px",
                  textAlign: "center",
                  textShadow: "1px 1px 4px rgba(0, 0, 0, 0.2)",
                }}
              >
                {selectedPlace.name}
              </h2>
              <p
                style={{
                  fontSize: "1rem",
                  fontWeight: "500",
                  color: "#3a3a3a",
                  fontFamily: "'Roboto', sans-serif",
                  marginBottom: "10px",
                }}
              >
                <strong>Type:</strong> {displayCategory(selectedPlace.type)}
              </p>
              {etaData[selectedPlace.id] && (
                <>
                  <p
                    style={{
                      fontSize: "1rem",
                      fontWeight: "500",
                      color: "#3a3a3a",
                      fontFamily: "'Roboto', sans-serif",
                      marginBottom: "5px",
                    }}
                  >
                    <strong>ETA:</strong> {formatDuration(etaData[selectedPlace.id].duration)}
                  </p>
                  <p
                    style={{
                      fontSize: "1rem",
                      fontWeight: "500",
                      color: "#3a3a3a",
                      fontFamily: "'Roboto', sans-serif",
                      marginBottom: "10px",
                    }}
                  >
                    <strong>Distance:</strong>{" "}
                    {etaData[selectedPlace.id].distance}
                  </p>
                </>
              )}

              {selectedPlace.image && (
                <img
                  src={selectedPlace.image}
                  alt={selectedPlace.name}
                  style={{
                    width: "100%",
                    height: "250px",
                    objectFit: "cover",
                    borderRadius: "15px",
                    marginTop: "10px",
                    boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.1)",
                  }}
                />
              )}

              {selectedPlace.description && (
                <div
                  className="description-animation-wrapper"
                  style={{
                    position: "relative",
                    maxHeight: descriptionOpen ? "300px" : "0px",
                    overflowY: "auto",
                    transition:
                      "max-height 0.5s ease, padding 0.5s ease, opacity 0.4s ease",
                    marginTop: "15px",
                    borderLeft: "5px solid #6a11cb",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "10px",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                    padding: descriptionOpen ? "15px" : "0px 15px",
                    opacity: descriptionOpen ? 1 : 0,
                  }}
                >
                  <p
                    style={{
                      fontSize: "1.2rem",
                      fontFamily: "'Playfair Display', serif",
                      lineHeight: "1.8",
                      color: "#333",
                      textAlign: "justify",
                      margin: "0",
                    }}
                  >
                    {selectedPlace.description}
                  </p>
                </div>
              )}

              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation?.lat},${userLocation?.lng}&destination=${encodeURIComponent(
                  selectedPlace.name
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "1rem",
                  color: "#ffffff",
                  textDecoration: "none",
                  background: "linear-gradient(135deg, #6a11cb, #2575fc)",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  display: "inline-block",
                  textAlign: "center",
                  boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.2)",
                  marginTop: "15px",
                  transition: "background 0.3s ease-in-out, transform 0.2s",
                }}
              >
                Get Directions
              </a>

              <button
                onClick={() => setDescriptionOpen((prev) => !prev)}
                style={{
                  fontSize: "1rem",
                  color: "#ffffff",
                  backgroundColor: "#f39c12",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginLeft: "10px",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                {descriptionOpen ? "Hide Description" : "Show Description"}
              </button>
            </>
          ) : (
            <p
              style={{
                fontSize: "1.2rem",
                fontFamily: "'Roboto', sans-serif",
                color: "#666",
                textAlign: "center",
              }}
            >
              Select a location to view details
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tourist;