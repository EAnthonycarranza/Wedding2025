import React, { useState } from "react";
import { Modal, Box, Typography, Button, TextField, FormControl, RadioGroup, FormControlLabel, Radio, Alert, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "15px",
  fontFamily: "Roboto, Helvetica, Arial, sans-serif"
};

const DemoRSVPModal = ({ open, onClose }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");

  const handleNext = () => {
    if (step === 1 && name.trim()) setStep(2);
    else if (step === 2) setStep(3);
  };

  const handleFinish = () => {
    localStorage.setItem("demoRSVPComplete", "true");
    onClose();
  };

  return (
    <Modal open={open} onClose={() => {}} aria-labelledby="demo-rsvp-modal">
      <Box sx={style}>
        <Typography variant="h5" component="h2" sx={{ mb: 2, color: "#F14E95", fontWeight: "bold" }}>
          Demo: RSVP Integration
        </Typography>
        
        <Alert severity="success" sx={{ mb: 2 }}>
          Real-time sync enabled: Your input will simulate a Google Sheets update!
        </Alert>

        {step === 1 && (
          <Box>
            <Typography sx={{ mb: 2 }}>In the live version, guests enter their names to RSVP. Try it below:</Typography>
            <TextField 
              fullWidth 
              label="Enter a name to test" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Button fullWidth variant="contained" onClick={handleNext} disabled={!name.trim()} sx={{ bgcolor: "#F14E95", "&:hover": { bgcolor: "#d13d7f" }, py: 1.5 }}>
              Next Step
            </Button>
          </Box>
        )}

        {step === 2 && (
          <Box>
            <Typography sx={{ mb: 2 }}>Will you be attending, <strong>{name}</strong>?</Typography>
            <FormControl component="fieldset">
              <RadioGroup defaultValue="yes">
                <FormControlLabel value="yes" control={<Radio sx={{ color: "#F14E95", '&.Mui-checked': { color: "#F14E95" } }} />} label="Yes, I'll be there!" />
                <FormControlLabel value="no" control={<Radio sx={{ color: "#F14E95", '&.Mui-checked': { color: "#F14E95" } }} />} label="Regretfully decline" />
              </RadioGroup>
            </FormControl>
            <Button fullWidth variant="contained" onClick={handleNext} sx={{ mt: 2, bgcolor: "#F14E95", "&:hover": { bgcolor: "#d13d7f" }, py: 1.5 }}>
              Simulate Sync
            </Button>
          </Box>
        )}

        {step === 3 && (
          <Box>
            <Typography sx={{ mb: 2 }}>
              <strong>Success!</strong> The host's Google Sheet has been updated automatically:
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2, bgcolor: "#f9f9f9" }}>
              <Box sx={{ p: 1, bgcolor: "#4CAF50", color: "white", fontSize: "12px", fontWeight: "bold" }}>
                VIEW: Wedding_RSVP_List (Google Sheets)
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#eee" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>Timestamp</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Guest Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontSize: "12px" }}>{new Date().toLocaleDateString()}</TableCell>
                    <TableCell sx={{ color: "#F14E95", fontWeight: "bold", fontSize: "12px" }}>{name}</TableCell>
                    <TableCell sx={{ color: "green", fontWeight: "bold", fontSize: "12px" }}>Attending</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontSize: "12px", color: "#ccc" }}>...</TableCell>
                    <TableCell sx={{ fontSize: "12px", color: "#ccc" }}>Previous Guest</TableCell>
                    <TableCell sx={{ fontSize: "12px", color: "#ccc" }}>Declined</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="body2" sx={{ mb: 2 }}>
              The admin dashboard also receives this data instantly for guest count tracking and table planning.
            </Typography>
            <Button fullWidth variant="contained" onClick={handleFinish} sx={{ bgcolor: "#F14E95", "&:hover": { bgcolor: "#d13d7f" }, py: 1.5 }}>
              Finish & Explore Website
            </Button>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default DemoRSVPModal;
