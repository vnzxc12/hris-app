import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const PayslipTab = ({ employeeId }) => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchPayslips = async () => {
    try {
      const token = localStorage.getItem("token"); // get token here
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/payslips/${employeeId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setPayslips(res.data);
    } catch (error) {
      console.error("Error fetching payslips:", error);
    } finally {
      setLoading(false);
    }
  };

  if (employeeId) {
    fetchPayslips();
  }
}, [employeeId]);


  const downloadPDF = (payslip) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Payslip", 14, 20);

  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("Name:", 14, 30);
  doc.setFont(undefined, "normal");
  doc.text(`${payslip.first_name} ${payslip.last_name}`, 40, 30);

  doc.setFont(undefined, "bold");
  doc.text("Department:", 14, 38);
  doc.setFont(undefined, "normal");
  doc.text(payslip.department, 40, 38);

  doc.setFont(undefined, "bold");
  doc.text("Designation:", 14, 46);
  doc.setFont(undefined, "normal");
  doc.text(payslip.designation, 40, 46);

  doc.setFont(undefined, "bold");
  doc.text("Pay Date:", 14, 54);
  doc.setFont(undefined, "normal");
  doc.text(payslip.pay_date, 40, 54);

  autoTable(doc, {
    startY: 64,
    head: [["Description", "Amount"]],
    body: [
      ["Base Pay", payslip.base_pay],
      ["Overtime Pay", payslip.overtime_pay],
      ["SSS", `-₱${payslip.sss_amount}`],
      ["Pag-IBIG", `-₱${payslip.pagibig_amount}`],
      ["PhilHealth", `-₱${payslip.philhealth_amount}`],
      ["Tax", `-₱${payslip.tax_amount}`],
      ["Reimbursement", `₱${payslip.reimbursement_amount}`],
      [{ content: "Total Pay", styles: { fontStyle: "bold" } }, { content: `₱${payslip.total_pay}`, styles: { fontStyle: "bold" } }],
    ],
    styles: { halign: "right" },
    columnStyles: { 0: { halign: "left" }, 1: { halign: "right" } }
  });

  doc.save(`Payslip_${payslip.pay_date}.pdf`);
};


  if (loading) return <p>Loading payslips...</p>;
  if (payslips.length === 0) return <p>No payslips available.</p>;

  return (
    <div className="space-y-4">
      {payslips.map((payslip) => (
        <div
          key={payslip.payslip_id}
          className="border rounded-lg p-4 shadow bg-white"
        >
          <h3 className="text-lg font-semibold">
            Payslip for {payslip.pay_date}
          </h3>
          <p className="text-sm text-gray-600">
            {payslip.first_name} {payslip.last_name} — {payslip.department} |{" "}
            {payslip.designation}
          </p>
          <p className="mt-2">
            <strong>Total Pay:</strong> ₱{payslip.total_pay}
          </p>
          <button
            onClick={() => downloadPDF(payslip)}
            className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Download PDF
          </button>
        </div>
      ))}
    </div>
  );
};

export default PayslipTab;
