import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";

const PayrollPage = () => {
  const [employees, setEmployees] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [payrollData, setPayrollData] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get("/employees");
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

    console.log("Time logs API response:", res.data); // Add this to inspect the response

    const logs = Array.isArray(res.data) ? res.data : [];

    const payroll = employees.map((emp) => {
      const empLogs = logs.filter((log) => log.employee_id === emp.id);
      let totalHours = empLogs.reduce((sum, l) => sum + (l.hours_worked || 0), 0);
      let overtimeHours = empLogs.reduce((sum, l) => sum + (l.overtime_hours || 0), 0);

      let regularPay = 0;
      if (emp.salary_type === "hourly") {
        regularPay = totalHours * emp.rate_per_hour;
      } else {
        regularPay = emp.monthly_salary || 0;
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
    <div className="min-h-screen bg-white">
      <Sidebar />
      <main className="ml-64 p-8 flex justify-center">
        <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-[#6a8932] text-center">
            Payroll
          </h1>

          <div className="flex gap-4 mb-6 max-w-md mx-auto">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-[#6a8932] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6a8932]"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-[#6a8932] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6a8932]"
            />
            <button
              onClick={calculatePayroll}
              className="px-4 py-2 rounded border font-medium shadow text-[#6a8932] border-[#6a8932] bg-white hover:bg-[#6a8932] hover:text-white transition-colors"
            >
              Generate Payroll
            </button>
          </div>

          {payrollData.length > 0 && (
            <div className="overflow-auto max-w-full">
              <table className="table-auto w-full border-collapse border border-[#6a8932] text-[#355d17]">
                <thead className="bg-[#dbe9d6]">
                  <tr>
                    <th className="border border-[#6a8932] px-4 py-2 text-left">Employee</th>
                    <th className="border border-[#6a8932] px-4 py-2 text-right">Total Hours</th>
                    <th className="border border-[#6a8932] px-4 py-2 text-right">Overtime Hours</th>
                    <th className="border border-[#6a8932] px-4 py-2 text-right">Regular Pay</th>
                    <th className="border border-[#6a8932] px-4 py-2 text-right">Overtime Pay</th>
                    <th className="border border-[#6a8932] px-4 py-2 text-right">Total Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollData.map((p) => (
                    <tr key={p.id} className="even:bg-[#f0f6e6]">
                      <td className="border border-[#6a8932] px-4 py-2">
                        {p.first_name} {p.last_name}
                      </td>
                      <td className="border border-[#6a8932] px-4 py-2 text-right">{p.totalHours.toFixed(2)}</td>
                      <td className="border border-[#6a8932] px-4 py-2 text-right">{p.overtimeHours.toFixed(2)}</td>
                      <td className="border border-[#6a8932] px-4 py-2 text-right">{p.regularPay.toFixed(2)}</td>
                      <td className="border border-[#6a8932] px-4 py-2 text-right">{p.overtimePay.toFixed(2)}</td>
                      <td className="border border-[#6a8932] px-4 py-2 text-right">{p.totalPay.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PayrollPage;
