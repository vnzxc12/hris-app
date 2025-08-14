import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = process.env.REACT_APP_API_URL;

const LeaveBalanceTab = ({ employeeId: propEmployeeId, user }) => {
  const [employeeId, setEmployeeId] = useState(propEmployeeId || "");
  const [balances, setBalances] = useState({
    vacation_leave: 0,
    sick_leave: 0,
    maternity_leave: 0,
    paternity_leave: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let idToFetch;

    if (user?.role === "admin") {
      idToFetch = employeeId;
      if (!idToFetch) {
        console.warn("Admin: employeeId not provided!");
        setLoading(false);
        return;
      }
    } else {
      idToFetch = user?.employee_id;
    }

    console.log("Fetching leave balances for employeeId:", idToFetch);
    fetchLeaveBalances(idToFetch);
  }, [employeeId, user?.employee_id, user?.role]);

  const fetchLeaveBalances = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/leave-balances/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("Fetched leave balances:", res.data);

      const filteredData = {
        vacation_leave: res.data?.vacation_leave ?? 0,
        sick_leave: res.data?.sick_leave ?? 0,
        maternity_leave: res.data?.maternity_leave ?? 0,
        paternity_leave: res.data?.paternity_leave ?? 0,
      };
      setBalances(filteredData);
    } catch (err) {
      console.error("Error fetching leave balances:", err.response || err);
      toast.error("Failed to load leave balances");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setBalances({
      ...balances,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (user?.role !== "admin") {
      console.warn("Only admins can update leave balances");
      return;
    }

    if (!employeeId) {
      console.warn("Cannot save: employeeId not provided");
      return;
    }

    console.log("Saving leave balances for employeeId:", employeeId, balances);
    setSaving(true);
    try {
      const res = await axios.put(
        `${API_URL}/leave-balances/${employeeId}`,
        balances,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Save response:", res.data);
      toast.success("Leave balances updated successfully");
    } catch (err) {
      console.error("Error updating leave balances:", err.response || err);
      toast.error("Failed to update leave balances");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading leave balances...</p>;

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Leave Balances</h3>

      {user?.role === "admin" && (
        <div className="mb-4">
          <label className="block text-sm font-medium">Employee ID:</label>
          <input
            type="text"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
      )}

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
          disabled={saving || !employeeId}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      )}
    </div>
  );
};

export default LeaveBalanceTab;
