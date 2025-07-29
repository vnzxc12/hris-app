// src/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ user, allowedRoles, children }) => {
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role.toLowerCase())) {
    return <Navigate to="/unauthorized" />;
  }
  return children;
};

export default ProtectedRoute;
