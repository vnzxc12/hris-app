import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import EmployeeDetails from "./EmployeeDetails";
import Unauthorized from "./Unauthorized";
import Login from "./Login";

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
  }, []);

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
      navigate("/unauthorized");
    }
  };

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  const role = user.role?.toLowerCase();
  const employeeId = user.employee_id;

  return (
    <Routes>
      {/* Admin dashboard */}
      {role === "admin" && (
        <Route path="/" element={<Dashboard user={user} />} />
      )}

      {/* Allow both Admin and Employee to access EmployeeDetails by ID */}
      {(role === "admin" || role === "employee") && (
        <Route path="/employee/:id" element={<EmployeeDetails user={user} />} />
      )}

      {/* Unauthorized fallback */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Catch-all redirect based on role */}
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
    </Routes>
  );
}

export default App;
