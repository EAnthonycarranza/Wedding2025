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

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'",
          "https://storage.googleapis.com",
          "https://www.myregistry.com",
          "https://maps.googleapis.com", // Allow connections to Google Maps API
          "https://maps.gstatic.com",   // Allow connections to Maps resources
          "https://*.tile.openstreetmap.fr", // Allow OpenStreetMap tiles
        ],
        imgSrc: [
          "'self'",
          "https://storage.googleapis.com",
          "data:",
          "https://www.myregistry.com",
          "https://maps.gstatic.com",   // Allow images from Google Maps
          "https://*.tile.openstreetmap.fr", // Allow OpenStreetMap tile images
        ],
        scriptSrc: [
          "'self'",
          "https://www.myregistry.com",
          "'unsafe-inline'",
          "https://stackpath.bootstrapcdn.com", // Allow Bootstrap scripts
          "https://maps.googleapis.com",        // Allow Google Maps API scripts
        ],
        styleSrc: [
          "'self'",
          "https://fonts.googleapis.com",
          "'unsafe-inline'",
          "https://www.myregistry.com",
          "https://stackpath.bootstrapcdn.com", // Allow Bootstrap styles
          "https://maps.gstatic.com",           // Allow styles for Google Maps
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
        ],
        frameSrc: ["'self'", "https://www.myregistry.com"],
      },
    },
  })
);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../client/build")));

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

// Load families data with tokens from JSON file
const families = require("./families.json");

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
