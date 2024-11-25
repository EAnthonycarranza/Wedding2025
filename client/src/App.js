import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from "react-router-dom";
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
import axios from "axios"; // Import axios
import About from "./components/About";
import Home from "./components/Home";
import Services from "./components/Services";
import Gallery from "./components/Gallery";
import Welcome from "./components/Welcomepg";
import RSVPPage from "./components/RSVPPage";
import NavBar from "./components/Navbar";
import Footer from "./components/Footer";
import RSVP from "./components/RSVP";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([
    { firstName: "", lastName: "", rsvpStatus: "No Status / I don't know" },
  ]);
  const [submittedRSVP, setSubmittedRSVP] = useState(null);
  const [isLighthouse, setIsLighthouse] = useState(false);

  const location = useLocation(); // Get current location
  const navigate = useNavigate(); // Added navigate

  useEffect(() => {
    const authenticateWithToken = async (tokenFromUrl) => {
      try {
        const response = await axios.post("/authenticate", { token: tokenFromUrl });
        const jwtToken = response.data.token;
        localStorage.setItem("token", jwtToken);
        const familyName = response.data.familyName;
        setIsAuthenticated(true);
        setFamilyName(familyName);

        // Remove token from URL and navigate to /home
        navigate("/home", { replace: true });

        // Proceed with fetching RSVP data
        await fetchRSVPData(jwtToken);
      } catch (error) {
        console.error("Authentication failed:", error);
        setIsAuthenticated(false);
      }
    };

    const checkAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get("token");
      const tokenFromStorage = localStorage.getItem("token");

      if (tokenFromUrl) {
        // If token is present in URL, authenticate with it
        await authenticateWithToken(tokenFromUrl);
      } else if (tokenFromStorage) {
        // If token is in localStorage, proceed as before
        try {
          const response = await fetch("/check-auth", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${tokenFromStorage}`,
            },
          });

          // Handle non-JSON responses or unexpected errors
          if (!response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("text/html")) {
              throw new Error("Unexpected HTML response. Possible server routing issue.");
            } else {
              throw new Error(`Authentication check failed with status: ${response.status}`);
            }
          }

          const data = await response.json(); // Parse the JSON response
          setIsAuthenticated(true);
          setFamilyName(data.familyName);

          navigate("/home");

          // Fetch RSVP data
          await fetchRSVPData(tokenFromStorage);
        } catch (error) {
          console.error("Error during authentication or RSVP check:", error.message);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    const fetchRSVPData = async (token) => {
      try {
        const rsvpResponse = await fetch("/check-rsvp", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!rsvpResponse.ok) {
          const contentType = rsvpResponse.headers.get("content-type");
          if (contentType && contentType.includes("text/html")) {
            throw new Error("Unexpected HTML response from RSVP check.");
          } else {
            throw new Error(`RSVP check failed with status: ${rsvpResponse.status}`);
          }
        }

        const rsvpData = await rsvpResponse.json();
        if (!rsvpData.hasSubmittedRSVP) {
          setShowRSVPModal(true);
        }
      } catch (error) {
        console.error("Error fetching RSVP data:", error);
      }
    };

    checkAuth();
  }, []);

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

    const response = await fetch("/submit-rsvp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ familyMembers }),
    });

    const data = await response.json();
    if (response.ok) {
      setSubmittedRSVP(familyMembers);
      alert("RSVP submitted successfully!");
      closeRSVPModal();
    } else {
      alert(`Failed to submit RSVP: ${data.message}`);
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
                <Route
                  path="/gallery"
                  element={
                    <Gallery toggleLighthouseView={(status) => setIsLighthouse(status)} />
                  }
                />
                <Route path="/rsvp" element={<RSVPPage />} />
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
              Please fill out the RSVP list by January 1, 2025. You have the option to
              change your RSVP status anytime.
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
              sx={{ mt: 3, py: 1.5, backgroundColor: "rgb(156 0 68)" }}
              onClick={handleRSVPSubmit}
            >
              Submit RSVP
            </Button>
          </Box>
        </Modal>
      )}

      {/* Only render the RSVP component if the current route is NOT /rsvp */}
      {isAuthenticated && location.pathname !== "/rsvp" && <RSVP />}
      {isAuthenticated && <Footer />}
    </div>
  );
}

export default App;
