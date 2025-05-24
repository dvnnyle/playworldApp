import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./adminNavBar.css";

const navLinks = [
  { to: "/admin", label: "Brukere" },
  { to: "/admincoupons", label: "Kuponger" },
  { to: "/newsform", label: "+ nytt innlegg" },
  // Add more admin pages here as needed
];

export default function AdminNavBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/adminlogin");
  };

  return (
    <nav className="admin-navbar">
      {navLinks.map(link => (
        <Link
          key={link.to}
          to={link.to}
          className={`admin-navbar-link${location.pathname === link.to ? " active" : ""}`}
        >
          {link.label}
        </Link>
      ))}
      <button
        onClick={handleLogout}
        className="admin-navbar-logout"
      >
        Logg ut
      </button>
    </nav>
  );
}