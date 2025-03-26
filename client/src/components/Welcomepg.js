// src/components/Welcomepg.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoginPage, {
  Email,
  Submit,
  Title,
  Logo,
  Banner,
  Password,
  Welcome,
  ButtonAfter,
} from "@react-login-page/page3";
import qrScanGif from "../img/qr-scan.gif"; // Importing the QR scan GIF
import "./Welcomepg.css"; // <-- Import your CSS file here

const containerStyles = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  fontFamily: "'Sacramento', cursive",
  position: "relative",
};

const formStyles = {
  fontFamily: "'Sacramento', cursive",
  color: "#fff",
};

const largeTextStyles = {
  fontSize: "25px",
  textAlign: "center",
  marginBottom: "20px",
};

const titleStyles = {
  fontFamily: "'Sacramento', cursive",
  fontSize: "3rem",
  textAlign: "center",
  color: "#333",
};

const buttonStyles = {
  backgroundColor: "rgb(0 0 0)",
  color: "#fff",
  border: "none",
  padding: "10px 20px",
  fontSize: "16px",
  borderRadius: "20px",
  cursor: "pointer",
};

const customLoginStyles = {
  "--login-bg": "#f3f2f2",
  "--login-color": "#333",
  "--login-inner-bg": "#fff",
  "--login-banner-bg": "#fbfbfb",
  "--login-input": "#333",
  "--login-input-icon": "#dddddd",
  "--login-input-bg": "transparent",
  "--login-input-border": "rgba(0, 0, 0, 0.13)",
  "--login-input-placeholder": "#999999",
  borderRadius: "20px",
};

const helpTextStyles = {
  position: "fixed",
  bottom: "20px",
  left: "0",
  width: "100%",
  textAlign: "center",
  fontFamily: "Helvetica, sans-serif",
  fontSize: "14px",
  color: "black",
  padding: "0 10px",
};

const modalButtonStyles = {
  marginTop: "20px",
  backgroundColor: "rgb(0 0 0)",
  color: "#fff",
  border: "none",
  padding: "10px 20px",
  fontFamily: "Helvetica, sans-serif",
  fontSize: "16px",
  borderRadius: "20px",
  cursor: "pointer",
  display: "block",
  marginLeft: "auto",
  marginRight: "auto",
};

const modalOverlayStyles = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContentStyles = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "10px",
  textAlign: "center",
  maxWidth: "90%",
  maxHeight: "90%",
  overflowY: "auto",
};

const closeButtonStyles = {
  marginTop: "20px",
  backgroundColor: "rgb(0 0 0)",
  color: "#fff",
  border: "none",
  padding: "10px 20px",
  fontFamily: "Helvetica, sans-serif",
  fontSize: "16px",
  borderRadius: "20px",
  cursor: "pointer",
};

const Welcomepg = ({ setIsAuthenticated, setFamilyName }) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/authenticate", { password });
      const token = response.data.token;
      localStorage.setItem("token", token);

      const familyName = response.data.familyName;
      setIsAuthenticated(true);
      setFamilyName(familyName);

      navigate("/home");
    } catch (error) {
      setError(
        error.response
          ? error.response.data.message
          : "Authentication failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyles}>
      <form onSubmit={handleSubmit} style={formStyles}>
        <LoginPage style={{ ...customLoginStyles }}>
          <Logo visible={false} />
          <Title style={{ fontFamily: "'Sacramento', cursive", fontSize: "25px" }}>
            Welcome!
          </Title>
          <Welcome style={largeTextStyles}>Enter your given passcode</Welcome>
          <Email visible={false} />
          <Password
            label="Password"
            type="password"
            placeholder="Enter your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Submit style={buttonStyles}>
            {loading ? "Logging in..." : "Log In"}
          </Submit>
          <ButtonAfter visible={false} />
          <Banner
            style={{
              backgroundImage: `url("https://storage.googleapis.com/galleryimageswedding/2.jpg")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          {error && (
            <div style={{ color: "red", marginTop: "1rem" }}>{error}</div>
          )}
        </LoginPage>
        <button
          type="button"
          style={modalButtonStyles}
          onClick={() => setShowModal(true)}
        >
          View password instructions
        </button>
      </form>
      
      <div style={helpTextStyles}>
        Having trouble logging in? <a href="sms:2109972900">Text (210) 997-2900</a> for help.
      </div>

      {showModal && (
        <div style={modalOverlayStyles}>
          <div style={modalContentStyles}>
            {/* Use the CSS class from Welcomepg.css */}
            <img
              src={qrScanGif}
              alt="QR Code Scan Animation"
              className="responsive-qr-image"
            />
            <p
              style={{
                marginTop: "20px",
                fontFamily: "Helvetica, sans-serif",
                fontSize: "16px",
                color: "#333",
              }}
            >
              Please scan your QR code or use the password provided with your invitation.
            </p>
            <button
              type="button"
              style={closeButtonStyles}
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Welcomepg;
