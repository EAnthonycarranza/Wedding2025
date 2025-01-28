import React, { useState, useEffect } from "react";
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
  Collapse, // Import Collapse component
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BedIcon from "@mui/icons-material/Bed";
import BathtubIcon from "@mui/icons-material/Bathtub";
import GroupIcon from "@mui/icons-material/Group";
import StarIcon from "@mui/icons-material/Star";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Loading from "./Loading";
import useMediaQuery from "@mui/material/useMediaQuery"; // Ensure useMediaQuery is imported

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
  const [listings, setListings] = useState([]); // State for all listings
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const [modalOpen, setModalOpen] = useState(false); // State for "View More" modal visibility
  const [selectedDescription, setSelectedDescription] = useState(""); // State for "View More" modal content
  const [dataLoaded, setDataLoaded] = useState(false); // State to track if data is already fetched
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const listingsPerPage = 10; // Number of listings per page
  const [selectedLat, setSelectedLat] = useState(null); // Latitude state for modal map
  const [selectedLng, setSelectedLng] = useState(null); // Longitude state for modal map
  const [selectedImages, setSelectedImages] = useState([]); // State for selected images in modal
  const [selectedAccordionData, setSelectedAccordionData] = useState({
    theSpace: null,
    otherThings: null,
  });
  const [fullscreenImage, setFullscreenImage] = useState(null); // State for fullscreen image (if needed)

  // **New States for "About Host" Modal**
  const [aboutHostOpen, setAboutHostOpen] = useState(false); // State for "About Host" modal visibility
  const [hostAboutText, setHostAboutText] = useState(""); // State for "About Host" content
  const [selectedHostName, setSelectedHostName] = useState(""); // State for Host Name
  const [selectedHostProfilePicture, setSelectedHostProfilePicture] = useState(""); // State for Host Profile Picture
  const [hostRatingHost, setHostRatingHost] = useState(0); // State for Host Rating
  const [hostReviewsHost, setHostReviewsHost] = useState("0"); // State for Host Reviews
  const [isSuperhost, setIsSuperhost] = useState(false); // State for Superhost status
  const [isVerified, setIsVerified] = useState(false); // State for Verified status

  // State for dot navigation in image sliders
  const [dotOffset, setDotOffset] = useState(0); // Tracks which set of dots to display
  const dotsPerGroup = 5; // Number of dots visible at a time

  // New state for collapse functionality
  const [collapsed, setCollapsed] = useState(false); // State to manage collapse

  // **Responsive Hook**
  const isWideScreen = useMediaQuery("(min-width:700px)"); // Check if screen width is over 900px

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
          const detailResponse = await fetch(
            `/api/airbnb-detail?id=${airbnbId}`
          );
          const detailData = await detailResponse.json();

          const singleResponse = await fetch(
            `/api/single-listing-detail?id=${airbnbId}`
          );
          const singleData = await singleResponse.json();

          // Extract Host Information
          const hostSection = detailData.find(
            (section) => section.__typename === "MeetYourHostSection"
          );
          const availabilitySection = detailData.find(
            (section) => section.__typename === "AvailabilityCalendarSection"
          );

          const hostName = hostSection?.cardData?.name || "Host not specified";
          const hostProfilePicture =
            hostSection?.cardData?.profilePictureUrl || null;

          // **Extract hostRating and hostReviews from StayPdpReviewsSection.overallRating and overallCount**
          const reviewsSection = detailData.find(
            (section) => section.__typename === "StayPdpReviewsSection"
          );
          const hostRating = parseFloat(reviewsSection?.overallRating) || 0;
          const hostReviews = reviewsSection?.overallCount || "0";

          // **Extract hostAbout from MeetYourHostSection.about**
          const hostAbout = hostSection?.about || "Information not available";

          const yearsHosting =
            hostSection?.cardData?.stats?.find(
              (stat) => stat.type === "YEARS_HOSTING"
            )?.value || "0";

          // **Extract Host Review Statistics from MeetYourHostSection.cardData.stats**
          const hostRatingStat = hostSection?.cardData?.stats?.find(
            (stat) => stat.type === "RATING"
          );
          const hostReviewsStat = hostSection?.cardData?.stats?.find(
            (stat) => stat.type === "REVIEW_COUNT"
          );

          const hostRatingHostValue = parseFloat(hostRatingStat?.value) || 0;
          const hostReviewsHostValue = hostReviewsStat?.value || "0";

          // **Extract Superhost and Verified status**
          const isSuperhostValue = hostSection?.cardData?.isSuperhost || false;
          const isVerifiedValue = hostSection?.cardData?.isVerified || false;

          // Extract Location Information
          const locationSection = detailData.find(
            (section) => section.__typename === "LocationSection"
          );

          const lat = locationSection?.lat || null;
          const lng = locationSection?.lng || null;

          // Extract General List Content
          const generalListContentSection = detailData.find(
            (section) => section.__typename === "GeneralListContentSection"
          );

          const items = generalListContentSection?.items;

          // Extract Descriptions
          const theSpaceHtml = items.find(
            (item) => item.title === "The space"
          )?.html?.htmlText;

          const otherThingsHtml = items.find(
            (item) => item.title === "Other things to note"
          )?.html?.htmlText;

          // Extract Preview Images
          const pdpHeroSection = detailData.find(
            (section) => section.__typename === "PdpHeroSection"
          );
          const previewImages = pdpHeroSection?.previewImages || [];
          console.log("Preview Images for Airbnb ID:", airbnbId, previewImages);

          // Extract Primary HTML Text
          const primaryHtmlText =
            generalListContentSection?.items?.[0]?.html?.htmlText ||
            "No description available.";

          // **Extract Beds, Baths, and set maxGuestCapacity to 13**
          let beds = "N/A";
          let baths = "N/A";
          let maxGuestCapacity = "13"; // Fixed value

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
              const bathsMatch = bathsItem.title.match(/(\d+)\s*bath/);
              baths = bathsMatch ? bathsMatch[1] : "Shared, Dedicated, or Private";
            }

            // **Set maxGuestCapacity to 13**
            maxGuestCapacity = "13";
          }

          // Push the listing data with beds, baths, maxGuestCapacity, hostReviews, hostAbout, isSuperhost, and isVerified
          listingsData.push({
            airbnbId,
            thumbnail: availabilitySection?.thumbnail?.baseUrl || null,
            previewImages, // Add the preview images here
            listingTitle:
              availabilitySection?.listingTitle || "No Title Available",
            maxGuestCapacity, // Fixed to 13
            lastUpdated: singleData.results[0]?.last_updated || "Unknown",
            roomType: singleData.results[0]?.roomType || "Unknown",
            hostName,
            hostProfilePicture,
            hostRating, // Extracted from overallRating
            hostReviews, // Extracted from overallCount
            hostAbout, // Extracted from MeetYourHostSection.about
            yearsHosting,
            accordionData: {
              theSpace: theSpaceHtml || null,
              otherThings: otherThingsHtml || null,
            },
            lat,
            lng,
            beds, // Add beds
            baths, // Add baths
            hostRatingHost: hostRatingHostValue, // Extracted from MeetYourHostSection.cardData.stats
            hostReviewsHost: hostReviewsHostValue, // Extracted from MeetYourHostSection.cardData.stats
            isSuperhost: isSuperhostValue, // Extracted from MeetYourHostSection.cardData
            isVerified: isVerifiedValue, // Extracted from MeetYourHostSection.cardData
          });
        } catch (innerError) {
          console.error(
            `Error fetching data for Airbnb ID ${airbnbId}:`,
            innerError.message
          );
        }
      }

      // Fetch ETA for each listing to both destinations
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

  const handleOpenModal = (
    description,
    lat,
    lng,
    accordionData,
    images
  ) => {
    console.log("Opening modal with images:", images); // Log images
    setSelectedDescription(description);
    setSelectedLat(lat);
    setSelectedLng(lng);
    setSelectedAccordionData(accordionData);
    setSelectedImages(images || []); // Set images for the modal
    setModalOpen(true);
    setDotOffset(0); // Reset dotOffset when modal opens
  };

  const handleCloseModal = () => setModalOpen(false);

  // **Handlers for "About Host" Modal**
  const handleOpenAboutHostModal = (
    aboutText,
    hostName,
    hostProfilePicture,
    ratingHost,
    reviewsHost,
    superhostStatus,
    verifiedStatus
  ) => {
    const decodedAboutText = decodeHtml(aboutText); // Decode HTML entities
    setHostAboutText(decodedAboutText);
    setSelectedHostName(hostName);
    setSelectedHostProfilePicture(hostProfilePicture);
    setHostRatingHost(ratingHost);
    setHostReviewsHost(reviewsHost);
    setIsSuperhost(superhostStatus); // Set Superhost status
    setIsVerified(verifiedStatus); // Set Verified status
    setAboutHostOpen(true);
  };

  const handleCloseAboutHostModal = () => setAboutHostOpen(false);

  // Pagination Logic
  const indexOfLastListing = currentPage * listingsPerPage;
  const indexOfFirstListing = indexOfLastListing - listingsPerPage;
  const currentListings = listings.slice(
    indexOfFirstListing,
    indexOfLastListing
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top on page change
  };

  // Effect to reset dotOffset if total dots are less than or equal to dotsPerGroup
  useEffect(() => {
    if (dotOffset + dotsPerGroup >= selectedImages.length) {
      setDotOffset(Math.max(selectedImages.length - dotsPerGroup, 0));
    }
  }, [selectedImages, dotOffset]);

  // **New Handlers for Collapse and Expand with Scroll to Top**
  const handleCollapse = () => {
    setCollapsed(true);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top smoothly
  };

  const handleExpand = () => {
    setCollapsed(false);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Loading />
      </Box>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Box sx={{ maxWidth: "800px", margin: "auto", mt: 4, px: 2 }}>
      {!dataLoaded && (
    <Button
    variant="contained"
    onClick={fetchListings}
    sx={{ 
      mb: 4,
      backgroundColor: '#ff385c',
      color: '#fff',
      '&:hover': {
        backgroundColor: '#e03852',
      },
    }}
  >
    View Airbnb Selections
  </Button>
      )}

      {/* Wrap listings and pagination inside Collapse for smooth animation */}
      <Collapse in={!collapsed} timeout="auto" unmountOnExit>
        {dataLoaded && (
          <>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
            <Button
  variant="contained"
  onClick={handleCollapse}
  sx={{
    backgroundColor: '#ff385c !important',
    color: '#fff !important',
    '&:hover': {
      backgroundColor: '#e03852 !important',
    },
  }}
>
  Hide Airbnb Listings
</Button>
            </Box>
            {currentListings.map((listing, index) => (
              <Card key={index} sx={{ mb: 4 }}>
                {/* Thumbnail */}
                {listing.thumbnail && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={listing.thumbnail}
                    alt="Listing Thumbnail"
                  />
                )}

                <CardContent>
                  {/* Listing Title */}
                  <Typography variant="h5" gutterBottom>
                    {listing.listingTitle}
                  </Typography>

                  {/* Basic Listing Details */}
                  <Typography variant="body2" color="text.secondary">
                    Room Type: {listing.roomType}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last Updated: {new Date(listing.lastUpdated).toLocaleString()}
                  </Typography>

                  {/* Beds, Baths, and Max Guests Information */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mt: 1,
                      flexWrap: "wrap", // Ensure wrapping on smaller screens
                    }}
                  >
                    {/* Beds */}
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Tooltip title="Number of Beds">
                        <BedIcon
                          fontSize="small"
                          color="action"
                          aria-label="Beds"
                        />
                      </Tooltip>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 0.5 }}
                      >
                        {listing.beds}{" "}
                        {listing.beds === "1" ? "Bed" : "Beds"}
                      </Typography>
                    </Box>

                    {/* Baths */}
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Tooltip title="Number of Baths">
                        <BathtubIcon
                          fontSize="small"
                          color="action"
                          aria-label="Baths"
                        />
                      </Tooltip>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 0.5 }}
                      >
                        {listing.baths === "Shared, Dedicated, or Private"
                          ? "Shared, Dedicated, or Private"
                          : `${listing.baths} ${
                              listing.baths === "1" ? "Bath" : "Baths"
                            }`}
                      </Typography>
                    </Box>

                    {/* Max Guests */}
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Tooltip title="Maximum Guests">
                        <GroupIcon
                          fontSize="small"
                          color="action"
                          aria-label="Max Guests"
                        />
                      </Tooltip>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 0.5 }}
                      >
                        {listing.maxGuestCapacity}{" "}
                        {listing.maxGuestCapacity === "1" ? "Guest" : "Guests"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Host Information and Review Info with ETA next to it */}
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
                    {/* Host Information */}
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {listing.hostProfilePicture && (
                        <Avatar
                          src={listing.hostProfilePicture}
                          alt={listing.hostName}
                          sx={{ width: 56, height: 56, mr: 2 }}
                        />
                      )}
                      <Box>
                        <Typography variant="body1">
                          {listing.hostName}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {listing.yearsHosting}{" "}
                          {listing.yearsHosting === "1" ? "Year" : "Years"} Hosting
                        </Typography>
                      </Box>
                    </Box>

                    {/* Review Information and ETA Information */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 4,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      {/* Review Information */}
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h6"
                          component="div"
                          color="text.primary"
                        >
                          {listing.hostRating.toFixed(2)}
                        </Typography>
                        <Rating
                          value={listing.hostRating || 0}
                          precision={0.1}
                          readOnly
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          ({listing.hostReviews}{" "}
                          {listing.hostReviews === "1" ? "review" : "reviews"})
                        </Typography>
                      </Box>

                      {/* ETA Information */}
                      <Box>
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
                                <strong>From Airbnb &#x2192; {destination.name}</strong>
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
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
                    {/* View More Button */}
                    <Button
                      variant="outlined"
                      onClick={() =>
                        handleOpenModal(
                          listing.description,
                          listing.lat,
                          listing.lng,
                          listing.accordionData,
                          listing.previewImages // Pass images here
                        )
                      }
                      sx={{
                        borderColor: '#ff385c !important',
                        color: '#ff385c !important',
                        '&:hover': {
                          borderColor: '#e03852 !important',
                          backgroundColor: 'rgba(255, 56, 92, 0.04) !important', // Optional: subtle background on hover
                        },
                      }}
                    >
                      View More
                    </Button>

                    {/* Always Render "About Host" Button */}
                    <Button
                      variant="outlined"
                      onClick={() =>
                        handleOpenAboutHostModal(
                          listing.hostAbout,
                          listing.hostName,
                          listing.hostProfilePicture,
                          listing.hostRatingHost,
                          listing.hostReviewsHost,
                          listing.isSuperhost, // Pass Superhost status
                          listing.isVerified // Pass Verified status
                        )
                      }
                      sx={{
                        borderColor: '#ff385c !important',
                        color: '#ff385c !important',
                        '&:hover': {
                          borderColor: '#e03852 !important',
                          backgroundColor: 'rgba(255, 56, 92, 0.04)', // Optional: subtle background on hover
                        },
                      }}
                    >
                      About Host
                    </Button>

                    {/* Link to Airbnb Page */}
                    <Button
  variant="contained"
  onClick={handleExpand}
  sx={{
    backgroundColor: '#ff385c !important',
    color: '#fff !important',
    '&:hover': {
      backgroundColor: '#e03852 !important',
    },
  }}
>
                      Visit Airbnb Page
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
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

      {/* Collapse Button */}
      {dataLoaded && !collapsed && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 4,
          }}
        >
<Button
  variant="contained"
  onClick={handleCollapse} // Use the new handler
  sx={{
    backgroundColor: '#ff385c !important', // Set the button's background color
    color: '#fff !important', // Set the text color to white for better contrast
    '&:hover': {
      backgroundColor: '#e03852 !important', // Darken the background color on hover
    },
  }}
>
  Collapse
</Button>
        </Box>
      )}

      {/* Expand Button */}
      {dataLoaded && collapsed && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 4,
          }}
        >
<Button
  variant="contained"
  onClick={handleExpand}
  sx={{
    backgroundColor: '#ff385c !important',
    color: '#fff !important',
    '&:hover': {
      backgroundColor: '#e03852 !important',
    },
  }}
>
  View Airbnb Listings
</Button>
        </Box>
      )}

      {/* "View More" Modal */}
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
            width: "80%",
            maxWidth: 800, // Increased width for better slider visibility
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 4,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          {/* Render images */}
          <Box sx={{ mb: 6 }}> {/* Increase bottom margin to give space for dots */}
            <Slider
              dots={true}
              infinite={true}
              speed={500}
              slidesToShow={1} // **Fixed slidesToShow to 1**
              slidesToScroll={1} // **Fixed slidesToScroll to 1**
              adaptiveHeight={true}
              autoplay={false}
              autoplaySpeed={3000}
              arrows={true} // Show navigation arrows
              appendDots={(dots) => {
                const visibleDots = dots.slice(
                  dotOffset,
                  dotOffset + dotsPerGroup
                ); // Display only 5 dots at a time

                return (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "20px", // Adjust spacing above dots
                    }}
                  >
                    {/* Left Arrow for navigating previous group */}
                    {dotOffset > 0 && (
                      <button
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          marginRight: "15px",
                          fontSize: "18px",
                        }}
                        onClick={() =>
                          setDotOffset(Math.max(dotOffset - dotsPerGroup, 0))
                        }
                        aria-label="Previous Dots"
                      >
                        &lt;
                      </button>
                    )}

                    {/* Visible Dots */}
                    <ul
                      style={{
                        display: "flex",
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        gap: "10px", // Add spacing between dots
                      }}
                    >
                      {visibleDots}
                    </ul>

                    {/* Right Arrow for navigating next group */}
                    {dotOffset + dotsPerGroup < dots.length && (
                      <button
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          marginLeft: "15px",
                          fontSize: "18px",
                        }}
                        onClick={() =>
                          setDotOffset(
                            Math.min(
                              dotOffset + dotsPerGroup,
                              dots.length - dotsPerGroup
                            )
                          )
                        }
                        aria-label="Next Dots"
                      >
                        &gt;
                      </button>
                    )}
                  </div>
                );
              }}
              customPaging={(i) => (
                <button
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "none",
                    border: "none",
                    padding: 0,
                    margin: "0 5px",
                  }}
                ></button>
              )}
              beforeChange={(current, next) => {
                const newGroup = Math.floor(next / dotsPerGroup);
                const newOffset = newGroup * dotsPerGroup;
                if (newOffset !== dotOffset) {
                  setDotOffset(newOffset);
                }
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

          {/* Full Description */}
          <Typography
            id="description-modal-title"
            variant="h5"
            fontWeight="bold"
          >
            Full Description
          </Typography>
          <Typography
            id="description-modal-content"
            sx={{ mt: 2 }}
            dangerouslySetInnerHTML={{ __html: selectedDescription }}
          ></Typography>

          {/* Map Section */}
          {selectedLat && selectedLng && (
            <Box sx={{ mt: 3 }}>
              <MapContainer
                center={[selectedLat, selectedLng]}
                zoom={15}
                style={{
                  height: "300px",
                  width: "100%",
                  marginBottom: "20px",
                }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[selectedLat, selectedLng]} icon={markerIcon}>
                  <Popup>Airbnb Location</Popup>
                </Marker>

                {destinations.map((destination, index) => (
                  <Marker
                    key={index}
                    position={[destination.lat, destination.lon]}
                    icon={markerIcon}
                  >
                    <Popup>{destination.name}</Popup>
                  </Marker>
                ))}

                <Circle
                  center={[selectedLat, selectedLng]}
                  radius={482.8} // 0.30 miles in meters
                  pathOptions={{
                    color: "blue",
                    fillColor: "lightblue",
                    fillOpacity: 0.5,
                  }}
                />
              </MapContainer>

              <Typography
                variant="body1"
                sx={{
                  textAlign: "center",
                  fontStyle: "italic",
                  fontWeight: "500",
                  mt: 2,
                }}
              >
                The Airbnb is located within this radius. The exact address
                will be shared with you after your booking is confirmed.
              </Typography>
            </Box>
          )}

          {/* Accordion Section */}
          <Box sx={{ mt: 3 }}>
            {/** "The Space" Accordion */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body1" fontWeight="bold">
                  The Space
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  variant="body2"
                  dangerouslySetInnerHTML={{
                    __html:
                      selectedAccordionData?.theSpace ||
                      "Details about the space are not available.",
                  }}
                ></Typography>
              </AccordionDetails>
            </Accordion>

            {/** "Other Things to Note" Accordion */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body1" fontWeight="bold">
                  Other Things to Note
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  variant="body2"
                  dangerouslySetInnerHTML={{
                    __html:
                      selectedAccordionData?.otherThings ||
                      "Details about other things to note are not available.",
                  }}
                ></Typography>
              </AccordionDetails>
            </Accordion>
          </Box>

          {/* Close Button for "View More" Modal */}
          <Button
            variant="contained"
            onClick={handleCloseModal}
            sx={{
              backgroundColor: '#ff385c !important',
              color: '#fff !important',
              '&:hover': {
                backgroundColor: '#e03852 !important',
              },
              mt: 3,
            }}
          >
            Close & Return
          </Button>
        </Box>
      </Modal>

      {/* "About Host" Modal */}
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
            width: "60%",
            maxWidth: 600,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 4,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          {/* Host Information */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            {selectedHostProfilePicture && (
              <Avatar
                src={selectedHostProfilePicture}
                alt={selectedHostName}
                sx={{ width: 80, height: 80, mr: 2 }}
              />
            )}
            <Box>
              <Typography variant="h6">
                {selectedHostName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {hostYearsHosting()}{" "}
                {hostYearsHosting() === 1 ? "Year" : "Years"} Hosting
              </Typography>
            </Box>
          </Box>

          {/* Superhost and Verified Badges */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            {/* Superhost Badge */}
            {isSuperhost && (
              <Tooltip title="Superhost">
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <StarIcon sx={{ color: "gold", mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    Superhost
                  </Typography>
                </Box>
              </Tooltip>
            )}

            {/* Verified Badge */}
            {isVerified && (
              <Tooltip title="Verified Host">
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <VerifiedUserIcon sx={{ color: "blue", mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    Verified
                  </Typography>
                </Box>
              </Tooltip>
            )}
          </Box>

          {/* Host Review Statistics */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Rating value={hostRatingHost} precision={0.1} readOnly />
            <Typography variant="body2" color="text.secondary">
              {hostRatingHost.toFixed(2)} ({hostReviewsHost} reviews)
            </Typography>
          </Box>

          {/* About Host Text */}
          <Typography
            id="about-host-modal-content"
            variant="body1"
            sx={{ whiteSpace: "pre-line" }}
          >
            {hostAboutText}
          </Typography>

          {/* Handle Missing Host Description */}
          {hostAboutText === "Information not available" && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2, fontStyle: "italic" }}
            >
              No additional information about the host is available at this time.
            </Typography>
          )}

          {/* Optional: Host Highlights (if available) */}
          {/* You can uncomment and implement this section if you have hostHighlights data */}
          {/*
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Host Highlights
            </Typography>
            <ul>
              {hostHighlights.map((highlight, index) => (
                <li key={index}>
                  <Typography variant="body2">{highlight.title}</Typography>
                </li>
              ))}
            </ul>
          </Box>
          */}

          {/* Close Button for "About Host" Modal */}
          <Button
            variant="contained"
            onClick={handleCloseAboutHostModal}
            sx={{
              backgroundColor: '#ff385c !important',
              color: '#fff !important',
              '&:hover': {
                backgroundColor: '#e03852 !important',
              },
              mt: 3,
            }}
          >
            Close & Return
          </Button>
        </Box>
      </Modal>
    </Box>
  );

  // **Helper Functions**

  // Function to retrieve yearsHosting for the selected host
  function listingYearsHosting() {
    const selectedListing = listings.find(
      (listing) => listing.hostName === selectedHostName
    );
    return selectedListing ? selectedListing.yearsHosting : "0";
  }

  // Function to parse yearsHosting as integer
  function hostYearsHosting() {
    const years = parseInt(listingYearsHosting(), 10);
    return isNaN(years) ? 0 : years;
  }
}

export default Airbnb;