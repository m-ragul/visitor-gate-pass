import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();

    try {
      await api.post("/api/auth/register", {
        username,
        password,
        role: window.tempRole || "USER",
        adminSecret: window.tempSecret || "",
      });

      alert("Registration successful. Please login.");
      navigate("/login");

    } catch (err) {
      alert(err.response?.data || "Registration failed");
    }
  }

  return (
    <div className="auth-container">
      <div className="card">
        <h2>Create Account</h2>

        <form onSubmit={handleRegister}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* 🔑 Role Selection */}
          <select
            defaultValue="USER"
            onChange={(e) => {
              const role = e.target.value;
              if (role !== "USER") {
                const secret = prompt("Enter Admin Secret for " + role + ":");
                if (secret) {
                  // In a real app, use state. This is a quick hack for the demo.
                  window.tempRole = role;
                  window.tempSecret = secret;
                } else {
                  e.target.value = "USER";
                  window.tempRole = "USER";
                  window.tempSecret = "";
                }
              } else {
                window.tempRole = "USER";
              }
            }}
            style={{ marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
          >
            <option value="USER">User (Visitor)</option>
            <option value="ADMIN">Admin</option>
            <option value="GUARD">Security Guard</option>
          </select>

          <button className="primary" type="submit">
            Register
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;