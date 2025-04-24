// File: App.js

import React, { useState, useEffect, useCallback } from "react";
import {
  Route,
  Routes,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { Box, Modal, Typography, Button, Alert } from "@mui/material";
import axios from "axios";
import About from "./components/About";
import Home from "./components/Home";
import Services from "./components/Services";
import Gallery from "./components/Gallery";
import Welcome from "./components/Welcomepg";
import RSVPPage from "./components/RSVPPage";
import NavBar from "./components/Navbar";
import Footer from "./components/Footer";
import Registry from "./components/Registry";
import Tourist from "./components/Tourist";
// import Itinerary from "./components/Itinerary";
import ButtomNavBar from "./components/ButtonNavBar";
import qrScanGif from "./img/qr-scan.gif";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [familyCount, setFamilyCount] = useState(0);
  const [hasRSVP, setHasRSVP] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Fetch RSVP data and set hasRSVP flag
  const fetchRSVPData = useCallback(
    async (token) => {
      try {
        const response = await fetch("/api/rsvp", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch RSVP data");
        }

        const data = await response.json();
        if (data.mongoData) {
          setHasRSVP(true);
        } else {
          setHasRSVP(false);
          // Redirect users without RSVP back to home
          navigate("/home", { replace: true });
        }
      } catch (error) {
        console.error("Error fetching RSVP data:", error);
      }
    },
    [navigate]
  );

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      if (location.pathname !== "/") {
        setTokenExpired(true);
      }
      return;
    }

    try {
      const response = await fetch("/check-auth", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Authentication check failed");
      }

      const data = await response.json();
      setIsAuthenticated(true);
      setFamilyName(data.familyName);
      setFamilyCount(data.familyCount);
      setTokenExpired(false);

      await fetchRSVPData(token);
    } catch (error) {
      console.error("Auth check error:", error);
      setIsAuthenticated(false);
      setTokenExpired(true);
    }
  }, [fetchRSVPData, location.pathname]);

  const authenticateWithToken = useCallback(
    async (tokenFromUrl) => {
      try {
        const response = await axios.post("/authenticate", {
          token: tokenFromUrl,
        });
        const jwtToken = response.data.token;

        localStorage.setItem("token", jwtToken);
        setIsAuthenticated(true);
        setFamilyName(response.data.familyName);
        setFamilyCount(response.data.familyCount);
        setTokenExpired(false);

        navigate("/home", { replace: true });
        await fetchRSVPData(jwtToken);
      } catch (error) {
        console.error("Token auth error:", error);
        setIsAuthenticated(false);
        setTokenExpired(true);
      }
    },
    [fetchRSVPData, navigate]
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");

    if (tokenFromUrl) {
      authenticateWithToken(tokenFromUrl);
    } else {
      checkAuth();
    }
  }, [authenticateWithToken, checkAuth]);

  useEffect(() => {
    checkAuth();
  }, [location, checkAuth]);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await axios.post(
          "/logout",
          { token },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (err) {
        console.error("Logout error:", err);
      }
    }
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    window.location.reload();
  };

  return (
    <div className="App">
      {isAuthenticated && (
        <>
          <NavBar
            familyName={familyName}
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
          />
          <ButtomNavBar />
        </>
      )}

      <TransitionGroup>
        <CSSTransition key={location.key} classNames="fade" timeout={300}>
          <Routes location={location}>
            {isAuthenticated ? (
              <>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/registry" element={<Registry />} />
                <Route path="/gallery" element={<Gallery />} />
                {hasRSVP && <Route path="/rsvp" element={<RSVPPage />} />}
                <Route path="/tour" element={<Tourist />} />
              </>
            ) : (
              <Route
                path="/"
                element={
                  <Welcome
                    setIsAuthenticated={setIsAuthenticated}
                    setFamilyName={setFamilyName}
                  />
                }
              />
            )}
          </Routes>
        </CSSTransition>
      </TransitionGroup>

      {tokenExpired && !isAuthenticated && location.pathname !== "/" && (
        <Modal
          open={true}
          onClose={() => {
            setTokenExpired(false);
            navigate("/");
          }}
          aria-labelledby="token-expired-modal-title"
        >
          <Box
            sx={{
              width: 400,
              p: 4,
              bgcolor: "white",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              borderRadius: "10px",
              boxShadow: 24,
            }}
          >
            <Typography
              id="token-expired-modal-title"
              variant="h6"
              sx={{ textAlign: "center", mb: 2 }}
            >
              Session Expired
            </Typography>

            <Alert severity="warning" sx={{ mb: 3, textAlign: "center" }}>
              Please enter your password or scan the QR code to login.
              <br />
              (Found with your invitation.)
            </Alert>

            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>  
              <img
                src={qrScanGif}
                alt="Scan QR code"
                style={{ width: "100%", maxWidth: "300px" }}
              />
            </Box>

            <Typography variant="body2" sx={{ textAlign: "center", mb: 2 }}>
              Having trouble logging in? <a href="sms:2109972900">Text (210) 997-2900</a> for help.
            </Typography>

            <Button
              variant="contained"
              fullWidth
              sx={{ backgroundColor: "#000000" }}
              onClick={() => {
                setTokenExpired(false);
                navigate("/");
              }}
            >
              Go to Login
            </Button>
          </Box>
        </Modal>
      )}

      {isAuthenticated && <Footer />}
    </div>
  );
}

export default App;
