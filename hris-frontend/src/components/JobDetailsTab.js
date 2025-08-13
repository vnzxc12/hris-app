// JobDetailsTab.js
import React from "react";
import { FaBriefcase, FaMoneyBillWave } from "react-icons/fa";

const JobDetailsTab = ({ employee, user }) => (
  <div className="bg-gray-50 p-6 rounded-lg">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Work Details */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#6a8932]">
          <FaBriefcase className="text-[#6a8932]" />
          Work Details
        </h3>
        <p><strong>Department:</strong> {employee.department}</p>
        <p><strong>Designation:</strong> {employee.designation}</p>
        <p>
          <strong>Date Hired:</strong>{" "}
          {employee.date_hired
            ? new Date(employee.date_hired).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "N/A"}
        </p>
        <p><strong>Manager:</strong> {employee.manager}</p>
      </div>

      {/* Pay Information */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#6a8932]">
          <FaMoneyBillWave className="text-[#6a8932]" />
          Pay Information
        </h3>
        <p><strong>Salary Type:</strong> {employee.salary_type}</p>

        {employee.salary_type === "Hourly" ? (
          <p><strong>Rate per Hour:</strong> ₱{employee.rate_per_hour}</p>
        ) : employee.salary_type === "Monthly" ? (
          <p><strong>Monthly Salary:</strong> ₱{employee.monthly_salary}</p>
        ) : null}
        <p><strong>Overtime Rate:</strong> {employee.overtime_rate}</p>
      </div>

      {/* Deductions */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#6a8932]">
          <FaMoneyBillWave className="text-[#6a8932]" />
          Deductions
        </h3>
        <div className="mt-4">
          <p><strong>SSS:</strong> ₱{employee.sss_amount}</p>
          <p><strong>Pag-IBIG:</strong> ₱{employee.pagibig_amount}</p>
          <p><strong>PhilHealth:</strong> ₱{employee.philhealth_amount}</p>
          <p><strong>Tax:</strong> ₱{employee.tax_amount}</p>
        </div>

        {/* Show reimbursements only if user is admin */}
        {user?.role === "admin" && (
          <div className="mt-4">
            <h4 className="font-semibold text-[#6a8932]">Reimbursements</h4>
            <p><strong>Details:</strong> {employee.reimbursement_details || "N/A"}</p>
            <p><strong>Amount:</strong> ₱{employee.reimbursement_amount}</p>
          </div>
        )}
      </div>

    </div>
  </div>
);


export default JobDetailsTab;
