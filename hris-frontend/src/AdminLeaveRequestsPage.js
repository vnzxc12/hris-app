import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import { FaCheck, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { DateTime } from "luxon";

const API_URL = process.env.REACT_APP_API_URL;

// ✅ Same helper from Time Logs
const parsePHTime = (value) => {
  if (!value) return null;
  try {
    let dt = DateTime.fromISO(value, { zone: "utc" }).setZone("Asia/Manila");
    if (!dt.isValid) {
      dt = DateTime.fromFormat(value, "yyyy-MM-dd HH:mm:ss", { zone: "utc" }).setZone("Asia/Manila");
    }
    return dt.isValid ? dt : null;
  } catch {
    return null;
  }
};

const AdminLeaveRequestsPage = ({ user }) => {
  const employeeId = user?.role === "admin" ? null : user?.employee_id;

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/leaves`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("[fetchRequests] Data fetched:", res.data);
      setLeaveRequests(res.data);
    } catch (err) {
      console.error("[fetchRequests] Error:", err);
      toast.error("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [employeeId]);

  const handleApproveReject = async (id, status) => {
    try {
      await axios.put(
        `${API_URL}/leaves/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success(`Leave request ${status}`);
      setLeaveRequests((prev) =>
        prev.map((r) => (r.leave_id === id ? { ...r, status } : r))
      );
    } catch (err) {
      console.error("[handleApproveReject] Error:", err);
      toast.error("Failed to update leave request");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 flex-shrink-0">
        <Sidebar user={user} />
      </div>

      <main className="flex-1 flex justify-center items-start p-8">
        <div className="w-full max-w-5xl bg-white shadow-xl rounded-xl p-8">
          <h1 className="text-3xl font-bold mb-6 text-[#6a8932] text-center">
            Leave Requests
          </h1>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border">
              <thead className="bg-[#6a8932] text-white">
                <tr>
                  <th className="p-3">Employee Name</th>
                  <th className="p-3">Leave Type</th>
                  <th className="p-3">Start Date</th>
                  <th className="p-3">End Date</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.length > 0 ? (
                  leaveRequests.map((r) => {
                    const startDate = parsePHTime(r.start_date);
                    const endDate = parsePHTime(r.end_date);

                    return (
                      <tr key={r.leave_id} className="border-t hover:bg-gray-100">
                        <td className="p-3">{r.employee_name || "---"}</td>
                        <td className="p-3">{r.leave_type}</td>
                        <td className="p-3">{startDate?.toFormat("yyyy-MM-dd") || "---"}</td>
                        <td className="p-3">{endDate?.toFormat("yyyy-MM-dd") || "---"}</td>
                        <td className="p-3">{r.reason}</td>
                        <td className="p-3">{r.status}</td>
                        <td className="p-3 flex justify-center gap-2">
                          {r.status === "Pending" && (
                            <>
                              <button
                                onClick={() => handleApproveReject(r.leave_id, "Approved")}
                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 flex items-center gap-1"
                              >
                                <FaCheck /> Approve
                              </button>
                              <button
                                onClick={() => handleApproveReject(r.leave_id, "Rejected")}
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center gap-1"
                              >
                                <FaTimes /> Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-gray-500">
                      No leave requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLeaveRequestsPage;
