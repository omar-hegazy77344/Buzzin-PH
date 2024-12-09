
"use client"
// Import necessary modules from 'react'
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
  // State to control the dropdown menu visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Function to toggle the dropdown menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle the state
  };

  return (
    <header>
      {/* Navbar container */}
      <div className="navbar">
        {/* Logo section */}
        <div className="logo">
          <Link href="../">
              {/* Use Next.js Image for better image optimization */}
              <Image src="../public/images/PHlogo.jpg" alt="Logo" width={150} height={75} />
            
          </Link>
        </div>

        {/* Links section */}
        <div className="links">
          <ul>
            <li>
              <Link href="../">
                Lost Report
              </Link>
            </li>
            <li>
              <Link href="../losttable/">
                Lost Table
              </Link>
            </li>
            <li>
              <Link href="../returnedtable/">
                Return Table
              </Link>
            </li>
          </ul>
        </div>

        {/* Toggle button for mobile menu */}
        <div id="toggle_btn" className="toggle_btn" onClick={toggleMenu}>
          {/* Font Awesome icons for open/close */}
          <i
            id="toggle_btn_Icon"
            className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'}`}
          ></i>
        </div>
      </div>

      {/* Dropdown menu for mobile view */}
      <div id="dropdown_menu" className={`dropdown_menu ${isMenuOpen ? 'open' : ''}`}>
        <ul>
          <li>
            <Link href="./">
              Lost Report
            </Link>
          </li>
          <li>
              <Link href="../losttable/">
                Lost Table
              </Link>
          </li>
          <li>
              <Link href="../returnedtable/">
                Return Table
              </Link>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
