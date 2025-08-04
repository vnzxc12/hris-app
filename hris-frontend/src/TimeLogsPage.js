import React, { useEffect, useState } from "react";
import axios from "axios";

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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Employee Time Logs</h1>
      <div className="overflow-auto rounded shadow border">
        <table className="min-w-full text-sm text-left bg-white">
          <thead className="bg-[#5DBB63] text-white">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Date</th>
              <th className="p-3">Time In</th>
              <th className="p-3">Time Out</th>
              <th className="p-3">Total Hours</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => {
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
  );
};

export default TimeLogsPage;
