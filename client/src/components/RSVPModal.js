import React, { useState } from "react";
import { Modal, Box, Typography, Button, TextField } from "@mui/material";

const RSVPModal = ({ onClose }) => {
  const [familyMembers, setFamilyMembers] = useState([{ firstName: "", lastName: "" }]);

  const handleFamilyMemberChange = (index, field, value) => {
    const updatedMembers = [...familyMembers];
    updatedMembers[index][field] = value;
    setFamilyMembers(updatedMembers);
  };

  const handleAddFamilyMember = () => {
    setFamilyMembers([...familyMembers, { firstName: "", lastName: "" }]);
  };

  const handleRSVPSubmit = () => {
    alert("RSVP submitted successfully!");
    onClose();
  };

  return (
    <Modal open={true} onClose={onClose} aria-labelledby="rsvp-modal-title">
      <Box
        sx={{
          width: "90%",
          maxWidth: "400px",
          bgcolor: "white",
          margin: "10% auto",
          p: 3,
          borderRadius: "10px",
          boxShadow: 24,
        }}
      >
        <Typography id="rsvp-modal-title" variant="h6" sx={{ textAlign: "center", mb: 2 }}>
          RSVP for Your Family
        </Typography>
        <Typography variant="body2" sx={{ textAlign: "center", mb: 3 }}>
          Please fill out the RSVP list by January 1, 2025. You have the option to update your RSVP anytime.
        </Typography>
        {familyMembers.map((member, index) => (
          <Box key={index} sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="First Name"
              value={member.firstName}
              onChange={(e) => handleFamilyMemberChange(index, "firstName", e.target.value)}
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Last Name"
              value={member.lastName}
              onChange={(e) => handleFamilyMemberChange(index, "lastName", e.target.value)}
            />
          </Box>
        ))}
        <Button
          onClick={handleAddFamilyMember}
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
        >
          Add Family Member
        </Button>
        <Button
          onClick={handleRSVPSubmit}
          variant="contained"
          fullWidth
          sx={{ bgcolor: "#B30047", color: "white" }}
        >
          Submit RSVP
        </Button>
      </Box>
    </Modal>
  );
};

export default RSVPModal;
