import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from './Sidebar'; 

const TimeLogsPage = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/time-logs/all`);
        setLogs(res.data);
      } catch (err) {
        console.error("Error fetching logs", err);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar with fixed width */}
      <div className="w-64">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-x-auto">
        <h1 className="text-2xl font-bold mb-4">Employee Time Logs</h1>
        <div className="rounded shadow border bg-white overflow-x-auto">
          <table className="min-w-[700px] text-sm text-left">
            <thead className="bg-[#6a8932] text-white">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Date</th>
                <th className="p-3">Time In</th>
                <th className="p-3">Time Out</th>
                <th className="p-3">Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const timeIn = log.time_in ? new Date(log.time_in) : null;
                const timeOut = log.time_out ? new Date(log.time_out) : null;

                const totalHours =
                  timeIn && timeOut
                    ? ((timeOut - timeIn) / (1000 * 60 * 60)).toFixed(2)
                    : "---";

                return (
                  <tr key={log.id} className="border-t hover:bg-gray-100">
                    <td className="p-3">{log.first_name} {log.last_name}</td>
                    <td className="p-3">{timeIn?.toLocaleDateString()}</td>
                    <td className="p-3">{timeIn?.toLocaleTimeString()}</td>
                    <td className="p-3">{timeOut?.toLocaleTimeString() || "---"}</td>
                    <td className="p-3">{totalHours}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimeLogsPage;
