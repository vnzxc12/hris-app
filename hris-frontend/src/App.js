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

    // 👇 Redirect based on role
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
      {!user ? (
        // 🔐 Not logged in
        <>
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ) : (
        // ✅ Logged in
        <>
          {user.role === "Admin" && (
            <Route path="/" element={<Dashboard user={user} />} />
          )}

          {/* ✅ Employee view (only for that specific employee ID) */}
          {user.role === "Employee" && user.employee_id && (
            <Route path={`/employee/${user.employee_id}`} element={<EmployeeDetails user={user} />} />
          )}

          {/* 👮 Fallback unauthorized route */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* 🚫 Catch-all redirect */}
          <Route path="*" element={<Navigate to={user.role === "Admin" ? "/" : `/employee/${user.employee_id}`} />} />
        </>
      )}
    </Routes>
  );
}

export default App;
