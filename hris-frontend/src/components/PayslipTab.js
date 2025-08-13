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
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/payslips/${employeeId}`
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
    doc.text(`Name: ${payslip.first_name} ${payslip.last_name}`, 14, 30);
    doc.text(`Department: ${payslip.department}`, 14, 38);
    doc.text(`Designation: ${payslip.designation}`, 14, 46);
    doc.text(`Pay Date: ${payslip.pay_date}`, 14, 54);

    autoTable(doc, {
      startY: 64,
      head: [["Description", "Amount"]],
      body: [
        ["Base Pay", payslip.base_pay],
        ["Overtime Pay", payslip.overtime_pay],
        ["SSS", payslip.sss_amount],
        ["Pag-IBIG", payslip.pagibig_amount],
        ["PhilHealth", payslip.philhealth_amount],
        ["Tax", payslip.tax_amount],
        ["Reimbursement", payslip.reimbursement_amount],
        ["Total Pay", payslip.total_pay],
      ],
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
