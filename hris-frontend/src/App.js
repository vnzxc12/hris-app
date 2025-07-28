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

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem("user", JSON.stringify(loggedInUser));

    if (loggedInUser.role === "Admin") {
      navigate("/");
    } else if (loggedInUser.role === "Employee" && loggedInUser.employee_id) {
      navigate(`/employee/${loggedInUser.employee_id}`);
    } else {
      navigate("/unauthorized");
    }
  };

  // Optional: Sync user state across reloads
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!user && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [user]);

  return (
    <Routes>
      {!user ? (
        // Not logged in: show login on all routes
        <>
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ) : (
        // Logged in: show routes based on role
        <>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/employee/:id" element={<EmployeeDetails user={user} />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}
    </Routes>
  );
}

export default App;
