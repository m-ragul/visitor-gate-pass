import { Link, useNavigate } from "react-router-dom";
import { getUserRole } from "../utils/jwt";

function Navbar({ onLogout }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = getUserRole();

  function handleLogout() {
    onLogout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      {/* LEFT */}
      <div className="navbar-left">
        <Link
          to={
            !token
              ? "/login"
              : role === "ADMIN"
              ? "/admin"
              : role === "GUARD"
              ? "/guard"
              : "/user"
          }
          className="brand"
        >
          Visitor Gate Pass System
        </Link>
      </div>

      {/* RIGHT */}
      <div className="navbar-right">
        {/* {!token && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )} */}

        {token && role === "USER" && (
          <>
            {/* <Link to="/user/passes">My Gate Passes</Link> */}
            <span className="role-badge user">USER</span>
            <button onClick={handleLogout} className="logout">
              Logout
            </button>
          </>
        )}

        {token && role === "ADMIN" && (
          <>
            {/* <Link to="/admin">Approvals</Link> */}
            <span className="role-badge admin">ADMIN</span>
            <button onClick={handleLogout} className="logout">
              Logout
            </button>
          </>
        )}

        {token && role === "GUARD" && (
          <>
            {/* <Link to="/guard">Scan QR</Link> */}
            <span className="role-badge guard">GUARD</span>
            <button onClick={handleLogout} className="logout">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
