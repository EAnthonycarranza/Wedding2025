// src/components/Footer.js
import React from "react";

const Footer = () => {
  return (
    <footer style={footerStyle}>
      <div className="container">
        <p>&copy; 2025 Carranza Coding. All Rights Reserved.</p>
        <p>
          Built with love by Anthony & Christina.
        </p>
      </div>
    </footer>
  );
};

const footerStyle = {
  backgroundColor: '#f8f8f8',
  padding: '20px 0',
  textAlign: 'center',
  borderTop: '1px solid #e7e7e7',
  marginTop: '50px'
};

export default Footer;
