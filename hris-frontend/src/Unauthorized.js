import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/employee-details"); // Adjust as needed
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-blue-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full border-t-8 border-red-500">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-3xl font-bold text-red-600 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You do not have permission to view this page.
        </p>
        <button
          onClick={handleBack}
          className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition duration-300 shadow-md"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
