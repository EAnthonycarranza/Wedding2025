import React, { useState } from 'react';
import { Modal, Box, Typography, Button, TextField } from '@mui/material';
import './RSVPModal.css';

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
    alert('RSVP submitted successfully!');
    onClose();
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      aria-labelledby="rsvp-modal-title"
      aria-describedby="rsvp-modal-description"
    >
      <Box className="modal-container">
        <Typography id="rsvp-modal-title" className="modal-title">
          RSVP for Your Family
        </Typography>
        <Typography id="rsvp-modal-description" variant="body2" sx={{ textAlign: 'center', mb: 3 }}>
          Please fill out the RSVP list by January 1, 2025. You can update your RSVP anytime.
        </Typography>
        {familyMembers.map((member, index) => (
          <Box key={index} className="family-member-container">
            <TextField
              className="text-field"
              variant="outlined"
              size="small"
              placeholder="First Name"
              value={member.firstName}
              onChange={(e) => handleFamilyMemberChange(index, 'firstName', e.target.value)}
            />
            <TextField
              className="text-field"
              variant="outlined"
              size="small"
              placeholder="Last Name"
              value={member.lastName}
              onChange={(e) => handleFamilyMemberChange(index, 'lastName', e.target.value)}
            />
          </Box>
        ))}
        <Button onClick={handleAddFamilyMember} className="add-button" variant="outlined">
          Add Family Member
        </Button>
        <Button onClick={handleRSVPSubmit} className="submit-button" variant="contained">
          Submit RSVP
        </Button>
      </Box>
    </Modal>
  );
};

export default RSVPModal;
