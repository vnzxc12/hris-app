import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import { DateTime } from "luxon";

// ✅ Parse server UTC time and convert to PH
const parsePHTime = (value) => {
  if (!value) return null;
  try {
    // Always treat as UTC from backend, then convert to PH
    let dt = DateTime.fromISO(value, { zone: "utc" }).setZone("Asia/Manila");
    if (!dt.isValid) {
      // MySQL fallback (no timezone info)
      dt = DateTime.fromFormat(value, "yyyy-MM-dd HH:mm:ss", { zone: "utc" }).setZone("Asia/Manila");
    }
    return dt.isValid ? dt : null;
  } catch {
    return null;
  }
};

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
      <div className="w-64">
        <Sidebar />
      </div>

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
                  const timeIn = parsePHTime(log.time_in);
                  const timeOut = parsePHTime(log.time_out);
                  const totalHours =
                    timeIn && timeOut
                      ? timeOut.diff(timeIn, "hours").hours.toFixed(2)
                      : "---";

                  return (
                    <tr key={log.id} className="border-t hover:bg-gray-100">
                      <td className="p-3">{log.first_name} {log.last_name}</td>
                      <td className="p-3">{timeIn?.toFormat("yyyy-MM-dd") || "---"}</td>
                      <td className="p-3">{timeIn?.toFormat("hh:mm a") || "---"}</td>
                      <td className="p-3">{timeOut?.toFormat("hh:mm a") || "---"}</td>
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
