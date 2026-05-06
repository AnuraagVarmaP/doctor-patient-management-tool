import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Auth.css";

import { registerUser } from "../../services/authService";
import { upsertDoctorProfile } from "../../services/doctorService";

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !name) return;

    // 1. Register the user account
    const { data: authData, error: authError } = await registerUser(email, password);

    if (authError) {
      alert(authError.message);
      setIsLoading(false);
      return;
    }

    // 2. Create the doctor profile immediately
    if (authData?.user?.id) {
      const profileData = {
        id: authData.user.id,
        name: name.trim(),
        designation: designation.trim(),
        contact_number: contactNumber.trim(),
        updated_at: new Date(),
      };

      try {
        const { error: profileError } = await upsertDoctorProfile(profileData);
        if (profileError) {
          throw profileError;
        }
        
        // 3. Success! Now move to dashboard
        setIsLoading(false);
        navigate("/dashboard");
      } catch (err) {
        console.error("Profile creation failed:", err);
        alert("Account created, but profile setup failed. Please try again or contact support.");
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
      navigate("/dashboard");
    }
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