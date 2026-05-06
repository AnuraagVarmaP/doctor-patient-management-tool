import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Auth.css";

import { loginUser } from "../../services/authService";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const { error } = await loginUser(
      email,
      password
    );

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div className="auth-container">

      <div className="auth-card">

        <div className="auth-logo">
          🩺
        </div>

        <h1>
          Log in to your account
        </h1>

        <p>
          Welcome back! Please enter your details.
        </p>

        <div className="auth-tabs">

          <Link to="/register">
            <button>
              Sign up
            </button>
          </Link>

          <button className="active-tab">
            Log in
          </button>

        </div>

        <form onSubmit={handleLogin}>

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

          <div className="auth-options">

            <label>
              <input type="checkbox" />
              Remember for 30 days
            </label>

            <span>
              Forgot password
            </span>

          </div>

          <button
            type="submit"
            className="signin-btn"
          >
            Sign in
          </button>

        </form>

        <button className="google-btn">
          Sign in with Google
        </button>

        <p className="bottom-text">
          Don't have an account?{" "}

          <Link to="/register">
            Sign up
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Login;