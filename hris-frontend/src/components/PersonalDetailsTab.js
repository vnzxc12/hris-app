import React from "react";
import { FaUser, FaIdCard, FaUniversity } from "react-icons/fa"; // 👈 icon imports

const PersonalDetailsTab = ({ employee }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Personal Details */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-olivegreen">
  <FaUser className="text-olivegreen" />
  Personal Details
</h3>

          <p><strong>Full Name:</strong> {employee.first_name} {employee.middle_name} {employee.last_name}</p>
          <p><strong>Gender:</strong> {employee.gender}</p>
          <p><strong>Marital Status:</strong> {employee.marital_status}</p>
          <p><strong>Email:</strong> {employee.email_address}</p>
          <p><strong>Contact Number:</strong> {employee.contact_number}</p>
         <p>
           <strong>Birthdate:</strong>{" "}
  {new Date(employee.birthdate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })}
</p>
        </div>

        {/* Government IDs */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-olivegreen">

            <FaIdCard />
            Government IDs
          </h3>
          <p><strong>SSS:</strong> {employee.sss}</p>
          <p><strong>TIN:</strong> {employee.tin}</p>
          <p><strong>Pag-ibig:</strong> {employee.pagibig}</p>
          <p><strong>Philhealth:</strong> {employee.philhealth}</p>
        </div>

        {/* Education */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 md:col-span-2">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-olivegreen">

            <FaUniversity />
            Education
          </h3>
          <p><strong>Institution:</strong> {employee.college_institution}</p>
          <p><strong>Degree:</strong> {employee.degree}</p>
          <p><strong>Specialization:</strong> {employee.specialization}</p>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsTab;
