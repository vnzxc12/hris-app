// src/HomePage.js
import React, { useState, useEffect, useContext } from "react";
import Sidebar from "./Sidebar";
import axios from "axios";
import { AuthContext } from "./AuthContext";

const API_URL = process.env.REACT_APP_API_URL;

const defaultProfile = "https://www.w3schools.com/howto/img_avatar.png";

const HomePage = () => {
  const { user } = useContext(AuthContext);
  const [employee, setEmployee] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await axios.get(`${API_URL}/employees/${user?.employee_id}`);
        setEmployee(res.data);
      } catch (err) {
        console.error("Error fetching employee:", err);
      }
    };

    if (user?.employee_id) {
      fetchEmployee();
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  const isWorkAnniversary = () => {
    if (!employee?.date_hired) return false;
    const hireDate = new Date(employee.date_hired);
    const today = new Date();
    return hireDate.getDate() === today.getDate() && hireDate.getMonth() === today.getMonth();
  };

  const profilePhoto = employee?.photo_url || defaultProfile;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <div className="md:w-64 bg-white border-r">
        <Sidebar user={user} />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10">
        <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
          <img
            src={profilePhoto}
            alt="Profile"
            className="w-48 h-48 rounded-full border-4 border-[#6a8932] object-cover"
          />

         <div className="text-center md:text-left">
  <h1 className="text-4xl font-bold text-gray-800 mb-2">
    Hello, {employee?.first_name || "User"}!
  </h1>
  <p className="text-lg text-gray-700">
    Welcome to the HRIS Dashboard. Here's your summary.
  </p>
  <p className="text-md text-gray-500 mt-3">
    {currentTime.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })}{" "}
    • {currentTime.toLocaleTimeString("en-US")}
  </p>

  {isWorkAnniversary() && (
    <p className="mt-4 text-green-600 font-semibold text-lg">
      🎉 Happy Work Anniversary! Hired on {formatDate(employee.date_hired)}
    </p>
  )}
</div>

        </div>

        {/* Summary Cards */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-100 text-green-900 p-6 rounded-lg shadow text-center">
            <h2 className="text-lg font-semibold">Employee Number</h2>
            <p className="text-2xl font-bold">{employee?.id || "N/A"}</p>
          </div>
          <div className="bg-blue-100 text-blue-900 p-6 rounded-lg shadow text-center">
            <h2 className="text-lg font-semibold">Department</h2>
            <p className="text-2xl font-bold">{employee?.department || "N/A"}</p>
          </div>
          <div className="bg-purple-100 text-purple-900 p-6 rounded-lg shadow text-center">
            <h2 className="text-lg font-semibold">Designation</h2>
            <p className="text-2xl font-bold">{employee?.designation || "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;