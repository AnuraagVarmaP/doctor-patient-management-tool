import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Auth.css";

import { registerUser } from "../../services/authService";

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    const { error } = await registerUser(
      email,
      password
    );

    if (error) {
      alert(error.message);
      return;
    }

    alert("Registration Successful");

    navigate("/");
  };

  return (
    <div className="auth-container">

      <div className="auth-card">

        <div className="auth-logo">
          🩺
        </div>

        <h1>
          Create your account
        </h1>

        <p>
          Please enter your details to continue.
        </p>

        <div className="auth-tabs">

          <button className="active-tab">
            Sign up
          </button>

          <Link to="/">
            <button>
              Log in
            </button>
          </Link>

        </div>

        <form onSubmit={handleRegister}>

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            type="submit"
            className="signin-btn"
          >
            Sign up
          </button>

        </form>

        <p className="bottom-text">
          Already have an account?{" "}

          <Link to="/">
            Log in
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Register;