import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaCalendarCheck } from "react-icons/fa";

const API_URL = process.env.REACT_APP_API_URL; //

const LeaveBalanceTab = ({ employeeId: propEmployeeId, user }) => {
  const [balances, setBalances] = useState({
    vacation_leave: 0,
    sick_leave: 0,
    maternity_leave: 0,
    paternity_leave: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const employeeId = user?.role === "admin" ? propEmployeeId : user?.employee_id;

  useEffect(() => {
    if (!employeeId) {
      console.warn("Employee ID not provided!");
      setLoading(false);
      return;
    }
    fetchLeaveBalances(employeeId);
  }, [employeeId]);

  const fetchLeaveBalances = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/leave-balances/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBalances({
        vacation_leave: res.data?.vacation_leave ?? 0,
        sick_leave: res.data?.sick_leave ?? 0,
        maternity_leave: res.data?.maternity_leave ?? 0,
        paternity_leave: res.data?.paternity_leave ?? 0,
      });
    } catch (err) {
      console.error("Error fetching leave balances:", err);
      toast.error("Failed to load leave balances");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setBalances({ ...balances, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (user?.role !== "admin") return;

    try {
      setSaving(true);
      await axios.put(`${API_URL}/leave-balances/${employeeId}`, balances, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Leave balances updated successfully");
    } catch (err) {
      console.error("Error updating leave balances:", err);
      toast.error("Failed to update leave balances");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading leave balances...</p>;

return (
  <div className="bg-gray-50 p-6 rounded-lg">
    <div className="bg-white shadow rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-olivegreen">
        <FaCalendarCheck className="text-olivegreen" />
        Leave Balances
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.keys(balances).map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium capitalize">
              {key.replace("_", " ")}
            </label>
            {user?.role === "admin" ? (
              <input
                type="number"
                name={key}
                value={balances[key]}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            ) : (
              <p className="mt-1 p-2 border border-gray-200 rounded-md bg-gray-50">
                {balances[key]}
              </p>
            )}
          </div>
        ))}
      </div>

      {user?.role === "admin" && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 px-4 py-2 bg-[#6a8932] text-white rounded hover:bg-[#5a752a] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      )}
    </div>
  </div>
);
};

export default LeaveBalanceTab;
