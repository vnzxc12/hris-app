import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = process.env.REACT_APP_API_URL;

const PayrollPage = () => {
  const [employees, setEmployees] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [payrollData, setPayrollData] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(`${API_URL}/employees`);
        setEmployees(res.data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    fetchEmployees();
  }, []);

  const calculatePayroll = async () => {
    if (!startDate || !endDate) {
      alert("Select payroll period");
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/payroll/range`, {
        params: { start_date: startDate, end_date: endDate },
      });
      setPayrollData(res.data);
    } catch (err) {
      console.error("Error calculating payroll:", err);
    }
  };

// ✅ Fixed function to match backend expectations
const savePayroll = async () => {
  if (payrollData.length === 0) {
    alert("Generate payroll first before saving");
    return;
  }

  // Log the payload for debugging
  console.log("Saving payroll payload:", {
    payrollData,
    pay_date: endDate // using end date as pay date
  });

  try {
    await axios.post(`${API_URL}/payroll/save`, {
      payrollData,
      pay_date: endDate // backend expects "pay_date"
    });
    alert("Payroll saved successfully!");
  } catch (err) {
    console.error("Error saving payroll:", err);
    alert("Error saving payroll");
  }
};


  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Payroll Report (${startDate} to ${endDate})`, 14, 15);

    const tableColumn = [
      "Employee ID", "Employee", "Total Hours", "OT Hours", "Regular Pay", "OT Pay",
      "SSS", "Pag-IBIG", "PhilHealth", "Tax", "Reimburse Details",
      "Reimburse Amt", "Total Pay"
    ];

    const tableRows = payrollData.map(p => [
      p.employee_id,
      p.name,
      parseFloat(p.totalHours).toFixed(2),
      parseFloat(p.overtimeHours).toFixed(2),
      parseFloat(p.basePay).toFixed(2),
      parseFloat(p.overtimePay).toFixed(2),
      p.sss_amount ? parseFloat(p.sss_amount).toFixed(2) : "0.00",
      p.pagibig_amount ? parseFloat(p.pagibig_amount).toFixed(2) : "0.00",
      p.philhealth_amount ? parseFloat(p.philhealth_amount).toFixed(2) : "0.00",
      p.tax_amount ? parseFloat(p.tax_amount).toFixed(2) : "0.00",
      p.reimbursement_details || "",
      p.reimbursement_amount ? parseFloat(p.reimbursement_amount).toFixed(2) : "0.00",
      parseFloat(p.totalPay).toFixed(2)
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 8 }
    });

    doc.save(`payroll_${startDate}_to_${endDate}.pdf`);
  };

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      <main className="ml-64 p-8 flex justify-center items-start w-full">
        <div className="w-full max-w-7xl bg-white rounded-lg shadow-lg p-8">
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
            <>
              <div className="flex justify-between mb-4">
                {/* ✅ Added Save Payroll button */}
                <button
                  onClick={savePayroll}
                  className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
                >
                  Save Payroll
                </button>

                <button
                  onClick={downloadPDF}
                  className="px-4 py-2 bg-[#6a8932] text-white rounded shadow hover:bg-[#5b762b]"
                >
                  Download PDF
                </button>
              </div>

              <div className="overflow-auto max-w-full">
                <table className="table-auto w-full border-collapse border border-[#6a8932] text-[#355d17] text-sm">
                  <thead className="bg-[#dbe9d6]">
                    <tr>
                  <th className="border border-[#6a8932] px-4 py-2 text-left">Employee ID</th>
                      <th className="border border-[#6a8932] px-4 py-2 text-left">Employee</th>
                      <th className="border border-[#6a8932] px-4 py-2 text-right">Total Hours</th>
                      <th className="border border-[#6a8932] px-4 py-2 text-right">Overtime Hours</th>
                      <th className="border border-[#6a8932] px-4 py-2 text-right">Regular Pay</th>
                      <th className="border border-[#6a8932] px-4 py-2 text-right">Overtime Pay</th>
                      <th className="border border-[#6a8932] px-4 py-2 text-right">SSS</th>
                      <th className="border border-[#6a8932] px-4 py-2 text-right">Pag-IBIG</th>
                      <th className="border border-[#6a8932] px-4 py-2 text-right">PhilHealth</th>
                      <th className="border border-[#6a8932] px-4 py-2 text-right">Tax</th>
                      <th className="border border-[#6a8932] px-4 py-2">Reimbursement Details</th>
                      <th className="border border-[#6a8932] px-4 py-2 text-right">Reimbursement Amount</th>
                      <th className="border border-[#6a8932] px-4 py-2 text-right font-semibold">Total Pay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollData.map((p) => (
                      <tr key={p.employee_id} className="even:bg-[#f0f6e6]">
                        <td className="border border-[#6a8932] px-4 py-2">{p.employee_id}</td>
                        <td className="border border-[#6a8932] px-4 py-2">{p.name}</td>
                        <td className="border border-[#6a8932] px-4 py-2 text-right">{parseFloat(p.totalHours).toFixed(2)}</td>
                        <td className="border border-[#6a8932] px-4 py-2 text-right">{parseFloat(p.overtimeHours).toFixed(2)}</td>
                        <td className="border border-[#6a8932] px-4 py-2 text-right">{parseFloat(p.basePay).toFixed(2)}</td>
                        <td className="border border-[#6a8932] px-4 py-2 text-right">{parseFloat(p.overtimePay).toFixed(2)}</td>
                        <td className="border border-[#6a8932] px-4 py-2 text-right">{p.sss_amount ? parseFloat(p.sss_amount).toFixed(2) : "0.00"}</td>
                        <td className="border border-[#6a8932] px-4 py-2 text-right">{p.pagibig_amount ? parseFloat(p.pagibig_amount).toFixed(2) : "0.00"}</td>
                        <td className="border border-[#6a8932] px-4 py-2 text-right">{p.philhealth_amount ? parseFloat(p.philhealth_amount).toFixed(2) : "0.00"}</td>
                        <td className="border border-[#6a8932] px-4 py-2 text-right">{p.tax_amount ? parseFloat(p.tax_amount).toFixed(2) : "0.00"}</td>
                        <td className="border border-[#6a8932] px-4 py-2">{p.reimbursement_details || ""}</td>
                        <td className="border border-[#6a8932] px-4 py-2 text-right">{p.reimbursement_amount ? parseFloat(p.reimbursement_amount).toFixed(2) : "0.00"}</td>
                        <td className="border border-[#6a8932] px-4 py-2 text-right font-semibold">{parseFloat(p.totalPay).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default PayrollPage;
