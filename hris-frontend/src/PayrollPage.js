import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import { DateTime } from "luxon";

const PayrollPage = () => {
  const [employees, setEmployees] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [payrollData, setPayrollData] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get("/employees"); // Backend should return salary fields
        setEmployees(res.data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    fetchEmployees();
  }, []);

  const calculatePayroll = async () => {
    if (!startDate || !endDate) return alert("Select payroll period");

    try {
      const res = await axios.get(`/time-logs/range`, {
        params: { start: startDate, end: endDate },
      });

      const logs = res.data; // [{ employee_id, date, hours_worked, overtime_hours }, ...]

      const payroll = employees.map((emp) => {
        const empLogs = logs.filter((log) => log.employee_id === emp.id);
        let totalHours = empLogs.reduce((sum, l) => sum + l.hours_worked, 0);
        let overtimeHours = empLogs.reduce((sum, l) => sum + l.overtime_hours, 0);

        let regularPay = 0;
        if (emp.salary_type === "hourly") {
          regularPay = totalHours * emp.rate_per_hour;
        } else {
          regularPay = emp.monthly_salary; // For monthly, fixed
        }

        let overtimePay = overtimeHours * (emp.overtime_rate || 0);

        return {
          ...emp,
          totalHours,
          overtimeHours,
          regularPay,
          overtimePay,
          totalPay: regularPay + overtimePay,
        };
      });

      setPayrollData(payroll);
    } catch (err) {
      console.error("Error calculating payroll:", err);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-6 w-full">
        <h1 className="text-2xl font-bold mb-4">Payroll</h1>
        <div className="flex gap-4 mb-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded"
          />
          <button
            onClick={calculatePayroll}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Generate Payroll
          </button>
        </div>

        {payrollData.length > 0 && (
          <table className="table-auto w-full border-collapse border">
            <thead>
              <tr>
                <th className="border p-2">Employee</th>
                <th className="border p-2">Total Hours</th>
                <th className="border p-2">Overtime Hours</th>
                <th className="border p-2">Regular Pay</th>
                <th className="border p-2">Overtime Pay</th>
                <th className="border p-2">Total Pay</th>
              </tr>
            </thead>
            <tbody>
              {payrollData.map((p) => (
                <tr key={p.id}>
                  <td className="border p-2">
                    {p.first_name} {p.last_name}
                  </td>
                  <td className="border p-2">{p.totalHours}</td>
                  <td className="border p-2">{p.overtimeHours}</td>
                  <td className="border p-2">{p.regularPay.toFixed(2)}</td>
                  <td className="border p-2">{p.overtimePay.toFixed(2)}</td>
                  <td className="border p-2">{p.totalPay.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PayrollPage;
