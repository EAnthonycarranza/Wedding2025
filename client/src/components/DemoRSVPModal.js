import React, { useState } from "react";
import { Modal, Box, Typography, Button, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Alert } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "15px",
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
        <Typography variant="h5" component="h2" sx={{ fontFamily: "Sacramento", mb: 2, color: "#F14E95", fontWeight: "bold" }}>
          Demo: RSVP Experience
        </Typography>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          This is a preview of the RSVP feature. In the real version, this syncs directly with our database and Google Sheets!
        </Alert>

        {step === 1 && (
          <Box>
            <Typography sx={{ mb: 2 }}>To show you how it works, what's your name?</Typography>
            <TextField 
              fullWidth 
              label="Guest Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Button fullWidth variant="contained" onClick={handleNext} disabled={!name.trim()} sx={{ bgcolor: "#F14E95", "&:hover": { bgcolor: "#d13d7f" } }}>
              Next
            </Button>
          </Box>
        )}

        {step === 2 && (
          <Box>
            <Typography sx={{ mb: 2 }}>Will you be attending, {name}?</Typography>
            <FormControl component="fieldset">
              <RadioGroup defaultValue="yes">
                <FormControlLabel value="yes" control={<Radio sx={{ color: "#F14E95", '&.Mui-checked': { color: "#F14E95" } }} />} label="Yes, I'll be there!" />
                <FormControlLabel value="no" control={<Radio sx={{ color: "#F14E95", '&.Mui-checked': { color: "#F14E95" } }} />} label="Regretfully decline" />
              </RadioGroup>
            </FormControl>
            <Button fullWidth variant="contained" onClick={handleNext} sx={{ mt: 2, bgcolor: "#F14E95", "&:hover": { bgcolor: "#d13d7f" } }}>
              Continue Demo
            </Button>
          </Box>
        )}

        {step === 3 && (
          <Box>
            <Typography sx={{ mb: 2 }}>
              Great! In the live website, the host (Anthony & Christina) would now see your response in their admin panel.
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: "italic", mb: 2 }}>
              Note: This demo won't save your data to the real list.
            </Typography>
            <Button fullWidth variant="contained" onClick={handleFinish} sx={{ bgcolor: "#F14E95", "&:hover": { bgcolor: "#d13d7f" } }}>
              Finish Demo
            </Button>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default DemoRSVPModal;
