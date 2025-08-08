import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import { DateTime } from "luxon";

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

  // ✅ Utility function to safely format UTC ISO strings into Manila time
  const formatDateTime = (isoString, format = "yyyy-MM-dd hh:mm a") => {
    if (!isoString) return "---";
    try {
      return DateTime.fromISO(isoString, { zone: "utc" })
        .setZone("Asia/Manila")
        .toFormat(format);
    } catch (error) {
      console.error("Date parsing error:", error, isoString);
      return "Invalid";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex justify-center items-start p-8">
        <div className="w-full max-w-5xl bg-white shadow-xl rounded-xl p-8">
          <h1 className="text-3xl font-bold mb-6 text-[#6a8932] text-center">
            Employee Time Logs
          </h1>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border">
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
                  const timeIn = log.time_in
                    ? DateTime.fromISO(log.time_in, { zone: "utc" }).setZone("Asia/Manila")
                    : null;

                  const timeOut = log.time_out
                    ? DateTime.fromISO(log.time_out, { zone: "utc" }).setZone("Asia/Manila")
                    : null;

                  const totalHours =
                    timeIn && timeOut
                      ? timeOut.diff(timeIn, "hours").hours.toFixed(2)
                      : "---";

                  return (
                    <tr key={log.id} className="border-t hover:bg-gray-100">
                      <td className="p-3">{log.first_name} {log.last_name}</td>
                      <td className="p-3">{timeIn ? timeIn.toFormat("yyyy-MM-dd") : "---"}</td>
                      <td className="p-3">{timeIn ? timeIn.toFormat("hh:mm a") : "---"}</td>
                      <td className="p-3">{timeOut ? timeOut.toFormat("hh:mm a") : "---"}</td>
                      <td className="p-3">{totalHours}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeLogsPage;
