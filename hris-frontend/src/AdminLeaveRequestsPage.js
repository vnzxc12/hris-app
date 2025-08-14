import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import { FaCheck, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";

const API_URL = process.env.REACT_APP_API_URL;

const AdminLeaveRequestsPage = ({ user }) => {
  const employeeId =
    user?.role === "admin" ? null : user?.employee_id; // Admin sees all

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
      {/* Fixed-width sidebar to prevent squish */}
      <div className="w-64 flex-shrink-0">
        <Sidebar user={user} />
      </div>

      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-6">Leave Requests</h1>

        <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2 text-left">Employee Name</th>
                <th className="border px-4 py-2 text-left">Leave Type</th>
                <th className="border px-4 py-2 text-left">Start Date</th>
                <th className="border px-4 py-2 text-left">End Date</th>
                <th className="border px-4 py-2 text-left">Reason</th>
                <th className="border px-4 py-2 text-left">Status</th>
                <th className="border px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.length > 0 ? (
                leaveRequests.map((r) => (
                  <tr key={r.leave_id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{r.employee_name}</td>
                    <td className="border px-4 py-2">{r.leave_type}</td>
                    <td className="border px-4 py-2">
  {r.start_date ? new Date(r.start_date).toLocaleDateString("en-US") : ""}
</td>
<td className="border px-4 py-2">
  {r.end_date ? new Date(r.end_date).toLocaleDateString("en-US") : ""}
</td>

                    <td className="border px-4 py-2">{r.reason}</td>
                    <td className="border px-4 py-2">{r.status}</td>
                    <td className="border px-4 py-2 flex justify-center gap-2">
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
                ))
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
      </main>
    </div>
  );
};

export default AdminLeaveRequestsPage;
