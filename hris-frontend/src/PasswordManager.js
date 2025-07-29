import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Use your actual deployed API base URL here
const API_URL = process.env.REACT_APP_API_URL || "https://your-api-url.railway.app";

const PasswordManager = ({ user, userId, onClose }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === "admin";
  const isEmployee = user?.role === "employee";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword || (isEmployee && !oldPassword)) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isAdmin
        ? `${API_URL}/api/users/${userId}/password-reset`
        : `${API_URL}/api/users/${userId}/change-password`;

      const payload = isAdmin
        ? { password: newPassword }
        : { currentPassword: oldPassword, newPassword };

      const res = await axios.put(endpoint, payload);

      if (res.data.success) {
        toast.success("Password updated successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => onClose?.(), 2000);
      } else {
        toast.error(res.data.error || "Failed to update password.");
      }
    } catch (err) {
      console.error("Password update error:", err);
      toast.error(
        err.response?.data?.error || "An error occurred while updating the password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto mt-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        {isAdmin ? "Admin: Reset Employee Password" : "Change Your Password"}
      </h2>

      <form onSubmit={handleSubmit}>
        {isEmployee && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
              required
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
            required
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default PasswordManager;
