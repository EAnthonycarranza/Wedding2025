// File: App.js

import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import {
  Box,
  Modal,
  Typography,
  Button,
  TextField,
  MenuItem,
  FormControl,
  Select,
  IconButton,
  Grid,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
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
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([
    { firstName: "", lastName: "", rsvpStatus: "No Status / I don't know" },
  ]);
  const [hasRSVP, setHasRSVP] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const authenticateWithToken = async (tokenFromUrl) => {
      try {
        const response = await axios.post("/authenticate", {
          token: tokenFromUrl,
        });
        const jwtToken = response.data.token;
        localStorage.setItem("token", jwtToken);
        const familyName = response.data.familyName;
        setIsAuthenticated(true);
        setFamilyName(familyName);

        navigate("/home", { replace: true });

        await fetchRSVPData(jwtToken);
      } catch (error) {
        setIsAuthenticated(false);
        setTokenExpired(true);
      }
    };

    const checkAuth = async () => {
      const tokenFromStorage = localStorage.getItem("token");

      if (tokenFromStorage) {
        try {
          const response = await fetch("/check-auth", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${tokenFromStorage}`,
            },
          });

          if (!response.ok) {
            throw new Error("Authentication check failed");
          }

          const data = await response.json();
          setIsAuthenticated(true);
          setFamilyName(data.familyName);

          await fetchRSVPData(tokenFromStorage);
        } catch (error) {
          setIsAuthenticated(false);
          setTokenExpired(true);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    const fetchRSVPData = async (token) => {
      try {
        const rsvpResponse = await fetch("/rsvp", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!rsvpResponse.ok) {
          throw new Error("Failed to fetch RSVP data");
        }

        const rsvpData = await rsvpResponse.json();

        if (rsvpData.mongoData) {
          setHasRSVP(true);
          setShowRSVPModal(false);
        } else {
          setHasRSVP(false);
          setShowRSVPModal(true);
        }
      } catch (error) {
        console.error("Error fetching RSVP data:", error);
      }
    };

    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");

    if (tokenFromUrl) {
      authenticateWithToken(tokenFromUrl);
    } else {
      checkAuth();
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/");
  };

  const closeRSVPModal = () => {
    setShowRSVPModal(false);
  };

  const handleRSVPSubmit = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/submit-rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ familyMembers }),
      });

      if (response.ok) {
        setHasRSVP(true);
        setShowRSVPModal(false);
        alert("RSVP submitted successfully!");
      } else {
        const data = await response.json();
        alert(`Failed to submit RSVP: ${data.message}`);
      }
    } catch (error) {
      alert("An error occurred while submitting your RSVP.");
    }
  };

  const handleFamilyMemberChange = (index, field, value) => {
    const updatedMembers = [...familyMembers];
    updatedMembers[index][field] = value;
    setFamilyMembers(updatedMembers);
  };

  const handleAddFamilyMember = () => {
    setFamilyMembers([
      ...familyMembers,
      { firstName: "", lastName: "", rsvpStatus: "No Status / I don't know" },
    ]);
  };

  const handleRemoveFamilyMember = (index) => {
    const updatedMembers = familyMembers.filter((_, i) => i !== index);
    setFamilyMembers(updatedMembers);
  };

  return (
    <div className="App">
      {isAuthenticated && (
        <NavBar
          familyName={familyName}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
        />
      )}

      <TransitionGroup>
        <CSSTransition key={location.key} classNames="fade" timeout={300}>
          <Routes location={location}>
            {isAuthenticated ? (
              <>
                <Route path="/home" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/registry" element={<Registry />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/rsvp" element={<RSVPPage />} />
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

      {/* Show RSVP modal if no RSVP data */}
      {showRSVPModal && (
        <Modal
          open={true}
          onClose={closeRSVPModal}
          aria-labelledby="rsvp-modal-title"
        >
          <Box
            sx={{
              width: 500,
              p: 4,
              bgcolor: "white",
              margin: "auto",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              position: "absolute",
              borderRadius: "10px",
              boxShadow: 24,
            }}
          >
            <Typography
              id="rsvp-modal-title"
              variant="h5"
              sx={{
                textAlign: "center",
                mb: 2,
                fontFamily: "'Sacramento', cursive",
                fontSize: "1.8rem",
              }}
            >
              RSVP for {familyName}
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Please fill out the RSVP list by January 1, 2025. You can update
              your RSVP any time.
            </Typography>
            {familyMembers.map((member, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="First Name"
                    variant="outlined"
                    value={member.firstName}
                    onChange={(e) =>
                      handleFamilyMemberChange(index, "firstName", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    variant="outlined"
                    value={member.lastName}
                    onChange={(e) =>
                      handleFamilyMemberChange(index, "lastName", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={3}>
                  <FormControl fullWidth>
                    <Select
                      value={member.rsvpStatus}
                      onChange={(e) =>
                        handleFamilyMemberChange(index, "rsvpStatus", e.target.value)
                      }
                    >
                      <MenuItem value="Going">Going</MenuItem>
                      <MenuItem value="Not Going">Not Going</MenuItem>
                      <MenuItem value="No Status / I don't know">
                        No Status / I don't know
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={1}>
                  {index > 0 && (
                    <IconButton
                      aria-label="delete"
                      onClick={() => handleRemoveFamilyMember(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Grid>
              </Grid>
            ))}
            <Button sx={{ mb: 2 }} onClick={handleAddFamilyMember}>
              Add Family Member
            </Button>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3, py: 1.5, backgroundColor: "#000000" }}
              onClick={handleRSVPSubmit}
            >
              Submit RSVP
            </Button>
          </Box>
        </Modal>
      )}

      {/* Show token expired modal only if token is expired AND user is not on "/" */}
      {tokenExpired && location.pathname !== "/" && (
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
              margin: "auto",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              position: "absolute",
              borderRadius: "10px",
              boxShadow: 24,
            }}
          >
            <Typography
              id="token-expired-modal-title"
              variant="h6"
              sx={{ textAlign: "center", mb: 2 }}
            >
              Your session has expired.
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, textAlign: "center" }}>
              Please sign in again.
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
