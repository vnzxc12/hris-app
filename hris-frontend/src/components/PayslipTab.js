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


const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0;
  return `${num < 0 ? "-" : ""}Php ${Math.abs(num).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
};

const downloadPDF = (payslip) => {
  const doc = new jsPDF();

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Payslip", 14, 20);

  // Employee Info
  doc.setFontSize(11);
  const infoY = 30;
  const lineGap = 8;

  const info = [
    ["Name:", `${payslip.first_name} ${payslip.last_name}`],
    ["Department:", payslip.department],
    ["Designation:", payslip.designation],
    ["Pay Date:", formatDate(payslip.pay_date)]
  ];

  info.forEach((row, i) => {
    doc.setFont(undefined, "bold");
    doc.text(row[0], 14, infoY + (i * lineGap));
    doc.setFont(undefined, "normal");
    doc.text(row[1], 50, infoY + (i * lineGap));
  });

  // Table
  autoTable(doc, {
    startY: infoY + (info.length * lineGap) + 6,
    head: [["Description", "Amount"]],
    body: [
      ["Base Pay", formatCurrency(payslip.base_pay)],
      ["Overtime Pay", formatCurrency(payslip.overtime_pay)],
      ["SSS", formatCurrency(-payslip.sss_amount)],
      ["Pag-IBIG", formatCurrency(-payslip.pagibig_amount)],
      ["PhilHealth", formatCurrency(-payslip.philhealth_amount)],
      ["Tax", formatCurrency(-payslip.tax_amount)],
      ["Reimbursement", formatCurrency(payslip.reimbursement_amount)],
      [
        { content: "Total Pay", styles: { fontStyle: "bold" } },
        { content: formatCurrency(payslip.total_pay), styles: { fontStyle: "bold" } }
      ]
    ],
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
      halign: "center"
    },
    styles: {
      font: "helvetica",
      fontSize: 10,
      cellPadding: 4
    },
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "right" }
    },
    theme: "striped",
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
  <strong>Total Pay:</strong> {formatCurrency(payslip.total_pay)}
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
