import React from "react";
import { FaBriefcase, FaMoneyBillWave } from "react-icons/fa";

const DetailField = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
    <div className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm text-gray-900 dark:text-white">
      {value || "—"}
    </div>
  </div>
);

const JobDetailsTab = ({ employee, user }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Work Details */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-4">
          <h3 className="text-md font-semibold mb-3 flex items-center gap-2 text-olivegreen">
            <FaBriefcase className="text-olivegreen" />
            Work Details
          </h3>
          <div className="space-y-3">
            <DetailField label="Department" value={employee.department} />
            <DetailField label="Designation" value={employee.designation} />
            <DetailField
              label="Date Hired"
              value={
                employee.date_hired
                  ? new Date(employee.date_hired).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : null
              }
            />
            <DetailField label="Manager" value={employee.manager} />
          </div>
        </div>

        {/* Pay Information */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-4">
          <h3 className="text-md font-semibold mb-3 flex items-center gap-2 text-olivegreen">
            <FaMoneyBillWave className="text-olivegreen" />
            Pay Information
          </h3>
          <div className="space-y-3">
            <DetailField label="Salary Type" value={employee.salary_type} />
            {employee.salary_type === "Hourly" && (
              <DetailField
                label="Rate per Hour"
                value={`₱${employee.rate_per_hour}`}
              />
            )}
            {employee.salary_type === "Monthly" && (
              <DetailField
                label="Monthly Salary"
                value={`₱${employee.monthly_salary}`}
              />
            )}
            <DetailField
              label="Overtime Rate"
              value={employee.overtime_rate ? `₱${employee.overtime_rate}` : null}
            />
          </div>
        </div>

        {/* Deductions */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-4 md:col-span-2">
          <h3 className="text-md font-semibold mb-3 flex items-center gap-2 text-olivegreen">
            <FaMoneyBillWave className="text-olivegreen" />
            Deductions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailField label="SSS" value={`₱${employee.sss_amount}`} />
            <DetailField label="Pag-IBIG" value={`₱${employee.pagibig_amount}`} />
            <DetailField label="PhilHealth" value={`₱${employee.philhealth_amount}`} />
            <DetailField label="Tax" value={`₱${employee.tax_amount}`} />
          </div>

          {/* Reimbursements for Admin */}
          {user?.role === "admin" && (
            <div className="mt-4">
              <h4 className="font-semibold text-olivegreen mb-2">Reimbursements</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailField
                  label="Details"
                  value={employee.reimbursement_details}
                />
                <DetailField
                  label="Amount"
                  value={
                    employee.reimbursement_amount
                      ? `₱${employee.reimbursement_amount}`
                      : null
                  }
                />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default JobDetailsTab;
