import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        <div className="footer-section footer-about">
          <h3 className="footer-logo">AURA</h3>
          <p className="footer-description">
            Next-generation risk modeling for satellites and power grids against solar events.
          </p>
        </div>

        <div className="footer-section footer-links">
          <h4 className="footer-heading">Navigate</h4>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#dashboard">Dashboard</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        <div className="footer-section footer-legal">
          <h4 className="footer-heading">Legal</h4>
          <ul>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms of Service</a></li>
          </ul>
        </div>

        <div className="footer-section footer-social">
          <h4 className="footer-heading">Connect</h4>
          <div className="social-icons">
            <a href="#twitter" aria-label="Twitter">X</a>
            <a href="#linkedin" aria-label="LinkedIn">In</a>
            <a href="#github" aria-label="GitHub">Gh</a>
          </div>
        </div>

      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Aura . All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;