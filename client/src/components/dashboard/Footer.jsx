import React from 'react';

const Footer = () => {
  return (
    <footer className="dashboard-footer">
      <div className="footer-container">
        <div className="footer-links">
          <a href="#help" className="footer-link">Help Center</a>
          <a href="#privacy" className="footer-link">Privacy Policy</a>
          <a href="#contact" className="footer-link">Contact Us</a>
        </div>
        <div className="footer-copyright">
          <p>&copy; 2024 Crispy Goggles. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;