import React, { useState } from 'react';
import { Modal, Box, Typography, Button, TextField } from '@mui/material';
import './RSVPModal.css'; // Import the CSS file

const RSVPModal = ({ onClose }) => {
  const [familyMembers, setFamilyMembers] = useState([{ firstName: '', lastName: '' }]);

  const handleFamilyMemberChange = (index, field, value) => {
    const updatedMembers = [...familyMembers];
    updatedMembers[index][field] = value;
    setFamilyMembers(updatedMembers);
  };

  const handleAddFamilyMember = () => {
    setFamilyMembers([...familyMembers, { firstName: '', lastName: '' }]);
  };

  const handleRSVPSubmit = async () => {
    const token = localStorage.getItem('token');
    await fetch('/submit-rsvp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ familyMembers }),
    });

    alert('RSVP submitted successfully!');
    onClose();
  };

  return (
    <Modal open={true} onClose={onClose} aria-labelledby="rsvp-modal-title">
      <Box className="modal-container">
        <Typography id="rsvp-modal-title" className="modal-title">
          RSVP for Your Family
        </Typography>
        {familyMembers.map((member, index) => (
          <Box key={index} className="family-member-container">
            <TextField
              variant="outlined"
              size="small"
              placeholder="First Name"
              value={member.firstName}
              onChange={(e) => handleFamilyMemberChange(index, 'firstName', e.target.value)}
              className="text-field"
            />
            <TextField
              variant="outlined"
              size="small"
              placeholder="Last Name"
              value={member.lastName}
              onChange={(e) => handleFamilyMemberChange(index, 'lastName', e.target.value)}
              className="text-field"
            />
          </Box>
        ))}
        <Button
          variant="outlined"
          onClick={handleAddFamilyMember}
          className="add-button"
        >
          Add Family Member
        </Button>
        <Button
          variant="contained"
          onClick={handleRSVPSubmit}
          className="submit-button"
        >
          Submit RSVP
        </Button>
      </Box>
    </Modal>
  );
};

export default RSVPModal;