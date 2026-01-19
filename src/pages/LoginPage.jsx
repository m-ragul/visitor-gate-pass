import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { getUserRole } from "../utils/jwt";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const res = await api.post("/api/auth/login", {
        username,
        password,
      });

      const token = res.data;
      localStorage.setItem("token", token);
      console.log(token);
      onLogin(token);

      const role = getUserRole();
      if (role === "ADMIN") navigate("/admin");
      else if (role === "GUARD") navigate("/guard");
      else {
        navigate("/user");
        console.log(token);
      }

    } catch (error) {
      alert("Invalid username or password");
      console.error("Login failed:", error);
    }
  }

  return (
    <div className="auth-container">
      <div className="card">
        <h2>Login</h2>

        <form onSubmit={handleLogin}>
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

          <button className="primary" type="submit">
            Login
          </button>
        </form>

        <div className="auth-footer">
          New here? <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;