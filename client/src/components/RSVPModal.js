import React, { useState } from 'react';
import { Modal, Box, Typography, Button, TextField } from '@mui/material';

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
      <Box
        sx={{
          width: '90%',
          maxWidth: '500px',
          bgcolor: 'white',
          margin: '10% auto',
          p: 4,
          borderRadius: '10px',
          boxShadow: 24,
          '@media (max-width: 600px)': {
            maxWidth: '100%',
            p: 2,
          },
        }}
      >
        <Typography
          id="rsvp-modal-title"
          variant="h6"
          sx={{ textAlign: 'center', mb: 2, fontSize: '1.25rem' }}
        >
          RSVP for Your Family
        </Typography>
        <Typography
          variant="body2"
          sx={{ textAlign: 'center', mb: 3, fontSize: '0.9rem' }}
        >
          Please fill out the RSVP list by January 1, 2025. You can update your RSVP anytime.
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
              sx={{
                mb: 1,
                '@media (max-width: 600px)': {
                  fontSize: '0.875rem',
                },
              }}
            />
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Last Name"
              value={member.lastName}
              onChange={(e) => handleFamilyMemberChange(index, 'lastName', e.target.value)}
              sx={{
                '@media (max-width: 600px)': {
                  fontSize: '0.875rem',
                },
              }}
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
              '@media (max-width: 600px)': {
                fontSize: '0.875rem',
              },
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
              '@media (max-width: 600px)': {
                fontSize: '0.875rem',
              },
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
