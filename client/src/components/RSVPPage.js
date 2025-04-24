// File: RSVPPage.js

import React, { useState, useEffect } from "react";
import { Box, Paper, Typography, Grid, Divider } from "@mui/material";

const RSVPPage = () => {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [familyName, setFamilyName] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch RSVP data (read-only)
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
      } else {
        console.error("Failed to fetch RSVP data:", data.message);
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

  if (loading) {
    return <Typography align="center" sx={{ mt: 5 }}>Loading...</Typography>;
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
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{
          mb: { xs: 2, sm: 4 },
          color: "#000",
          fontWeight: "bold",
          fontFamily: "'Sacramento', cursive",
          fontSize: { xs: "1.8rem", sm: "2.5rem" },
        }}
      >
        RSVP: {familyName}
      </Typography>

      {familyMembers.length > 0 ? (
        familyMembers.map((member, index) => (
          <Paper
            key={index}
            elevation={1}
            sx={{ p: 2, mb: 2, backgroundColor: "#fafafa" }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  First Name
                </Typography>
                <Typography variant="body1">
                  {member.firstName || "—"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  Last Name
                </Typography>
                <Typography variant="body1">
                  {member.lastName || "—"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2" color="textSecondary">
                  RSVP Status
                </Typography>
                <Typography variant="body1">
                  {member.rsvpStatus || "No Status"}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        ))
      ) : (
        <Typography align="center" sx={{ fontSize: "1rem", color: "#555" }}>
          No RSVP data available for viewing.
        </Typography>
      )}
    </Box>
  );
};

export default RSVPPage;
