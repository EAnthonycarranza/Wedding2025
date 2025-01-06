const crypto = require("crypto");
const QRCode = require("qrcode");
const fs = require("fs");

// List of families with passwords
const families = [
  { familyName: "Velez Family", password: "A2@1h4$2" },
  { familyName: "Carranza Family", password: "B8#4p7%9" },
  { familyName: "Rivas Family", password: "C6&3k5!8" },
  { familyName: "Tristian Family", password: "D1@5q3^7" },
  { familyName: "Perez Family", password: "E4%9r6&2" },
  { familyName: "Rios Family", password: "F3$7p8#6" },
  { familyName: "Jones Family", password: "G5!2l9@4" },
  { familyName: "Guntle Family", password: "H7^3n1%5" },
  { familyName: "Lopez Family", password: "I8&6t4!2" },
  { familyName: "Long Family", password: "J9@2g5$1" },
];

// Generate tokens and QR codes
const generateTokensAndQRCodes = async () => {
  for (const family of families) {
    // Generate a secure random token
    family.token = crypto.randomBytes(16).toString("hex");

    // Create the URL with the token as a query parameter
    const urls = [
      `https://hidden-citadel-88874-96e904553ae6.herokuapp.com/?token=${encodeURIComponent(family.token)}`,
      `https://www.christinaandanthony2025.com/?token=${encodeURIComponent(family.token)}`,
    ];
    const qrCodePath = `./qrcodes/${family.familyName.replace(
      /\s+/g,
      "_"
    )}.png`;

    try {
      // Generate QR code and save it to a file
      await QRCode.toFile(qrCodePath, url);
      console.log(`QR code generated for ${family.familyName}: ${qrCodePath}`);
    } catch (err) {
      console.error(`Error generating QR code for ${family.familyName}:`, err);
    }
  }

  // Save families with tokens to a JSON file
  fs.writeFileSync("families.json", JSON.stringify(families, null, 2));
  console.log("Families data with tokens saved to families.json");
};

generateTokensAndQRCodes();
