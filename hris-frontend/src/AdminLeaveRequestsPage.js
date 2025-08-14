import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaClipboardList, FaCheck, FaTimes } from "react-icons/fa";
import Sidebar from "./Sidebar";

const API_URL = process.env.REACT_APP_API_URL;

const AdminLeaveRequestsPage = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    console.log("Fetching leave requests...");
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/leaves`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("Leave requests fetched:", res.data);
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching leave requests:", err);
      toast.error("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApproveReject = async (id, status) => {
    console.log(`Updating leave request ${id} to status: ${status}`);
    try {
      await axios.put(
        `${API_URL}/leaves/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success(`Leave request ${status}`);
      fetchRequests();
    } catch (err) {
      console.error("Error updating leave request:", err);
      toast.error("Failed to update leave request");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#6a8932]">
            <FaClipboardList /> All Leave Requests
          </h3>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : requests.length === 0 ? (
            <p className="text-gray-500">No leave requests found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-[#f0f4e3]">
                  <tr>
                    <th className="border px-4 py-3 text-sm font-semibold text-gray-700">Employee</th>
                    <th className="border px-4 py-3 text-sm font-semibold text-gray-700">Leave Type</th>
                    <th className="border px-4 py-3 text-sm font-semibold text-gray-700">From</th>
                    <th className="border px-4 py-3 text-sm font-semibold text-gray-700">To</th>
                    <th className="border px-4 py-3 text-sm font-semibold text-gray-700">Status</th>
                    <th className="border px-4 py-3 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.leave_id} className="text-center hover:bg-gray-50 transition">
                      <td className="border px-4 py-2">
                        {r.first_name} {r.last_name}
                      </td>
                      <td className="border px-4 py-2">{r.leave_type}</td>
                      <td className="border px-4 py-2">
                        {new Date(r.start_date).toLocaleDateString()}
                      </td>
                      <td className="border px-4 py-2">
                        {new Date(r.end_date).toLocaleDateString()}
                      </td>
                      <td
                        className={`border px-4 py-2 font-semibold ${
                          r.status === "Approved"
                            ? "text-green-600"
                            : r.status === "Rejected"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {r.status}
                      </td>
                      <td className="border px-4 py-2 flex justify-center gap-2">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLeaveRequestsPage;
