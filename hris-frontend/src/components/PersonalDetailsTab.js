import React from "react";
import { FaUser, FaIdCard, FaUniversity } from "react-icons/fa";

const DetailField = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
      {label}
    </p>
    <div className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1.5 text-gray-900 dark:text-white text-sm">
      {value || "—"}
    </div>
  </div>
);

const PersonalDetailsTab = ({ employee }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Personal Details */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 space-y-3">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-olivegreen">
            <FaUser className="text-olivegreen" />
            Personal Details
          </h3>
          <DetailField label="Full Name" value={`${employee.first_name} ${employee.middle_name} ${employee.last_name}`} />
          <DetailField label="Gender" value={employee.gender} />
          <DetailField label="Marital Status" value={employee.marital_status} />
          <DetailField label="Email" value={employee.email_address} />
          <DetailField label="Contact Number" value={employee.contact_number} />
          <DetailField 
            label="Birthdate" 
            value={new Date(employee.birthdate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })} 
          />
        </div>

        {/* Government IDs */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 space-y-3">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-olivegreen">
            <FaIdCard />
            Government IDs
          </h3>
          <DetailField label="SSS" value={employee.sss} />
          <DetailField label="TIN" value={employee.tin} />
          <DetailField label="Pag-ibig" value={employee.pagibig} />
          <DetailField label="Philhealth" value={employee.philhealth} />
        </div>

        {/* Education */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 space-y-3 md:col-span-2">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-olivegreen">
            <FaUniversity />
            Education
          </h3>
          <DetailField label="Institution" value={employee.college_institution} />
          <DetailField label="Degree" value={employee.degree} />
          <DetailField label="Specialization" value={employee.specialization} />
        </div>
      </div>
    </div>
  );
};


export default PersonalDetailsTab;
