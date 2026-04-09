// src/components/Footer.js
import React from "react";

const Footer = () => {
  return (
    <footer style={footerStyle}>
      <div className="container">
        <p>&copy; 2025 Wedding 2025. All Rights Reserved.</p>
        <p>
          Built by <a href="https://codingcarranza.com/" target="_blank" rel="noopener noreferrer" style={linkStyle}>Coding Carranza</a>
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

const linkStyle = {
  color: '#000',
  fontWeight: 'bold',
  textDecoration: 'none',
  borderBottom: '2px solid #000'
};

export default Footer;
