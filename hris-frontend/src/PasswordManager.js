import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const PasswordManager = ({ user, userId, employeeId, BASE_URL, onClose }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isAdmin = user?.role === "Admin";
  const isSelf = user?.employee_id === Number(employeeId);

  if (!user || (!isAdmin && !isSelf)) return null;

  const handlePasswordUpdate = async () => {
    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match.");
    }

    try {
      await axios.patch(`${BASE_URL}/users/${userId}/password`, {
        password: newPassword,
      });
      toast.success("Password updated!");
      onClose();
    } catch (err) {
      toast.error("Failed to update password");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-center text-green-700 mb-2">
        {isAdmin ? "Reset User Password" : "Change Your Password"}
      </h2>

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
