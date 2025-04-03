
"use client"
// Import necessary modules from 'react'
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import {useAuth} from "../lib/authContext";
import { signOut } from "firebase/auth"
import { auth } from "../firebase"

const Header = () => {
  const { user } = useAuth();

  // State to control the dropdown menu visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Function to toggle the dropdown menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle the state
  };


  const handleSignOut = async () => {
    try {
      await signOut(auth)
      console.log("User signed out")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }



  return (
    <header>
      {/* Navbar container */}
      <div className="navbar">
        {/* Logo section */}
        <div className="logo">
          <Link href="../">
              {/* Use Next.js Image for better image optimization */}
              <Image src="/images/PHlogo.jpg" alt="Logo" width={150} height={75} />

          </Link>
        </div>

        {/* Links section */}
        <div className="links">
          <ul>
            <li>
              <Link href="../">
                New Lost Report
              </Link>
            </li>
            <li>
              <Link href="../losttable/">
                Lost Items List
              </Link>
            </li>
            <li>
              <Link href="../returnedtable/">
                Returned Itmes List
              </Link>
            </li>
          </ul>
        </div>
        {user&&(
          <button
        onClick={handleSignOut}
        className="clear-btn out"
      >
        Sign Out
      </button>
    )}
      
        {/* Toggle button for mobile menu */}
        <div id="toggle_btn" className="toggle_btn" onClick={toggleMenu}>



      {isMenuOpen ? (
          <CloseIcon id="toggle_btn_Icon" className="toggle_icon" />
        ) : (
          <MenuIcon id="toggle_btn_Icon" className="toggle_icon" />
        )}

        </div>
      </div>

      {/* Dropdown menu for mobile view */}
      <div id="dropdown_menu" className={`dropdown_menu ${isMenuOpen ? 'open' : ''}`}>
        <ul>
          <li>
            <Link href="../">
              New Lost Report
            </Link>
          </li>
          <li>
              <Link href="../losttable/">
                Lost items List
              </Link>
          </li>
          <li>
              <Link href="../returnedtable/">
                Returned Items List
              </Link>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
