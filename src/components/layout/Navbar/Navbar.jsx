import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import "./Navbar.css";

import { logoutUser } from "../../../services/authService";
import { useAuth } from "../../../context/AuthContext";
import userIcon from "../../../assets/icons/user.svg";
import menuIcon from "../../../assets/icons/menu.svg";

function Navbar() {
  const navigate = useNavigate();

  const { session, doctorProfile } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const handleLogout = async () => {
    const { error } = await logoutUser();

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/");
  };

  return (
    <nav className="navbar">

      <div className="navbar-container">

        <div className="navbar-logo">
          DoctorApp
        </div>

        <div
          className={`navbar-links ${
            menuOpen ? "active" : ""
          }`}
        >

          <Link to="/dashboard">
            Dashboard
          </Link>

          <Link to="/patients">
            Patients
          </Link>

          <div className="profile-section">

            <div
              className="profile-icon"
              onClick={() =>
                setProfileOpen(!profileOpen)
              }
            >
              <img src={userIcon} alt="profile" width="20" height="20" />
            </div>

            {profileOpen && (
              <div className="profile-dropdown">

                <p className="profile-email">
                  {doctorProfile?.name ? `Dr. ${doctorProfile.name}` : (session?.user?.email || "User")}
                </p>

                <button
                  onClick={handleLogout}
                  className="profile-logout"
                >
                  Logout
                </button>

              </div>
            )}

          </div>

        </div>

        <div
          className="mobile-toggle"
          onClick={() =>
            setMenuOpen(!menuOpen)
          }
        >
          <img src={menuIcon} alt="menu" width="24" height="24" />
        </div>

      </div>

    </nav>
  );
}

export default Navbar;