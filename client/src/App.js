// File: App.js

import React, { useState, useEffect, useCallback } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
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
  Alert
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
//import Itinerary from "./components/Itinerary";
import "./App.css";
import ButtomNavBar from "./components/ButtonNavBar";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [familyCount, setFamilyCount] = useState(0);
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([
    { firstName: "", lastName: "", rsvpStatus: "No Status / I don't know" },
  ]);
  const [hasRSVP, setHasRSVP] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const isFormValid = familyMembers.every(
    (member) => member.firstName.trim() !== "" && member.lastName.trim() !== ""
  );

  const fetchRSVPData = useCallback(async (token) => {
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
  }, []);

  const checkAuth = useCallback(async () => {
    const tokenFromStorage = localStorage.getItem("token");
    if (!tokenFromStorage) {
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
          Authorization: `Bearer ${tokenFromStorage}`,
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

      await fetchRSVPData(tokenFromStorage);
    } catch (error) {
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
  }, [location]);

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

  const closeRSVPModal = () => {
    setShowRSVPModal(false);
  };

  const handleRSVPSubmit = async () => {
    setSubmitAttempted(true);
    if (!isFormValid) {
      setModalMessage("Please fill in all required fields.");
      setModalOpen(true);
      return;
    }

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
        setModalMessage("RSVP submitted successfully!");
        setModalOpen(true);
        setSubmitAttempted(false);
      } else {
        const data = await response.json();
        setModalMessage(`Failed to submit RSVP: ${data.message}`);
        setModalOpen(true);
      }
    } catch (error) {
      setModalMessage("An error occurred while submitting your RSVP.");
      setModalOpen(true);
    }
  };

  const handleFamilyMemberChange = (index, field, value) => {
    const updatedMembers = [...familyMembers];
    updatedMembers[index][field] = value;
    setFamilyMembers(updatedMembers);
  };

  const handleAddFamilyMember = () => {
    if (familyMembers.length < familyCount) {
      setFamilyMembers([
        ...familyMembers,
        { firstName: "", lastName: "", rsvpStatus: "No Status / I don't know" },
      ]);
    } else {
      setModalMessage(`You can only RSVP for ${familyCount} people.`);
      setModalOpen(true);
    }
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
              <ButtomNavBar/>

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

      {showRSVPModal && (
        <Modal
          open={true}
          onClose={closeRSVPModal}
          aria-labelledby="rsvp-modal-title"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: { xs: "90%", sm: 500 },
              p: 4,
              bgcolor: "background.paper",
              borderRadius: "10px",
              boxShadow: 24,
              maxHeight: "90vh",
              overflowY: "auto",
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
            <Alert severity="warning" sx={{ mb: 3 }}>
              RSVP by April 15, 2025. Enter each guest's first and last name separately. Do not combine names.
            </Alert>
            <Alert severity="success" sx={{ mb: 3 }}>
              You can update your RSVP any time.
            </Alert>
            {familyMembers.map((member, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="First Name"
                    variant="outlined"
                    value={member.firstName}
                    onChange={(e) =>
                      handleFamilyMemberChange(index, "firstName", e.target.value)
                    }
                    error={submitAttempted && member.firstName.trim() === ""}
                    helperText={
                      submitAttempted && member.firstName.trim() === ""
                        ? "First name is required"
                        : ""
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    variant="outlined"
                    value={member.lastName}
                    onChange={(e) =>
                      handleFamilyMemberChange(index, "lastName", e.target.value)
                    }
                    error={submitAttempted && member.lastName.trim() === ""}
                    helperText={
                      submitAttempted && member.lastName.trim() === ""
                        ? "Last name is required"
                        : ""
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
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
                <Grid
                  item
                  xs={12}
                  sm={1}
                  sx={{ display: "flex", alignItems: "center" }}
                >
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
            <Button
              variant="outlined"
              sx={{
                mb: 2,
                color: "#000000",
                borderColor: "#000000",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
              onClick={handleAddFamilyMember}
              disabled={familyMembers.length >= familyCount}
            >
              Add Family Member / Guest
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

      {modalOpen && (
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          aria-labelledby="alert-modal-title"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: { xs: "90%", sm: 400 },
              p: 4,
              bgcolor: "background.paper",
              borderRadius: "10px",
              boxShadow: 24,
            }}
          >
            <Typography
              id="alert-modal-title"
              variant="h6"
              sx={{ textAlign: "center", mb: 2 }}
            >
              Notification
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, textAlign: "center" }}>
              {modalMessage}
            </Typography>
            <Button
              variant="contained"
              fullWidth
              sx={{ backgroundColor: "#000000" }}
              onClick={() => setModalOpen(false)}
            >
              Close
            </Button>
          </Box>
        </Modal>
      )}

      {isAuthenticated && <Footer />}
    </div>
  );
}

export default App;
