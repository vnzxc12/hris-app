// App.js
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import EmployeeDetails from "./EmployeeDetails";
import Unauthorized from "./Unauthorized";
import Login from "./Login";
import { AuthContext } from "./AuthContext"; // ✅ import context

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

  const role = user?.role?.toLowerCase();
  const employeeId = user?.employee_id;

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {!user ? (
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        <Routes>
          {/* Admin dashboard */}
          {role === "admin" && (
            <Route path="/" element={<Dashboard user={user} />} />
          )}

          {/* Allow both Admin and Employee to access EmployeeDetails */}
          {(role === "admin" || role === "employee") && (
            <Route path="/employee/:id" element={<EmployeeDetails />} />
          )}

          {/* Unauthorized fallback */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Catch-all */}
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
      )}
    </AuthContext.Provider>
  );
}

export default App;
