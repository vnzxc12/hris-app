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

    const role = loggedInUser.role?.toLowerCase();
    const employeeId = loggedInUser.employee_id;

    // 🔁 Role-based routing
    if (role === "admin") {
      navigate("/");
    } else if (role === "employee" && employeeId) {
      navigate(`/employee/${employeeId}`);
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

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  const role = user.role?.toLowerCase();

  return (
    <Routes>
      {/* 👤 Admin route */}
      {role === "admin" && <Route path="/" element={<Dashboard user={user} />} />}

      {/* 👤 Employee route */}
      {role === "employee" && user.employee_id && (
        <Route path={`/employee/${user.employee_id}`} element={<EmployeeDetails user={user} />} />
      )}

      {/* 🚫 Unauthorized route */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* 🧭 Catch-all */}
      <Route
        path="*"
        element={
          <Navigate to={role === "admin" ? "/" : `/employee/${user.employee_id || "unauthorized"}`} />
        }
      />
    </Routes>
  );
}

export default App;
