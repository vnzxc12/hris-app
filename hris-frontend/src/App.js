// App.js
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import EmployeeDetails from "./EmployeeDetails";
import Unauthorized from "./Unauthorized";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute"; // ✅ Add this
import { AuthContext } from "./AuthContext";
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!user && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [user]);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem("user", JSON.stringify(loggedInUser));

    const role = loggedInUser.role?.toLowerCase();
    const employeeId = loggedInUser.employee_id;

    if (role === "admin") {
      navigate("/");
    } else if (role === "employee" && employeeId) {
      navigate(`/employee/${employeeId}`);
    } else {
      navigate("/Unauthorized");
    }
  };

  const role = user?.role?.toLowerCase();
  const employeeId = user?.employee_id;

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Routes>
        {/* Public route */}
        {!user && (
          <>
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}

        {/* Protected Routes */}
        {user && (
          <>
            {/* Admin-only route */}
            <Route
              path="/"
              element={
                <ProtectedRoute user={user} allowedRoles={["admin"]}>
                  <Dashboard user={user} />
                </ProtectedRoute>
              }
            />

            {/* Admin or Employee route */}
            <Route
              path="/employee/:id"
              element={
                <ProtectedRoute user={user} allowedRoles={["admin", "employee"]}>
                  <EmployeeDetails />
                </ProtectedRoute>
              }
            />

            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Catch-all route */}
            <Route
              path="*"
              element={
                role === "admin"
                  ? <Navigate to="/" />
                  : employeeId
                  ? <Navigate to={`/employee/${employeeId}`} />
                  : <Navigate to="/unauthorized" />
              }
            />
          </>
        )}
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;
