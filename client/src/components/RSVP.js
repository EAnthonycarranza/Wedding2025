import React from 'react';
import { Link } from 'react-router-dom';  // Import Link from react-router-dom
import bgImage from '../img/img_bg_4.jpg';  // Import the background image

const RSVP = () => {
  return (
    <div
      id="fh5co-started"
      className="fh5co-bg"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="overlay"></div>
      <div className="container">
        {/* Heading */}
        <div className="row animate-box">
          <div className="col-md-8 offset-md-2 text-center fh5co-heading">
            <h2>Are You Attending?</h2>
            <p>
              Please click the button below to let us know that you're attending.
              Thanks.
            </p>
          </div>
        </div>
        {/* RSVP Button */}
        <div className="row animate-box">
          <div className="col-md-4 offset-md-4">
            <Link
              to="/rsvp"
              className="btn btn-default btn-block"
              style={{
                backgroundColor: '#9c0044', // Initial button background color
                color: 'white', // Text color
                padding: '10px 20px',
                textDecoration: 'none',
                textAlign: 'center',
                borderRadius: '8px',
                transition: 'background-color 0.3s ease, transform 0.3s ease', // Smooth transition for hover
                fontWeight: 'bold',
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#b00055'; // Hover background color
                e.target.style.transform = 'scale(1.05)'; // Slight scaling effect
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#9c0044'; // Revert to original background color
                e.target.style.transform = 'scale(1)'; // Revert to original size
              }}
            >
              RSVP
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RSVP;