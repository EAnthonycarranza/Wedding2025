require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const { google } = require("googleapis");
const { Storage } = require("@google-cloud/storage");
const fileUpload = require("express-fileupload");
const path = require("path");
const helmet = require("helmet"); // For security headers
const rateLimit = require("express-rate-limit"); // For rate limiting

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload()); // For handling file uploads

// Remove any pre-existing CSP headers
app.use((req, res, next) => {
  res.removeHeader("Content-Security-Policy");
  next();
});

// Set a custom relaxed CSP header
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; connect-src 'self' https://storage.googleapis.com; img-src 'self' https://storage.googleapis.com data:;"
  );
  next();
});

// CORS Configuration
app.use(
  cors({
    origin: "https://hidden-citadel-88874-96e904553ae6.herokuapp.com", // Your frontend domain
    credentials: true,
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

// Initialize Google Cloud Storage
const storage = new Storage({
  credentials: {
    client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: GOOGLE_PRIVATE_KEY,
  },
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

const bucket = storage.bucket(GCLOUD_BUCKET_NAME);

let rsvpCollection; // Declare RSVP collection here

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

// RSVP Routes

// 1. Get RSVP Data for a Family (from MongoDB only)
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
    console.error(
      `Error fetching RSVP data for family ${familyName}:`,
      error
    );
    res.status(500).json({ message: "Error fetching RSVP data" });
  }
});

// 2. Update RSVP Data (PUT for both MongoDB and Google Sheets)
app.put("/rsvp", verifyJWT, async (req, res) => {
  const { familyMembers } = req.body; // Contains array of family members
  const familyName = req.familyName;

  try {
    if (!rsvpCollection) {
      throw new Error("rsvpCollection is not initialized");
    }

    // Update in MongoDB
    await rsvpCollection.updateOne(
      { familyName },
      { $set: { familyMembers } },
      { upsert: true }
    );

    console.log(`RSVP updated in MongoDB for family: ${familyName}`);

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
      res.status(200).json({ message: "Family member deleted successfully!" });
    } else {
      res.status(404).json({ message: "RSVP not found for the family" });
    }
  } catch (error) {
    console.error("Error deleting family member:", error);
    res.status(500).json({ message: "Error deleting family member" });
  }
});

// 3. Submit RSVP (POST for both MongoDB and Google Sheets)
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
    res.status(200).json({ message: "RSVP submitted successfully!" });
  } catch (error) {
    console.error("Error submitting RSVP:", error);
    res.status(500).json({ message: "Error submitting RSVP data" });
  }
});

// Handle React routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
