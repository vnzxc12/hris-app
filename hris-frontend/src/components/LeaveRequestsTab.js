import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaPaperPlane, FaCheck, FaTimes } from "react-icons/fa";

const API_URL = process.env.REACT_APP_API_URL;

const LeaveRequestsTab = ({ employeeId: propEmployeeId, user }) => {
  const [employeeId] = useState(
    user?.role === "admin" ? propEmployeeId : user?.employee_id
  );
  const [requests, setRequests] = useState([]);
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);

 const fetchRequests = async () => {
  setLoading(true);
  try {
    const res = await axios.get(`${API_URL}/leaves`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    // Filter requests for this employee only
    const filtered = res.data.filter(r => r.employee_id === employeeId);
    setRequests(filtered);

  } catch (err) {
    console.error(err);
    toast.error("Failed to load leave requests");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (employeeId) fetchRequests();
  }, [employeeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!leaveType || !fromDate || !toDate) return toast.error("Fill all fields");

    try {
      await axios.post(
        `${API_URL}/leaves`,
        { leave_type: leaveType, start_date: fromDate, end_date: toDate, reason: "" },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("Leave request submitted");
      setLeaveType(""); setFromDate(""); setToDate("");
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit leave request");
    }
  };

  const handleApproveReject = async (id, status) => {
    try {
      await axios.put(
        `${API_URL}/leaves/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success(`Leave request ${status}`);
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update leave request");
    }
  };

  if (loading) return <p>Loading leave requests...</p>;

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="bg-white shadow rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-olivegreen">
          <FaPaperPlane className="text-olivegreen" /> Leave Requests
        </h3>

        {user?.role !== "admin" && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="border p-2 rounded" required>
              <option value="">Select Leave Type</option>
              <option value="Vacation">Vacation</option>
              <option value="Sick">Sick</option>
              <option value="Maternity">Maternity</option>
              <option value="Paternity">Paternity</option>
              <option value="Emergency">Emergency</option>
              <option value="Unpaid">Unpaid</option>
            </select>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border p-2 rounded" required />
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border p-2 rounded" required />
            <button type="submit" className="bg-[#6a8932] text-white px-4 py-2 rounded hover:bg-[#577025]">Submit</button>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Leave Type</th>
                <th className="border px-4 py-2">From</th>
                <th className="border px-4 py-2">To</th>
                <th className="border px-4 py-2">Status</th>
              
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.leave_id} className="text-center">
                  <td className="border px-4 py-2">{r.leave_type}</td>
                  <td className="border px-4 py-2">{new Date(r.start_date).toLocaleDateString()}</td>
                  <td className="border px-4 py-2">{new Date(r.end_date).toLocaleDateString()}</td>
                  <td className="border px-4 py-2">{r.status}</td>
                 
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestsTab;
