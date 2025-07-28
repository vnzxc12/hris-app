import React from "react";
import { Routes, Route } from 'react-router-dom';
import Dashboard from "./Dashboard";
import EmployeeDetail from "./EmployeeDetails";
import Unauthorized from "./Unauthorized"; 
import Login from "./Login";


function App() {
  return (
    
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/employee/:id" element={<EmployeeDetails />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
   
  );
}

export default App;
