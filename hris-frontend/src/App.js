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

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!user && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [user]);

  return (
    <Routes>
      {/* 🔐 Not logged in: show login */}
      {!user ? (
        <>
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ) : (
        <>
          {/* 🧑 Admin view */}
          <Route path="/" element={<Dashboard user={user} />} />

          {/* 🔐 Role-protected employee view (actual check is inside EmployeeDetails) */}
          <Route path="/employee/:id" element={<EmployeeDetails user={user} />} />

          {/* 🚫 Unauthorized */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}
    </Routes>
  );
}

export default App;
