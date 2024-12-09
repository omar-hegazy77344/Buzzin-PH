"use client"
import { useEffect, useState } from 'react';

const Footer = () => {
  // State to store the current year
  const [currentYear, setCurrentYear] = useState('');

  // useEffect to set the current year on component mount
  useEffect(() => {
    setCurrentYear(new Date().getFullYear()); // Get the current year
  }, []); // Empty dependency array ensures this only runs once

  return (
    <footer>
      {/* Footer text with the dynamically generated year */}
      <p>
        &copy; <span>{currentYear}</span> Buzzin FZCO. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
