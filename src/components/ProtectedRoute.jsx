import { Navigate } from "react-router-dom";
import { getUserRole } from "../utils/jwt";

function ProtectedRoute({ role, children }) {
  const token = localStorage.getItem("token");
  const userRole = getUserRole();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role && role !== userRole) {
    return <Navigate to={`/${userRole.toLowerCase()}`} replace />;
  }

  return children;
}

export default ProtectedRoute;