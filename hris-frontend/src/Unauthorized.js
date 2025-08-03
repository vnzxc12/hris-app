import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    // Navigate to employee dashboard or profile
    navigate("/employee-details"); // adjust path if needed
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 text-center px-4">
      <div className="bg-white shadow-xl rounded-xl p-10 max-w-md w-full">
        <h1 className="text-red-600 text-6xl font-black mb-4">UNAUTHORIZED</h1>
        <p className="text-lg text-gray-600 mb-6">🚫 You do not have permission to view this page.</p>
        <button
          onClick={handleBack}
          className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
