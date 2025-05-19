import React from "react";
import { Link } from "react-router-dom";
import {
  HiHome,
  HiRocketLaunch,
  HiNewspaper,
  HiUser
} from "react-icons/hi2";
import "./Navbar.css";

export default function Navbar() {
  // Helper for haptic feedback
  const vibrate = () => {
    if (navigator.vibrate) navigator.vibrate(30);
  };

  return (
    <nav className="nav">
      <ul className="nav-list">
        <li className="nav-item">
          <Link
            to="/"
            className="nav-link"
            aria-label="Home"
            onClick={vibrate}
          >
            <HiHome size={26} />
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/Products"
            className="nav-link"
            aria-label="Products"
            onClick={vibrate}
          >
            <HiRocketLaunch size={24} />
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/news"
            className="nav-link"
            aria-label="Nyheter"
            onClick={vibrate}
          >
            <HiNewspaper size={26} />
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/login"
            className="nav-link"
            aria-label="login"
            onClick={vibrate}
          >
            <HiUser size={26} />
          </Link>
        </li>
      </ul>
    </nav>
  );
}
