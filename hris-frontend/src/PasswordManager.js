import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const PasswordManager = ({ user, userId, employeeId, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Admin can reset anyone. Employee can only change their own password.
  const isAdmin = user?.role === "Admin";
  const isSelf = !isAdmin && user?.id === employeeId; // FIXED self detection
  const targetId = isSelf ? userId : employeeId;

  const showCurrentPasswordField = isSelf; // simple boolean, no function now

  // Always call hooks before any returns
  useEffect(() => {
    // Reset fields whenever modal opens or target changes
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }, [employeeId, userId]);

  // After hooks, do early return for unauthorized users
  if (!user || (!isAdmin && !isSelf)) return null;

  const handlePasswordUpdate = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      if (isSelf) {
        // Employee changing own password
        await axios.patch(`${BASE_URL}/users/${targetId}/change-password`, {
          currentPassword,
          newPassword,
        });
      } else {
        // Admin resetting employee password
        await axios.patch(`${BASE_URL}/users/${targetId}/password`, {
          password: newPassword,
        });
      }

      toast.success("Password updated successfully!");
      onClose();
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Failed to update password.");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-center text-green-700 mb-2">
        {isSelf ? "Change Your Password" : "Reset User Password"}
      </h2>

      {showCurrentPasswordField && (
        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
      )}

      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="border rounded px-3 py-2 w-full"
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="border rounded px-3 py-2 w-full"
      />

      <div className="flex justify-end gap-2 pt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded border border-gray-400 text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handlePasswordUpdate}
          className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default PasswordManager;
