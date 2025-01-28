import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Collapse,
  Tooltip,
  Rating,
  Modal,
  CircularProgress,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import useMediaQuery from "@mui/material/useMediaQuery"; // Import useMediaQuery
import BedIcon from "@mui/icons-material/Bed";
import BathtubIcon from "@mui/icons-material/Bathtub";
import GroupIcon from "@mui/icons-material/Group";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Image imports
import DruryDining from "../img/0123_dining.jpg";
import DruryFitness from "../img/0123_fitness.jpg";
import DruryLobby1 from "../img/0123_lobby_1.jpg";
import DruryLobby2 from "../img/0123_lobby_2.jpg";
import DruryLobby3b from "../img/123_lobby_3b.jpg";
import DruryNkx from "../img/0123_nkx.jpg";
import DruryPool from "../img/0124_pool.jpg";
import DruryInn from "../img/drury_inn.jpg";
import SatsaFitness from "../img/satsa-fitness-0062-hor-wide.avif";
import SatsaPool from "../img/satsa-pool-0061-hor-wide.webp";
import SatsaBreakfast from "../img/satsa-breakfast-0059-hor-wide.avif";
import SatsaLaundry from "../img/satsa-laundry-0041-hor-wide.avif";
import SatsaBathroom from "../img/satsa-bathroom-0056-hor-wide.jpg";
import SatsaSuite from "../img/satsa-suite-0054-hor-wide.avif";
import SatsaDeck from "../img/satsa-deck-0051-hor-wide.webp";
import SatsaLobby from "../img/satsa-lobby-0049-hor-wide.avif";
import SpringHillMainImage from "../img/SpringHill.jpg";
import TownePlaceSuites from "../img/TownePlaceSuites.jpg";
import TsSattuLobby from "../img/ts-sattu-hotel-lobby27670-42533_Wide-Hor.jpeg";
import TsSattuFitness from "../img/ts-sattu-fitness-center27117-47545_Wide-Hor.jpeg";
import TsSattuPool from "../img/ts-sattu-outdoor-pool-20215-67966_Wide-Hor.jpeg";
import TsSattuBreakfast from "../img/ts-sattu-breakfast-seating18809-52279_Wide-Hor.jpeg";
import TsSattuLaundry from "../img/ts-sattu-guest-laundry13800-70292_Wide-Hor.jpeg";
import TsSattuBathtub from "../img/ts-sattu-accessible-bathtub-24904_Wide-Hor.jpeg";
import TsSattuStudioView from "../img/ts-sattu-studio-king-view-32491_Wide-Hor.jpeg";
import TsSattuDoubleQueen from "../img/ts-sattu-double-queen-guestro28777-51724_Wide-Hor.jpeg";
import TsSattuKingStudio from "../img/ts-sattu-king-studio-kitchen-21408-48265_Wide-Hor.jpeg";
import RiverWalkHotel from "../img/RiverWalkHotel.jpg";
import HotelValenciaFood from "../img/Hotel_Valencia_Riverwalk_Food.jpg";
import HotelValenciaLobby from "../img/Hotel_Valencia_Riverwalk_Lobby.jpg";
import HotelValenciaKingBedView from "../img/Hotel_Valencia_Riverwalk_King_Bed_With_View.jpg";
import HotelValenciaKingBed from "../img/Hotel_Valencia_Riverwalk_King_Bed.jpg";
import HotelValenciaFitnessCenter from "../img/Hotel_Valencia_Riverwalk_Fitness_Center.jpg";
import HotelValenciaCourtyard from "../img/Hotel_Valencia_Riverwalk_Courtyard.jpg";
import HotelValenciaBed from "../img/Hotel_Valencia_Riverwalk_Bed.jpg";

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
  const [collapsed, setCollapsed] = useState(true); // State to manage collapse
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [selectedLat, setSelectedLat] = useState(null);
  const [selectedLng, setSelectedLng] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedAccordionData, setSelectedAccordionData] = useState({});
  const [listings, setListings] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isWideScreen = useMediaQuery("(min-width:900px)"); // Check if screen width is over 900px

  const handleCollapse = () => {
    setCollapsed(true);
    // Removed window.scrollTo to prevent scrolling to top of the page
  };

  const handleExpand = () => {
    setCollapsed(false);
  };

  const handleOpenModal = (
    description,
    lat,
    lng,
    images,
    accordionData
  ) => {
    setSelectedDescription(description);
    setSelectedLat(lat);
    setSelectedLng(lng);
    setSelectedImages(images);
    setSelectedAccordionData(accordionData);
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  useEffect(() => {
    const fetchAndEnrichListings = async () => {
      setLoading(true);
      try {
        // Sample hotel data with unique airbnbId
        const listingsData = [
          {
            airbnbId: "hotel1",
            title: "Drury Inn & Suites San Antonio North Stone Oak",
            image: DruryInn,
            description:
              "Drury Inn & Suites San Antonio North Stone Oak is in a suburb north of San Antonio. Visitors enjoy Hill Country winery tours and upscale shopping at nearby La Cantera. The San Antonio International Airport is near our hotel, which is located on the Loop 1604. Free hot breakfast is served daily as well as free hot food and cold beverages at our evening 5:30 Kickback®.",
            beds: 3,
            baths: 2,
            guests: 13,
            rating: 4.6,
            lat: 29.610849774499812,
            lng: -98.48206093558174,
            images: [
              { baseUrl: DruryNkx, accessibilityLabel: "NKX View" },
              { baseUrl: DruryDining, accessibilityLabel: "Dining Area" },
              { baseUrl: DruryPool, accessibilityLabel: "Pool Area" },
              { baseUrl: DruryFitness, accessibilityLabel: "Fitness Area" },
              { baseUrl: DruryLobby1, accessibilityLabel: "Lobby Area 1" },
              { baseUrl: DruryLobby2, accessibilityLabel: "Lobby Area 2" },
              { baseUrl: DruryLobby3b, accessibilityLabel: "Lobby Area 3" },
            ],
            hotelUrl: "https://www.druryhotels.com/locations/san-antonio-tx/drury-inn-and-suites-san-antonio-north-stone-oak", // **Added hotelUrl**
          },
          {
            airbnbId: "hotel2",
            title: "SpringHill Suites San Antonio Airport",
            image: SpringHillMainImage, // Main image for the card
            description: `
              <p>Redefine the concept of comfortable hotel living at the SpringHill Suites San Antonio Airport. We offer everything you need for a relaxing and invigorating stay, including free WiFi, complimentary shuttle service to and from San Antonio International Airport and free full hot breakfast buffet every morning. Our convenient location near Loop 410 gives you easy access to the entire San Antonio region, and we are only fifteen minutes from downtown and the historic River Walk. Here with family, SeaWorld San Antonio and Six Flags Fiesta Texas are among the many superb attractions at your disposal and you can enjoy shopping at its best at nearby Quarry Market and North Star mall. Relax at the end of the day in your spacious suite which features 37-inch flat screen TVs, a microwave, mini-refrigerator and a West Elm Trundle Sofa Bed. The SpringHill Suites San Antonio Airport will help make your stay in our city truly memorable.</p>`,
            beds: 5,
            baths: 4,
            guests: 20,
            rating: 3.8,
            lat: 29.518390716869536,
            lng: -98.47394591875964,
            images: [
              { baseUrl: SatsaSuite, accessibilityLabel: "Suite Interior" },
              { baseUrl: SatsaBathroom, accessibilityLabel: "Bathroom" },
              { baseUrl: SatsaLaundry, accessibilityLabel: "Laundry Facility" },
              { baseUrl: SatsaBreakfast, accessibilityLabel: "Breakfast Area" },
              { baseUrl: SatsaPool, accessibilityLabel: "Pool Area" },
              { baseUrl: SatsaDeck, accessibilityLabel: "Outdoor Deck" },
              { baseUrl: SatsaLobby, accessibilityLabel: "Lobby Area" },
              { baseUrl: SatsaFitness, accessibilityLabel: "Fitness Center" },
            ],
            hotelUrl: "https://www.marriott.com/en-us/hotels/satsa-springhill-suites-san-antonio-airport/overview/", // **Added hotelUrl**
          },
          {
            airbnbId: "hotel3",
            title: "TownePlace Suites San Antonio Universal City/Live Oak",
            image: TownePlaceSuites, // Main image for the card
            description: `
              <p>Our beautiful TownePlace Suites has golf course views and is perfect for families, groups or business travelers wanting an extended stay with all the comforts of home. Our modern guest rooms are equipped with 55” TV’s with channels to include NFL Network and GOLF Channel. Fully equipped kitchens have full-size refrigerators with freezers, cooktops, dishwashers, and microwaves. An Elfa closet system helps keep you organized during your stay! The breakfast area and GreenView Bar overlook the outdoor pool and 14th hole of the Olympia Hills Golf Course. Weber grills on our outdoor patios are available for your use along with Weber tools & spices. Enjoy the gorgeous sunsets as you warm up near our fire pits with a cocktail from our convenient walkup bar. The hotel is located in close proximity to Randolph Air Force Base, The Forum at Olympia Parkway, several outlets and restaurants. Nearby destinations include Retama Park Horse Racetrack & Olympia Hills Golf & Event Center.</p>`,
            beds: 5,
            baths: 4,
            guests: 20,
            rating: 4.3,
            lat: 29.579334964537463,
            lng: -98.31348771928904,
            images: [
              { baseUrl: TsSattuDoubleQueen, accessibilityLabel: "Double Queen Guest Room" },
              { baseUrl: TsSattuStudioView, accessibilityLabel: "Studio King Room with View" },
              { baseUrl: TsSattuKingStudio, accessibilityLabel: "King Studio with Kitchen" },
              { baseUrl: TsSattuBathtub, accessibilityLabel: "Accessible Bathtub" },
              { baseUrl: TsSattuLaundry, accessibilityLabel: "Guest Laundry Facility" },
              { baseUrl: TsSattuPool, accessibilityLabel: "Outdoor Pool" },
              { baseUrl: TsSattuBreakfast, accessibilityLabel: "Breakfast Seating Area" },
              { baseUrl: TsSattuLobby, accessibilityLabel: "Hotel Lobby" },
              { baseUrl: TsSattuFitness, accessibilityLabel: "Fitness Center" },
            ],
            hotelUrl: "https://www.marriott.com/en-us/hotels/sattu-towneplace-suites-san-antonio-universal-city-live-oak/overview/", // **Added hotelUrl**
          },
          {
            airbnbId: "hotel4",
            title: "Hotel Valencia Riverwalk",
            image: RiverWalkHotel, // Main image for the card
            description: `
              <p>Hotel Valencia Riverwalk welcomes you to San Antonio with Mediterranean-inspired luxury and contemporary comfort. You’ll find our downtown luxury hotel tucked away along a quieter section of the city’s iconic River Walk; world-class dining, shopping and nightlife are within easy reach. Step through our doors and discover sophisticated design and thoughtful amenities around every corner. Whatever your reason for joining us, we offer a boutique experience unlike any other. </p>`,
            beds: 5,
            baths: 4,
            guests: 20,
            rating: 4.4,
            lat: 29.579334964537463,
            lng: -98.31348771928904,
            images: [
              { baseUrl: HotelValenciaKingBedView, accessibilityLabel: "King Bed with View" },
              { baseUrl: HotelValenciaKingBed, accessibilityLabel: "King Bed Interior" },
              { baseUrl: HotelValenciaBed, accessibilityLabel: "Bed Area" },
              { baseUrl: HotelValenciaCourtyard, accessibilityLabel: "Courtyard" },
              { baseUrl: HotelValenciaLobby, accessibilityLabel: "Hotel Lobby" },
              { baseUrl: HotelValenciaFood, accessibilityLabel: "Food Presentation" },
              { baseUrl: HotelValenciaFitnessCenter, accessibilityLabel: "Fitness Center" },
            ],
            hotelUrl: "https://www.hotelvalencia-riverwalk.com/", // **Added hotelUrl**
          },
        ];

        const enrichedListings = await Promise.all(
          listingsData.map(async (listing) => {
            if (listing.lat && listing.lng) {
              try {
                // Create an array of ETA fetch promises for each destination
                const etaPromises = destinations.map(async (destination) => {
                  try {
                    const etaResponse = await fetch(
                      `/api/eta?originLat=${listing.lat}&originLon=${listing.lng}&destLat=${destination.lat}&destLon=${destination.lon}`
                    );
                    if (etaResponse.ok) {
                      const etaData = await etaResponse.json();

                      // Process duration to hide "0 hours"
                      let durationString = "";
                      const durationParts = etaData.duration.split(" ");

                      // Assuming etaData.duration is in format "X hours Y minutes" or "Y minutes"
                      if (durationParts.includes("hours")) {
                        const hoursIndex = durationParts.indexOf("hours");
                        const hours = parseInt(
                          durationParts[hoursIndex - 1],
                          10
                        );
                        if (hours > 0) {
                          durationString += `${hours} hour${
                            hours > 1 ? "s" : ""
                          } `;
                        }
                      }

                      const minutesIndex = durationParts.indexOf("minutes");
                      if (minutesIndex !== -1) {
                        const minutes = parseInt(
                          durationParts[minutesIndex - 1],
                          10
                        );
                        durationString += `${minutes} minute${
                          minutes !== 1 ? "s" : ""
                        }`;
                      }

                      // If durationString is empty, set to "N/A"
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
                      return {
                        name: destination.name,
                        distance: "N/A",
                        duration: "N/A",
                      };
                    }
                  } catch (etaError) {
                    console.error(
                      `Error fetching ETA for listing ID ${listing.airbnbId} to ${destination.name}:`,
                      etaError.message
                    );
                    return {
                      name: destination.name,
                      distance: "N/A",
                      duration: "N/A",
                    };
                  }
                });

                // Await all ETA promises
                const etaResults = await Promise.all(etaPromises);

                // Structure the ETA results
                const etaData = {};
                etaResults.forEach((result) => {
                  const keyName = `etaTo${result.name.replace(/\s+/g, "")}`;
                  etaData[keyName] = {
                    distance: result.distance,
                    duration:
                      result.duration !== "0 minutes" ? result.duration : "N/A",
                  };
                });

                return {
                  ...listing,
                  ...etaData,
                };
              } catch (etaError) {
                console.error(
                  `Error fetching ETAs for listing ID ${listing.airbnbId}:`,
                  etaError.message
                );
                // Assign N/A for all destinations in case of error
                const etaData = {};
                destinations.forEach((destination) => {
                  const keyName = `etaTo${destination.name.replace(/\s+/g, "")}`;
                  etaData[keyName] = {
                    distance: "N/A",
                    duration: "N/A",
                  };
                });
                return {
                  ...listing,
                  ...etaData,
                };
              }
            } else {
              // If no coordinates, assign N/A for all destinations
              const etaData = {};
              destinations.forEach((destination) => {
                const keyName = `etaTo${destination.name.replace(/\s+/g, "")}`;
                etaData[keyName] = {
                  distance: "N/A",
                  duration: "N/A",
                };
              });
              return {
                ...listing,
                ...etaData,
              };
            }
          })
        );

        setListings(enrichedListings); // Set enriched listings data
        setDataLoaded(true); // Mark data as loaded
      } catch (err) {
        console.error("Error fetching listings:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
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
    <Box sx={{ maxWidth: "800px", margin: "auto", mt: 4, px: 2 }}>
      {/* Expand Button */}
      {dataLoaded && collapsed && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <Button variant="contained" onClick={handleExpand}>
            View Hotel Listings
          </Button>
        </Box>
      )}

      {/* Collapse Section */}
      <Collapse in={!collapsed} timeout="auto" unmountOnExit>
        {dataLoaded && (
          <>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
              <Button variant="contained" onClick={handleCollapse}>
                Hide Hotel Listings
              </Button>
            </Box>

            {listings.map((listing, index) => (
              <Card key={listing.airbnbId} sx={{ mb: 4 }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={listing.image}
                  alt={listing.title}
                />

                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {listing.title}
                  </Typography>

                  <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
                    <Rating value={listing.rating} precision={0.1} readOnly />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {listing.rating.toFixed(2)}
                    </Typography>
                  </Box>

                  {/* ETA Information */}
                  <Box sx={{ mt: 2 }}>
                    {destinations.map((destination, destIndex) => {
                      const etaKey = `etaTo${destination.name.replace(
                        /\s+/g,
                        ""
                      )}`;
                      const eta = listing[etaKey] || {
                        distance: "N/A",
                        duration: "N/A",
                      };
                      return (
                        <Box key={destIndex} sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>
                              From Hotel &#x2192; {destination.name}
                            </strong>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Distance: {eta.distance}
                          </Typography>
                          {eta.duration !== "N/A" &&
                            eta.duration !== "0 minutes" && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Estimated Duration: {eta.duration}
                              </Typography>
                            )}
                        </Box>
                      );
                    })}
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        handleOpenModal(
                          listing.description,
                          listing.lat,
                          listing.lng,
                          listing.images,
                          listing.accordionData
                        )
                      }
                    >
                      View More
                    </Button>

                    {/* **"Visit Hotel" Button Added Below** */}
                    <Button
                      variant="contained"
                      color="primary"
                      href={listing.hotelUrl} // Use the `hotelUrl` from the listing data
                      target="_blank" // Open in a new tab
                      rel="noopener noreferrer" // Security best practices
                      sx={{ ml: 2 }} // Optional: Add left margin for spacing
                    >
                      Visit Hotel
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}

            {/* "Collapse" Button */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Button variant="contained" color="secondary" onClick={handleCollapse}>
                Collapse
              </Button>
            </Box>
          </>
        )}
      </Collapse>

      {/* **Optional: "Visit Hotel" Button for Collapsed State** */}
      {/* If you want a "View Hotel Listings" button when collapsed, it's already handled above */}

      {/* "View More" Modal */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxWidth: 800,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 4,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Box sx={{ mb: 6 }}>
            <Slider
              className="custom-slider" // Add the custom class here
              dots
              infinite
              speed={500}
              slidesToShow={isWideScreen ? 3 : 1} // Show 3 slides for wide screens, 1 for narrow
              slidesToScroll={isWideScreen ? 3 : 1} // Scroll 3 slides for wide screens, 1 for narrow
            >
              {selectedImages.map((image, i) => (
                <Card
                  key={i}
                  className="custom-slider-card" // Add the custom class for styling
                >
                  <CardMedia
                    component="img"
                    image={image.baseUrl}
                    alt={image.accessibilityLabel}
                  />
                </Card>
              ))}
            </Slider>
          </Box>

          <Typography variant="h5" fontWeight="bold">
            Full Description
          </Typography>
          <Typography
            sx={{ mt: 2 }}
            dangerouslySetInnerHTML={{ __html: selectedDescription }}
          ></Typography>

          {selectedLat && selectedLng && (
            <Box sx={{ mt: 3 }}>
              <MapContainer
                center={[selectedLat, selectedLng]}
                zoom={15}
                style={{ height: "300px" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                {/* Marker for Selected Location */}
                <Marker position={[selectedLat, selectedLng]} icon={markerIcon}>
                  <Popup>Hotel Location</Popup>
                </Marker>

                {/* Marker for First Assembly of God */}
                <Marker position={[29.56517815357653, -98.49057444759886]} icon={markerIcon}>
                  <Popup>First Assembly of God at San Antonio</Popup>
                </Marker>

                {/* Marker for The Club at Garden Ridge */}
                <Marker position={[29.637170128414255, -98.31085434574706]} icon={markerIcon}>
                  <Popup>The Club at Garden Ridge</Popup>
                </Marker>
              </MapContainer>
            </Box>
          )}

          <Button
            variant="contained"
            onClick={handleCloseModal}
            sx={{ mt: 3 }}
          >
            Close & Return
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Hotel;