import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate, useLocation, useParams } from "react-router-dom";
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
  const location = useLocation();

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

  // Protected route logic for employee details
  const ProtectedEmployeeDetails = () => {
    const { id } = useParams();
    const employeeIdFromUrl = parseInt(id, 10);

    if (user.role === "Admin" || user.employee_id === employeeIdFromUrl) {
      return <EmployeeDetails user={user} />;
    } else {
      return <Navigate to="/unauthorized" />;
    }
  };

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ) : (
        <>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/employee/:id" element={<ProtectedEmployeeDetails />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}
    </Routes>
  );
}

export default App;
