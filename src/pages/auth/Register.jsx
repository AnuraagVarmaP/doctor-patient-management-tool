import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Auth.css";

import { registerUser } from "../../services/authService";
import { upsertDoctorProfile } from "../../services/doctorService";
import { useAuth } from "../../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !name) return;

    setIsLoading(true);
    const { data: authData, error: authError } = await registerUser(
      email,
      password
    );

    if (authError) {
      alert(authError.message);
      setIsLoading(false);
      return;
    }

    // Immediately create the doctor profile using the new user ID
    if (authData?.user?.id) {
      const profileData = {
        id: authData.user.id,
        name: name,
        designation: designation,
        contact_number: contactNumber,
        updated_at: new Date(),
      };

      const { error: profileError } = await upsertDoctorProfile(profileData);
      if (profileError) {
        console.error("Error creating profile during registration:", profileError);
      } else {
        await refreshProfile();
      }
    }

    setIsLoading(false);
    navigate("/dashboard");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">🩺</div>
        <h1>Create your account</h1>
        <p>Please enter your details to continue.</p>

        <div className="auth-tabs">
          <button className="active-tab">Sign up</button>
          <Link to="/">
            <button>Log in</button>
          </Link>
        </div>

        <form onSubmit={handleRegister}>
          <label>Full Name *</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Designation</label>
          <input
            type="text"
            placeholder="Enter your designation (e.g. Cardiologist)"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
          />

          <label>Contact Number</label>
          <input
            type="text"
            placeholder="Enter your contact number"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
          />

          <label>Email *</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password *</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="signin-btn" disabled={isLoading}>
            {isLoading ? "Signing up..." : "Sign up"}
          </button>
        </form>

        <p className="bottom-text">
          Already have an account? <Link to="/">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;