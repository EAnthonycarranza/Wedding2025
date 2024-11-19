import React, { useState } from 'react';
import { Modal, Box, Typography, Button, TextField } from '@mui/material';

const RSVPModal = ({ onClose }) => {
  const [familyMembers, setFamilyMembers] = useState([{ firstName: '', lastName: '' }]);
  const [rsvpStatus, setRsvpStatus] = useState('Going');

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
      body: JSON.stringify({ familyMembers, rsvpStatus }),
    });

    alert('RSVP submitted successfully!');
    onClose(); // Close the modal after RSVP submission
  };

  return (
    <Modal open={true} onClose={onClose} aria-labelledby="rsvp-modal-title">
      <Box
        sx={{
          width: '90%',
          maxWidth: '500px',
          bgcolor: 'white',
          margin: '10% auto',
          p: 4,
          borderRadius: '10px',
          boxShadow: 24,
        }}
      >
        <Typography id="rsvp-modal-title" variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
          RSVP for Your Family
        </Typography>
        {familyMembers.map((member, index) => (
          <Box key={index} sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="First Name"
              value={member.firstName}
              onChange={(e) => handleFamilyMemberChange(index, 'firstName', e.target.value)}
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Last Name"
              value={member.lastName}
              onChange={(e) => handleFamilyMemberChange(index, 'lastName', e.target.value)}
            />
          </Box>
        ))}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Button
            variant="outlined"
            onClick={handleAddFamilyMember}
            sx={{
              width: '100%',
              mb: 1,
            }}
          >
            Add Family Member
          </Button>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={handleRSVPSubmit}
            sx={{
              width: '100%',
            }}
          >
            Submit RSVP
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default RSVPModal;