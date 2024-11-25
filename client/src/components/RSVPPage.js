import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  FormControl,
  Select,
  Grid,
  Typography,
  IconButton,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SaveIcon from "@mui/icons-material/Save";
import { useNavigate } from "react-router-dom";

const RSVPPage = () => {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [familyName, setFamilyName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Move fetchRSVPData outside of useEffect
  const fetchRSVPData = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/rsvp", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok && data.mongoData) {
        setFamilyName(data.mongoData.familyName || "Unknown Family");
        setFamilyMembers(data.mongoData.familyMembers || []);
      }
    } catch (error) {
      console.error("Error fetching RSVP data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRSVPData();
  }, []);

  const handleRSVPSubmit = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch("/rsvp", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ familyMembers }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("RSVP updated successfully!");
      // Re-fetch the updated data
      fetchRSVPData();
    } else {
      alert(`Failed to update RSVP: ${data.message}`);
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

  const handleRemoveFamilyMember = async (index) => {
    const token = localStorage.getItem("token");
    const memberToRemove = familyMembers[index];

    const updatedMembers = familyMembers.filter((_, i) => i !== index);
    setFamilyMembers(updatedMembers);

    // Ensure consistent API endpoint
    const response = await fetch("/rsvp", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ familyMember: memberToRemove }),
    });

    const data = await response.json();
    if (!response.ok) {
      alert(`Failed to delete family member: ${data.message}`);
    } else {
      // Optionally re-fetch the data
      fetchRSVPData();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 4 },
        maxWidth: "95%",
        margin: "auto",
        mt: 5,
      }}
    >
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            mb: { xs: 2, sm: 4 },
            textAlign: "center",
            color: "#9C0044",
            fontWeight: "bold",
            fontFamily: "'Sacramento', cursive",
            fontSize: { xs: "1.8rem", sm: "2.5rem" },
          }}
        >
          RSVP {familyName}
        </Typography>

        <Grid container spacing={2}>
          {familyMembers.length > 0 ? (
            familyMembers.map((member, index) => (
              <Grid
                container
                item
                spacing={2}
                key={index}
                alignItems="center"
                sx={{
                  mb: 2,
                }}
              >
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="First Name"
                    variant="outlined"
                    value={member.firstName || ""}
                    onChange={(e) =>
                      handleFamilyMemberChange(index, "firstName", e.target.value)
                    }
                    sx={{
                      borderRadius: "10px",
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    variant="outlined"
                    value={member.lastName || ""}
                    onChange={(e) =>
                      handleFamilyMemberChange(index, "lastName", e.target.value)
                    }
                    sx={{ borderRadius: "10px" }}
                  />
                </Grid>
                <Grid item xs={10} sm={3}>
                  <FormControl fullWidth>
                    <Select
                      value={member.rsvpStatus || "No Status / I don't know"}
                      onChange={(e) =>
                        handleFamilyMemberChange(index, "rsvpStatus", e.target.value)
                      }
                      variant="outlined"
                    >
                      <MenuItem value="Going">Going</MenuItem>
                      <MenuItem value="Not Going">Not Going</MenuItem>
                      <MenuItem value="No Status / I don't know">
                        No Status / I don't know
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={2} sm={1}>
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveFamilyMember(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))
          ) : (
            <Typography>
              No RSVP data available. Please submit your RSVP.
            </Typography>
          )}
        </Grid>

        <Box
          sx={{ display: "flex", justifyContent: "center", mt: 3, flexWrap: "wrap" }}
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={handleAddFamilyMember}
            startIcon={<AddCircleIcon />}
            sx={{
              borderRadius: "20px",
              mr: { xs: 0, sm: 2 },
              mb: { xs: 2, sm: 0 },
            }}
          >
            Add Family Member
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handleRSVPSubmit}
            startIcon={<SaveIcon />}
            sx={{
              backgroundColor: "#9C0044",
              borderRadius: "20px",
            }}
          >
            Submit RSVP
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default RSVPPage;
