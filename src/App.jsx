import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import VisitorPage from "./pages/VisitorPage";
import GuardPage from "./pages/GuardPage";
import AdminPage from "./pages/AdminPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import UserDashboard from "./pages/UserDashboard";
import { getUserRole } from "./utils/jwt";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
  }

  return (
    <BrowserRouter>
      <Navbar onLogout={logout} />

      <div className="container">
        <Routes>

          <Route path="/login" element={<LoginPage onLogin={setToken} />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* <Route
            path="/visitor"
            element={
              <ProtectedRoute>
                <VisitorPage />
              </ProtectedRoute>
            }
          /> */}

          <Route
            path="/guard"
            element={
              <ProtectedRoute role="GUARD">
                <GuardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user"
            element={
              <ProtectedRoute role="USER">
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/"
            element={
              token
                ? getUserRole() === "ADMIN"
                  ? <Navigate to="/admin" />
                  : getUserRole() === "GUARD"
                    ? <Navigate to="/guard" />
                    : <Navigate to="/user" />
                : <Navigate to="/login" />
            }
          />

          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;