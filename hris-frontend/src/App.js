import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import EmployeeDetail from "./EmployeeDetails";
import Unauthorized from "./Unauthorized";
import Login from "./Login";

function App() {
  const [user, setUser] = useState(() => {
    // Restore from localStorage (optional)
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const navigate = useNavigate();

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem("user", JSON.stringify(loggedInUser));

    // Redirect based on role
    if (loggedInUser.role === "Admin") {
      navigate("/");
    } else if (loggedInUser.role === "Employee" && loggedInUser.employee_id) {
      navigate(`/employee/${loggedInUser.employee_id}`);
    } else {
      navigate("/unauthorized");
    }
  };

  return (
    <Routes>
      {!user ? (
        <Route path="*" element={<Login onLoginSuccess={handleLoginSuccess} />} />
      ) : (
        <>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/employee/:id" element={<EmployeeDetail user={user} />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </>
      )}
    </Routes>
  );
}

export default App;
