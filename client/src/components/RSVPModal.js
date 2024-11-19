import React, { useState } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

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
      <Box sx={{ width: 400, p: 4, bgcolor: 'white', margin: '100px auto', borderRadius: '10px' }}>
        <Typography id="rsvp-modal-title" variant="h6">RSVP for your family</Typography>
        {familyMembers.map((member, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder="First Name"
              value={member.firstName}
              onChange={(e) => handleFamilyMemberChange(index, 'firstName', e.target.value)}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={member.lastName}
              onChange={(e) => handleFamilyMemberChange(index, 'lastName', e.target.value)}
            />
          </div>
        ))}
        <Button onClick={handleAddFamilyMember}>Add Family Member</Button>
        <Button onClick={handleRSVPSubmit}>Submit RSVP</Button>
      </Box>
    </Modal>
  );
};

export default RSVPModal;
