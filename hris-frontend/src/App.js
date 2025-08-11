// src/App.js
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import EmployeeDetails from "./EmployeeDetails";
import Unauthorized from "./Unauthorized";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import EditEmployeePage from "./EditEmployeePage";
import TimeLogsPage from './TimeLogsPage';
import TimeTrackerPage from './TimeTrackerPage';
import HomePage from './HomePage';
import FilesPage from './FilesPage';
import { AuthContext } from "./AuthContext";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import PayrollPage from './PayrollPage';

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
    navigate("/home");
  };

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes */}
        {user && (
          <>
           <Route
  path="/home"
  element={
    <ProtectedRoute user={user} allowedRoles={["superadmin", "admin", "employee"]}>
      <HomePage user={user} />
    </ProtectedRoute>
  }
/>

<Route
  path="/my-info"
  element={
    ["superadmin", "admin", "employee"].includes(user?.role)
      ? <Navigate to={`/employee/${user.employee_id}`} />
      : <Navigate to="/unauthorized" />
  }
/>

<Route
  path="/files"
  element={
    <ProtectedRoute user={user} allowedRoles={["superadmin", "admin", "employee"]}>
      <FilesPage user={user} />
    </ProtectedRoute>
  }
/>

<Route
  path="/employees"
  element={
    <ProtectedRoute user={user} allowedRoles={["superadmin", "admin", "employee"]}>
      <Dashboard user={user} />
    </ProtectedRoute>
  }
/>

<Route
  path="/edit/:id"
  element={
    <ProtectedRoute user={user} allowedRoles={["superadmin", "admin", "employee"]}>
      <EditEmployeePage />
    </ProtectedRoute>
  }
/>

<Route
  path="/employee/:id"
  element={
    <ProtectedRoute user={user} allowedRoles={["superadmin", "admin", "employee"]}>
      <EmployeeDetails />
    </ProtectedRoute>
  }
/>

<Route
  path="/time-logs"
  element={
    <ProtectedRoute user={user} allowedRoles={["superadmin", "admin"]}>
      <TimeLogsPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/payroll"
  element={
    <ProtectedRoute user={user} allowedRoles={["superadmin", "admin"]}>
      <PayrollPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/time-tracker"
  element={
    <ProtectedRoute user={user} allowedRoles={["superadmin", "employee"]}>
      <TimeTrackerPage />
    </ProtectedRoute>
  }
/>

            <Route path="*" element={<Navigate to="/home" />} />
          </>
        )}

        {!user && <Route path="*" element={<Navigate to="/login" />} />}
      </Routes>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        newestOnTop={true}
        limit={3}
      />
    </AuthContext.Provider>
  );
}

export default App;
