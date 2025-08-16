import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/about">About Us</Link>
          <a href="mailto:tracy@barkandbeyondtech.com">Contact</a>
        </div>
        
        <div className="footer-info">
          <p>&copy; {currentYear} Bark & Beyond Tech. All rights reserved.</p>
          <p>Smart, safe, and eco-friendly products for your beloved pets.</p>
        </div>
        
        <div className="footer-mission">
          <p style={{ fontStyle: 'italic', marginTop: '1rem', opacity: 0.8 }}>
            "Empowering dog owners with innovative, eco-friendly products that enhance the lives of pets and their families—always safe, always smart, always beyond expectations."
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;