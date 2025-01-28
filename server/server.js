// File: server.js (or wherever you configure helmet)

require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const { google } = require("googleapis");
const { Storage } = require("@google-cloud/storage");
const fileUpload = require("express-fileupload");
const path = require("path");
const helmet = require("helmet"); 
const rateLimit = require("express-rate-limit");
const axios = require("axios");
const app = express();
const fetch = require("node-fetch"); // Ensure node-fetch@2 is installed
const pRetry = require("p-retry");   // Ensure p-retry@4 is installed
const pLimit = require("p-limit");   // For concurrency control
const NodeCache = require("node-cache");
app.use(fileUpload());
const mongoose = require("mongoose"); // Import Mongoose
const cron = require("node-cron");    // Import node-cron
console.log("RapidAPI Key:", process.env.RAPIDAPI_KEY);
const availabilityCache = new NodeCache();
const detailsCache = new NodeCache();

// Define the isCompletelyNullListing function
function isCompletelyNullListing(listing) {
  return Object.values(listing).every(value => value === null || value === undefined);
}


// server.js
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://stackpath.bootstrapcdn.com",
        "https://www.myregistry.com"
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://stackpath.bootstrapcdn.com",
        "https://maps.googleapis.com",
        "https://www.myregistry.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https://storage.googleapis.com",
        "https://*.googleusercontent.com",
        "https://*.gstatic.com",
        "https://freesvg.org",
        "https://*.tile.openstreetmap.org",
        "https://a0.muscache.com",
        "https://unpkg.com"
      ],
      connectSrc: [
        "'self'",
        "https://router.project-osrm.org",
        "https://www.myregistry.com",
        "https://storage.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com"
      ],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: [
        "'self'",
        "https://www.myregistry.com"   // ← allow MyRegistry iFrame
      ],
      frameAncestors: ["'self'", "https://www.myregistry.com"]

    }
  }
}));



app.use(
  cors({
    origin: "*", // Allow all origins for testing
  })
);

// Serve static files from the React app

app.use(express.static(path.join(__dirname, "../client/build")));

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/weddingDB";
const SHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GCLOUD_BUCKET_NAME = process.env.GCLOUD_BUCKET_NAME;

// Google Sheets API Setup using Service Account
const sheetsAuth = new google.auth.GoogleAuth({
  credentials: {
    client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: GOOGLE_PRIVATE_KEY,
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth: sheetsAuth });

// Google Cloud Storage
const storage = new Storage({
  credentials: {
    client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: GOOGLE_PRIVATE_KEY,
  },
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});
const bucket = storage.bucket(GCLOUD_BUCKET_NAME);

let rsvpCollection;

// MongoDB Connection
async function connectMongoDB() {
  try {
    const client = await MongoClient.connect(MONGO_URI, {
      useUnifiedTopology: true,
    });
    const database = client.db("weddingDB");
    rsvpCollection = database.collection("rsvps");
    console.log("Connected to MongoDB and RSVP Collection initialized");
  } catch (err) {
    console.error("Error connecting to MongoDB", err);
  }
}
connectMongoDB();

// -------------------------------------------------------------------------------------
// MongoDB Connection
// -------------------------------------------------------------------------------------

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ Connected to MongoDB successfully!");
})
.catch((error) => {
  console.error("❌ Error connecting to MongoDB:", error.message);
});

// -------------------------------------------------------------------------------------
// Mongoose Schema and Model for Airbnb Listings
// -------------------------------------------------------------------------------------

const airbnbListingSchema = new mongoose.Schema({
  airbnb_id: { type: String, required: true, unique: true },
  details: { type: mongoose.Schema.Types.Mixed, required: true }, // Stores the entire details object
  lastFetched: { type: Date, default: Date.now }, // Timestamp of the last fetch
});

// Create an index on airbnb_id for faster queries
airbnbListingSchema.index({ airbnb_id: 1 });

const AirbnbListing = mongoose.model("AirbnbListing", airbnbListingSchema);

// -------------------------------------------------------------------------------------
// Airbnb Listings Endpoint with Availability Data
// GET /api/airbnb-listings?nwLat=...&nwLng=...&seLat=...&seLng=...
// -------------------------------------------------------------------------------------
app.get("/api/airbnb-listings", async (req, res) => {
  const url = "https://airbnb-listings.p.rapidapi.com/v2/listingsByLatLng?lat=29.60179085538804&lng=-98.3616098529668&range=8046.72&offset=0";
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY, // Use environment variable
      "x-rapidapi-host": "airbnb-listings.p.rapidapi.com",
    },
    timeout: 600000, // 10 minutes timeout
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      return res.status(response.status).json({
        error: `Airbnb Listings API responded with status: ${response.status}`,
      });
    }

    const result = await response.json(); // Parse as JSON
    console.log("Fetched Airbnb Listings:", JSON.stringify(result, null, 2)); // Log the result
    res.json(result); // Send the JSON result to the client
  } catch (error) {
    console.error("❌ Error fetching Airbnb listings:", error.message);
    res.status(500).json({ error: "Failed to fetch Airbnb listings" });
  }
});

// -------------------------------------------------------------------------------------
// Single-Listing Endpoint (Detailed Info for One Listing, Filter Out Nulls)
// GET /api/single-listing?id=LISTING_ID
// -------------------------------------------------------------------------------------
app.get("/api/single-listing", async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res
      .status(400)
      .json({ error: "Missing listing ID parameter" });
  }

  const url = `https://airbnb-listings.p.rapidapi.com/v2/listing?id=${id}`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": "airbnb-listings.p.rapidapi.com",
    },
    timeout: 600000, // 10 minutes timeout
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      return res.status(response.status).json({
        error: `Listing detail API responded with status: ${response.status}`,
      });
    }

    // Expecting: { requestId: "...", results: [ {...} ] }
    const data = await response.json();
    const results = data.results || [];

    // If there's at least one detail:
    if (results.length > 0) {
      const listing = results[0];

      // If "all null," skip
      if (isCompletelyNullListing(listing)) {
        return res.json({
          message: "No valid data for this listing (all fields are null).",
          listingID: id,
        });
      } else {
        // Otherwise respond normally
        return res.json({ listing });
      }
    } else {
      return res.json({ message: "No listing found for that ID.", listingID: id });
    }
  } catch (err) {
    console.error("❌ Error fetching single listing:", err.message);
    return res.status(500).json({ error: "Failed to fetch single listing" });
  }
});

// -------------------------------------------------------------------------------------
// Single Listing Detail Endpoint (Fetch Directly from API)
// GET /api/single-listing-detail
// -------------------------------------------------------------------------------------
app.get("/api/single-listing-detail", async (req, res) => {
  const { id } = req.query; // Expecting the Airbnb listing ID as a query parameter

  if (!id) {
    return res.status(400).json({ error: "Missing listing ID parameter" });
  }

  const url = `https://airbnb-listings.p.rapidapi.com/v2/listing?id=${id}`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY, // Replace with your RapidAPI key
      "x-rapidapi-host": "airbnb-listings.p.rapidapi.com",
    },
  };

  try {
    // Fetch the listing details from the external API
    const response = await fetch(url, options);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `API responded with status: ${response.status}`,
      });
    }

    const result = await response.json(); // Parse the API response as JSON
    console.log("Fetched Listing Details:", JSON.stringify(result, null, 2)); // Debugging log

    // Return the detailed result to the client
    res.json(result);
  } catch (error) {
    console.error("❌ Error fetching listing detail:", error.message);
    res.status(500).json({ error: "Failed to fetch listing detail" });
  }
});

// -------------------------------------------------------------------------------------
// Endpoint to fetch availability for a specific listing
// GET /api/listing-availability?id=LISTING_ID&year=2025&month=6
// -------------------------------------------------------------------------------------
app.get("/api/listing-availability", async (req, res) => {
  const { id, year = 2025, month = 6 } = req.query;

  if (!id) {
    return res
      .status(400)
      .json({ error: "Missing listing ID (id) parameter" });
  }

  const availabilityUrl = `https://airbnb-listings.p.rapidapi.com/v2/listingavailability?id=${id}&year=${year}&month=${month}`;
  const availabilityOptions = {
    method: "GET",
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": "airbnb-listings.p.rapidapi.com",
    },
    timeout: 600000, // 10 minutes timeout
  };

  try {
    // Check cache first
    const cacheKey = `availability_${id}_${year}_${month}`;
    const cachedAvailability = availabilityCache.get(cacheKey);
    if (cachedAvailability) {
      console.log(`🗂️ Serving availability from NodeCache for listing ${id}`);
      return res.json(cachedAvailability);
    }

    const response = await fetch(availabilityUrl, availabilityOptions);
    if (!response.ok) {
      throw new Error(
        `Availability API responded with status: ${response.status}`
      );
    }

    const result = await response.json();
    // Cache the result
    availabilityCache.set(cacheKey, result);
    return res.json(result);
  } catch (error) {
    console.error(
      `❌ Error fetching availability for listing ${id}:`,
      error.message
    );
    return res
      .status(500)
      .json({ error: "Failed to fetch listing availability" });
  }
});

// -------------------------------------------------------------------------------------
// Endpoint to fetch touristy places in San Antonio
// GET /api/places?radius=...&lat=...&lng=...
// -------------------------------------------------------------------------------------
app.get("/api/places", async (req, res) => {
  const radius = req.query.radius ? parseInt(req.query.radius) : 5000; // Default 5km
  const defaultLat = 29.4241; // San Antonio lat
  const defaultLng = -98.4936; // San Antonio lng

  const latitude = req.query.lat ? parseFloat(req.query.lat) : defaultLat;
  const longitude = req.query.lng ? parseFloat(req.query.lng) : defaultLng;

  try {
    // Validate
    if (isNaN(latitude) || isNaN(longitude)) {
      return res
        .status(400)
        .json({ error: "Invalid or missing latitude/longitude" });
    }

    // Overpass API query
    const response = await axios.get("https://overpass-api.de/api/interpreter", {
      params: {
        data: `
          [out:json];
          (
            node["tourism"="attraction"](around:${radius}, ${latitude}, ${longitude});
            node["tourism"="museum"](around:${radius}, ${latitude}, ${longitude});
            node["tourism"="zoo"](around:${radius}, ${latitude}, ${longitude});
            node["historic"](around:${radius}, ${latitude}, ${longitude});
            node["leisure"](around:${radius}, ${latitude}, ${longitude});
          );
          out body;
        `,
      },
      timeout: 600000, // 10 minutes timeout
    });

    const places = response.data.elements
      .map((place) => ({
        id: place.id,
        name: place.tags.name || "Unknown Place",
        type:
          place.tags.tourism ||
          place.tags.historic ||
          place.tags.leisure ||
          "Unknown",
        lat: place.lat,
        lon: place.lon,
      }))
      .filter((place) => place.name !== "Unknown Place"); // remove unknown

    if (places.length === 0) {
      return res.status(404).json({ error: "No touristy places found." });
    }

    res.json(places);
  } catch (error) {
    console.error("❌ Error fetching places:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch places. Please try again later." });
  }
});

// -------------------------------------------------------------------------------------
// Endpoint to calculate ETA/distance using OSRM API
// GET /api/eta?originLat=...&originLon=...&destLat=...&destLon=...
// -------------------------------------------------------------------------------------
app.get("/api/eta", async (req, res) => {
  const { originLat, originLon, destLat, destLon } = req.query;

  if (!originLat || !originLon || !destLat || !destLon) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    // Use environment variables for IP and port
    const osrmPrimaryIp = process.env.OSRM_IP; // e.g., 67.48.84.205
    const osrmFallbackIp = "192.168.1.48"; // Local IP for fallback
    const osrmPort = process.env.OSRM_PORT || 9005;

    let url = `http://${osrmPrimaryIp}:${osrmPort}/route/v1/driving/${originLon},${originLat};${destLon},${destLat}?overview=false`;

    // Attempt request to the primary IP
    let response;
    try {
      response = await axios.get(url, { timeout: 600000 }); // 10 minutes timeout
    } catch (primaryError) {
      console.warn("⚠️ Primary OSRM server unreachable. Falling back to local IP.");
      url = `http://${osrmFallbackIp}:${osrmPort}/route/v1/driving/${originLon},${originLat};${destLon},${destLat}?overview=false`;
      response = await axios.get(url, { timeout: 600000 }); // 10 minutes timeout
    }

    const data = response.data;

    if (data.code !== "Ok") {
      return res.status(500).json({ error: "Error fetching route from OSRM" });
    }

    // Extract the duration and distance from OSRM response
    const route = data.routes[0];
    const duration = route.duration; // Duration in seconds
    const distance = route.distance; // Distance in meters

    // Convert distance to miles (optional)
    const distanceInMiles = (distance / 1609.34).toFixed(2); // 1609.34 meters in a mile

    // Convert duration to a more readable format
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const durationString = `${hours} hours ${minutes} minutes`;

    return res.json({
      distance: `${distanceInMiles} miles`,
      duration: durationString,
    });
  } catch (error) {
    console.error("❌ Error fetching ETA:", error.message);
    res.status(500).json({ error: "Failed to fetch ETA" });
  }
});

// -------------------------------------------------------------------------------------
// New Endpoint to Fetch Detailed Information for All Airbnb Listings
// GET /api/airbnb-details
// -------------------------------------------------------------------------------------
app.get("/api/airbnb-details", async (req, res) => {
  try {
    // Step 1: Fetch the list of Airbnb listings
    const listingsUrl = "https://airbnb-listings.p.rapidapi.com/v2/listingsByLatLng?lat=29.60179085538804&lng=-98.3616098529668&range=8046.72&offset=0";
    const listingsOptions = {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": "airbnb-listings.p.rapidapi.com",
      },
      timeout: 600000, // 10 minutes timeout
    };

    const listingsResponse = await fetch(listingsUrl, listingsOptions);
    if (!listingsResponse.ok) {
      return res.status(listingsResponse.status).json({
        error: `Failed to fetch listings: ${listingsResponse.statusText}`,
      });
    }

    const listingsData = await listingsResponse.json();
    const airbnbIds = listingsData.results.map(item => item.airbnb_id);

    // Remove duplicates if any
    const uniqueAirbnbIds = [...new Set(airbnbIds)];

    // Step 2: Query MongoDB for existing listings
    const existingListings = await AirbnbListing.find({ airbnb_id: { $in: uniqueAirbnbIds } }).lean();

    // Extract airbnb_ids that are already in MongoDB
    const existingIds = existingListings.map(listing => listing.airbnb_id);

    // Determine which airbnb_ids need to be fetched from the external API
    const idsToFetch = uniqueAirbnbIds.filter(id => !existingIds.includes(id));

    console.log(`✅ Found ${existingIds.length} listings in MongoDB.`);
    console.log(`🔍 Need to fetch details for ${idsToFetch.length} new listings.`);

    // Step 3: Set up concurrency limit (e.g., 5 concurrent requests)
    const limit = pLimit(5);

    // Step 4: Function to fetch details for a single airbnb_id, with caching and retries
    const fetchListingDetails = async (airbnb_id) => {
      // Check if details are already cached in NodeCache
      const cachedDetails = detailsCache.get(`details_${airbnb_id}`);
      if (cachedDetails) {
        console.log(`🗂️ Serving details from NodeCache for listing ${airbnb_id}`);
        return cachedDetails;
      }

      // Construct the dynamic URL
      const encodedUrl = encodeURIComponent(`https://www.airbnb.com/rooms/${airbnb_id}`);
      const detailsUrl = `https://airbnb-api5.p.rapidapi.com/details?url=${encodedUrl}`;

      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
          'x-rapidapi-host': 'airbnb-api5.p.rapidapi.com'
        },
        timeout: 600000, // 10 minutes timeout
      };

      try {
        // Use p-retry to handle transient errors with up to 3 retries and exponential backoff
        const result = await pRetry(async () => {
          const response = await fetch(detailsUrl, options);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json(); // Assuming the API returns JSON
        }, {
          retries: 3,
          factor: 2, // Exponential backoff factor
          minTimeout: 1000, // Initial wait time: 1 second
          maxTimeout: 4000, // Maximum wait time: 4 seconds
          onFailedAttempt: error => {
            console.warn(`⚠️ Attempt ${error.attemptNumber} failed for ${airbnb_id}. There are ${error.retriesLeft} retries left.`);
          }
        });

        // Cache the result in NodeCache
        detailsCache.set(`details_${airbnb_id}`, result);
        console.log(`💾 Fetched and cached details for listing ${airbnb_id}`);

        // Save the details to MongoDB
        const newListing = new AirbnbListing({
          airbnb_id: airbnb_id,
          details: result,
          lastFetched: new Date(),
        });

        await newListing.save();
        console.log(`📝 Saved details to MongoDB for listing ${airbnb_id}`);

        return result;
      } catch (error) {
        console.error(`❌ Error fetching details for ${airbnb_id}:`, error.message);
        return null; // Return null to indicate failure for this ID
      }
    };

    // Step 5: Fetch details for all airbnb_ids that are not in MongoDB
    const detailPromises = idsToFetch.map(airbnb_id => 
      limit(() => fetchListingDetails(airbnb_id))
    );

    const detailsResults = await Promise.all(detailPromises);

    // Step 6: Filter out any null results due to fetch failures
    const validDetails = detailsResults.filter(detail => detail !== null);

    // Step 7: Combine existing listings with newly fetched details
    const allDetails = existingListings.map(listing => listing.details).concat(validDetails);

    // Step 8: Respond with aggregated details
    res.json({
      requestId: listingsData.requestId,
      totalListings: uniqueAirbnbIds.length,
      fetchedFromDB: existingListings.length,
      fetchedFromAPI: validDetails.length,
      details: allDetails,
      failedIds: idsToFetch.filter((id, index) => detailsResults[index] === null),
    });

  } catch (error) {
    console.error("❌ Error fetching Airbnb details:", error.message);
    res.status(500).json({ error: "Failed to fetch Airbnb details" });
  }
});

// -------------------------------------------------------------------------------------
// Optional: Endpoint to fetch details for a single Airbnb listing
// GET /api/airbnb-detail?id=AIRBNB_ID
// -------------------------------------------------------------------------------------
app.get("/api/airbnb-detail", async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing listing ID parameter" });
  }

  try {
    // Check if details are cached in MongoDB
    let listing = await AirbnbListing.findOne({ airbnb_id: id }).lean();

    if (listing) {
      console.log(`🗂️ Serving details from MongoDB for listing ${id}`);
      return res.json(listing.details);
    }

    // If not found in MongoDB, proceed to fetch from external API
    const encodedUrl = encodeURIComponent(`https://www.airbnb.com/rooms/${id}`);
    const detailsUrl = `https://airbnb-api5.p.rapidapi.com/details?url=${encodedUrl}`;

    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'airbnb-api5.p.rapidapi.com'
      },
      timeout: 600000, // 10 minutes timeout
    };

    // Fetch with retries
    const result = await pRetry(async () => {
      const response = await fetch(detailsUrl, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    }, {
      retries: 3,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 4000,
      onFailedAttempt: error => {
        console.warn(`⚠️ Attempt ${error.attemptNumber} failed for ${id}. There are ${error.retriesLeft} retries left.`);
      }
    });

    // Save the details to MongoDB
    const newListing = new AirbnbListing({
      airbnb_id: id,
      details: result,
      lastFetched: new Date(),
    });

    await newListing.save();
    console.log(`📝 Saved details to MongoDB for listing ${id}`);

    // Cache the result in NodeCache (if implemented)
    detailsCache.set(`details_${id}`, result);

    res.json(result);

  } catch (error) {
    console.error(`❌ Error fetching details for ${id}:`, error.message);
    res.status(500).json({ error: "Failed to fetch listing details" });
  }
});

// -------------------------------------------------------------------------------------
// Scheduled Task to Refresh All Listings Daily at Midnight
// GET /api/refresh-all-listings
// -------------------------------------------------------------------------------------
cron.schedule("0 0 * * *", async () => {
  console.log("🕛 Scheduled Task: Refreshing all Airbnb listings...");

  try {
    // Fetch all airbnb_ids from MongoDB
    const allListings = await AirbnbListing.find({}, 'airbnb_id').lean();
    const airbnbIds = allListings.map(listing => listing.airbnb_id);

    // Set up concurrency limit
    const limit = pLimit(5);

    // Function to refresh listing details
    const refreshListing = async (airbnb_id) => {
      const encodedUrl = encodeURIComponent(`https://www.airbnb.com/rooms/${airbnb_id}`);
      const detailsUrl = `https://airbnb-api5.p.rapidapi.com/details?url=${encodedUrl}`;

      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
          'x-rapidapi-host': 'airbnb-api5.p.rapidapi.com'
        },
        timeout: 600000, // 10 minutes timeout
      };

      try {
        const result = await pRetry(async () => {
          const response = await fetch(detailsUrl, options);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        }, {
          retries: 3,
          factor: 2,
          minTimeout: 1000,
          maxTimeout: 4000,
          onFailedAttempt: error => {
            console.warn(`⚠️ Attempt ${error.attemptNumber} failed for ${airbnb_id}. There are ${error.retriesLeft} retries left.`);
          }
        });

        // Update MongoDB
        await AirbnbListing.findOneAndUpdate(
          { airbnb_id: airbnb_id },
          { details: result, lastFetched: new Date() },
          { new: true }
        ).lean();

        // Update NodeCache
        detailsCache.set(`details_${airbnb_id}`, result);

        console.log(`✅ Successfully refreshed listing ${airbnb_id}`);
      } catch (error) {
        console.error(`❌ Error refreshing listing ${airbnb_id}:`, error.message);
      }
    };

    // Initiate refresh for all listings
    const refreshPromises = airbnbIds.map(airbnb_id => 
      limit(() => refreshListing(airbnb_id))
    );

    await Promise.all(refreshPromises);
    console.log("🟢 Scheduled Task: Completed refreshing all Airbnb listings.");
  } catch (error) {
    console.error("❌ Scheduled Task Error:", error.message);
  }
});


// Load families data with tokens from JSON file
const families = require("./families.json");
families.forEach((family) => {
  // Be sure to URL-encode the token just in case
  const url1 = `https://hidden-citadel-88874-96e904553ae6.herokuapp.com/?token=${encodeURIComponent(family.token)}`;
  const url2 = `https://www.christinaandanthony2025.com/?token=${encodeURIComponent(family.token)}`;

  console.log(`Family: ${family.familyName}`);
  console.log("URL1:", url1);
  console.log("URL2:", url2);
  console.log("---");
});

// Middleware to verify JWT
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(403)
      .json({ message: "No token provided or invalid format" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Failed to authenticate token" });
    }
    req.familyName = decoded.familyName;
    next();
  });
};

// Rate Limiting for /authenticate
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: "Too many authentication attempts from this IP, please try again later",
});
app.use("/authenticate", authLimiter);

// User authentication with JWT issuance
app.post("/authenticate", (req, res) => {
  const { password, token } = req.body;
  let familyEntry;

  if (password) {
    familyEntry = families.find((family) => family.password === password);
  } else if (token) {
    familyEntry = families.find((family) => family.token === token);
  } else {
    return res
      .status(400)
      .json({ success: false, message: "No credentials provided" });
  }

  if (familyEntry) {
    const { familyName } = familyEntry;
    const jwtToken = jwt.sign({ familyName }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ success: true, token: jwtToken, familyName });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// Check authentication
app.get("/check-auth", verifyJWT, (req, res) => {
  try {
    res.status(200).json({ isAuthenticated: true, familyName: req.familyName });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error checking authentication" });
  }
});

// 1. Get RSVP Data for a Family (MongoDB)
app.get("/rsvp", verifyJWT, async (req, res) => {
  const familyName = req.familyName;
  console.log(`Fetching RSVP for family: ${familyName}`);
  try {
    if (!rsvpCollection) {
      throw new Error("rsvpCollection is not initialized");
    }
    const rsvpFromMongo = await rsvpCollection.findOne({ familyName });
    if (rsvpFromMongo) {
      console.log(`RSVP found for family: ${familyName}`, rsvpFromMongo);
      res.status(200).json({ mongoData: rsvpFromMongo });
    } else {
      console.log(`No RSVP found for family: ${familyName}`);
      res.status(200).json({ mongoData: null });
    }
  } catch (error) {
    console.error(`Error fetching RSVP data for family ${familyName}:`, error);
    res.status(500).json({ message: "Error fetching RSVP data" });
  }
});

// 2. Update RSVP Data (PUT)
app.put("/rsvp", verifyJWT, async (req, res) => {
  const { familyMembers } = req.body; 
  const familyName = req.familyName;
  try {
    if (!rsvpCollection) {
      throw new Error("rsvpCollection is not initialized");
    }
    await rsvpCollection.updateOne(
      { familyName },
      { $set: { familyMembers } },
      { upsert: true }
    );
    console.log(`RSVP updated in MongoDB for family: ${familyName}`);

    // Update Google Sheets
    const rows = familyMembers.map((member) => [
      familyName,
      member.firstName,
      member.lastName,
      member.rsvpStatus || "No Status",
    ]);

    const sheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "RSVP LIST!A:E",
    });

    const existingRows = sheetResponse.data.values || [];
    const rowIndex = existingRows.findIndex((row) => row[0] === familyName);

    if (rowIndex >= 0) {
      const lastFamilyRowIndex = rowIndex + familyMembers.length - 1;
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SHEET_ID,
        range: `RSVP LIST!A${rowIndex + 1}:D${lastFamilyRowIndex + 1}`,
      });
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `RSVP LIST!A${rowIndex + 1}`,
        valueInputOption: "USER_ENTERED",
        resource: { values: rows },
      });
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: "RSVP LIST!A:E",
        valueInputOption: "USER_ENTERED",
        resource: { values: rows },
      });
    }
    console.log(`RSVP updated in Google Sheets for family: ${familyName}`);
    res.status(200).json({ message: "RSVP updated successfully!" });
  } catch (error) {
    console.error("Error updating RSVP:", error);
    res.status(500).json({ message: "Error updating RSVP data" });
  }
});

// DELETE route to remove a family member
app.delete("/rsvp", verifyJWT, async (req, res) => {
  const { familyMember } = req.body;
  const familyName = req.familyName;
  try {
    if (!rsvpCollection) {
      throw new Error("rsvpCollection is not initialized");
    }
    const familyRsvp = await rsvpCollection.findOne({ familyName });
    if (familyRsvp) {
      const updatedFamilyMembers = familyRsvp.familyMembers.filter(
        (member) =>
          member.firstName !== familyMember.firstName ||
          member.lastName !== familyMember.lastName
      );

      await rsvpCollection.updateOne(
        { familyName },
        { $set: { familyMembers: updatedFamilyMembers } }
      );
      console.log(`RSVP updated in MongoDB for family: ${familyName}`);

      // Also clear from Google Sheets
      const sheetResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "RSVP LIST!A:E",
      });
      const existingRows = sheetResponse.data.values || [];
      const rowIndex = existingRows.findIndex(
        (row) =>
          row[1] === familyMember.firstName &&
          row[2] === familyMember.lastName
      );
      if (rowIndex >= 0) {
        await sheets.spreadsheets.values.clear({
          spreadsheetId: SHEET_ID,
          range: `RSVP LIST!A${rowIndex + 1}:E${rowIndex + 1}`,
        });
      }
      console.log(
        `Family member ${familyMember.firstName} ${familyMember.lastName} removed from Google Sheets`
      );

      res.status(200).json({ message: "Family member deleted successfully!" });
    } else {
      res.status(404).json({ message: "RSVP not found for the family" });
    }
  } catch (error) {
    console.error("Error deleting family member:", error);
    res.status(500).json({ message: "Error deleting family member" });
  }
});

// 3. Submit RSVP (POST)
app.post("/submit-rsvp", verifyJWT, async (req, res) => {
  const { familyMembers } = req.body;
  const familyName = req.familyName;
  try {
    if (!rsvpCollection) {
      throw new Error("rsvpCollection is not initialized");
    }
    await rsvpCollection.updateOne(
      { familyName },
      { $set: { familyMembers } },
      { upsert: true }
    );
    console.log(`RSVP submitted in MongoDB for family: ${familyName}`);

    // Update Sheets
    const rows = familyMembers.map((member) => [
      familyName,
      member.firstName,
      member.lastName,
      member.rsvpStatus || "No Status",
    ]);

    const sheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "RSVP LIST!A:E",
    });
    const existingRows = sheetResponse.data.values || [];
    const rowIndex = existingRows.findIndex((row) => row[0] === familyName);

    if (rowIndex >= 0) {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SHEET_ID,
        range: `RSVP LIST!A${rowIndex + 1}:E${rowIndex + familyMembers.length}`,
      });
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `RSVP LIST!A${rowIndex + 1}`,
        valueInputOption: "USER_ENTERED",
        resource: { values: rows },
      });
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: "RSVP LIST!A:E",
        valueInputOption: "USER_ENTERED",
        resource: { values: rows },
      });
    }
    console.log(`RSVP submitted in Google Sheets for family: ${familyName}`);
    res.status(200).json({ message: "RSVP submitted successfully!" });
  } catch (error) {
    console.error("Error submitting RSVP:", error);
    res.status(500).json({ message: "Error submitting RSVP data" });
  }
});

// Upload endpoint to Google Cloud Storage
app.post("/upload", async (req, res) => {
  try {
    if (!req.files || !req.files.files) {
      console.log("No files found in the request.");
      return res.status(400).json({ message: "No files uploaded" });
    }
    const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
    const fileLinks = [];
    for (const file of files) {
      console.log(`Processing file: ${file.name}, type: ${file.mimetype}, size: ${file.size}`);
      const blob = bucket.file(file.name);
      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: { contentType: file.mimetype },
      });
      await new Promise((resolve, reject) => {
        blobStream.on("error", (err) => {
          console.error(`Blob stream error for file: ${file.name}`, err);
          reject(
            res.status(500).json({
              message: `Error uploading file to Google Cloud Storage: ${file.name}`,
              err,
            })
          );
        });
        blobStream.on("finish", async () => {
          try {
            await blob.makePublic();
            const fileLink = `https://storage.googleapis.com/${GCLOUD_BUCKET_NAME}/${file.name}`;
            fileLinks.push(fileLink);
            console.log(`Public URL for ${file.name}: ${fileLink}`);
            resolve();
          } catch (err) {
            console.error(`Error making file ${file.name} public`, err);
            reject(
              res.status(500).json({
                message: `Error making file public: ${file.name}`,
                err,
              })
            );
          }
        });
        blobStream.end(file.data);
      });
    }
    console.log("All files uploaded and public URLs generated:", fileLinks);
    return res
      .status(200)
      .json({ message: "Files uploaded successfully", fileLinks });
  } catch (error) {
    console.error("Error uploading files to Google Cloud Storage:", error);
    return res.status(500).json({ message: "Failed to upload files", error });
  }
});

// Fetch images from Google Cloud Storage
app.get("/get-cloud-images", async (req, res) => {
  try {
    const [files] = await bucket.getFiles();
    const images = files.map(
      (file) => `https://storage.googleapis.com/${GCLOUD_BUCKET_NAME}/${file.name}`
    );
    res.json({ images });
  } catch (error) {
    console.error("Error fetching cloud images:", error);
    res.status(500).json({ message: "Error fetching images from Cloud Storage" });
  }
});

// Handle React routing (must be last)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Using Google Spreadsheet ID:", SHEET_ID);
});

