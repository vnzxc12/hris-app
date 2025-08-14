import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import { FaCheck, FaTimes } from "react-icons/fa";

const API_URL = process.env.REACT_APP_API_URL;

const AdminLeaveRequestsPage = ({ user }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);

  useEffect(() => {
    console.log("[AdminLeaveRequestsPage] Fetching leave requests...");
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const res = await axios.get(`${API_URL}/leave-requests`);
      console.log("[AdminLeaveRequestsPage] Leave requests fetched:", res.data);
      setLeaveRequests(res.data);
    } catch (error) {
      console.error("[AdminLeaveRequestsPage] Error fetching leave requests:", error);
    }
  };

  const handleApproveReject = async (leave_id, status) => {
    console.log(`[AdminLeaveRequestsPage] Attempting to set status ${status} for leave_id ${leave_id}...`);
    try {
      const res = await axios.put(`${API_URL}/leave-requests/${leave_id}`, { status });
      console.log("[AdminLeaveRequestsPage] Update response:", res.data);

      // Update state so buttons disappear
      setLeaveRequests((prev) =>
        prev.map((r) => (r.leave_id === leave_id ? { ...r, status } : r))
      );
    } catch (error) {
      console.error("[AdminLeaveRequestsPage] Error updating leave request:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={user} />

      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-6">Leave Requests</h1>

        <div className="bg-white rounded-lg shadow p-4">
          <table className="w-full border-collapse">
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
                    <td className="border px-4 py-2">{r.start_date}</td>
                    <td className="border px-4 py-2">{r.end_date}</td>
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
