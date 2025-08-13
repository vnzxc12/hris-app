
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import Sidebar from "./Sidebar";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.REACT_APP_API_URL;

const EditEmployeePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    last_name: "",
    first_name: "",
    middle_name: "",
    gender: "",
    marital_status: "",
    contact_number: "",
    email_address: "",
    address: "",
    department: "",
    designation: "",
    manager: "",
    date_hired: "",
    sss: "",
    tin: "",
    pagibig: "",
    philhealth: "",
    salary_type: "",        
    rate_per_hour: "", 
    monthly_salary: "", 
    sss_amount: "",
    philhealth_amount: "",
    pagibig_amount: "",
    tax_amount: "",
    reimbursement_details: "",
    reimbursement_amount: "",
    overtime_rate: "",
    });

  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const isEmployee = user?.role?.toLowerCase() === "employee";
  const employeeId = user?.employee_id;
  console.log("Stored token:", localStorage.getItem("token"));
  const token = localStorage.getItem("token");
if (!token) {
  console.warn("⚠️ No token found in localStorage!");
}


  useEffect(() => {
    if (!user || employeeId === undefined) return;
    if (isEmployee && parseInt(id) !== parseInt(employeeId)) {
      toast.error("Unauthorized to edit this employee.");
      return navigate("/unauthorized");
    }
  }, [id, isEmployee, employeeId, navigate, user]);

  useEffect(() => {
  if (!user || employeeId === undefined) return;

  axios
    .get(`${API_URL}/employees/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      setFormData(res.data);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Error fetching employee:", err);
      toast.error("Failed to load employee data.");
    });
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [id]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEmployee && parseInt(id) !== parseInt(employeeId)) {
      toast.error("Unauthorized to edit another employee's info.");
      return;
    }

    const allowedFields = {
      marital_status: formData.marital_status,
      contact_number: formData.contact_number,
      email_address: formData.email_address,
      address: formData.address,
      sss: formData.sss,
      tin: formData.tin,
      pagibig: formData.pagibig,
      philhealth: formData.philhealth,
      emergency_contact_name: formData.emergency_contact_name,
      emergency_contact_relationship: formData.emergency_contact_relationship,
      emergency_contact_phone: formData.emergency_contact_phone,
      emergency_contact_email: formData.emergency_contact_email,
      emergency_contact_address: formData.emergency_contact_address,
      college_institution: formData.college_institution,
      degree: formData.degree,
      specialization: formData.specialization,
        };

   

    try {
      if (isEmployee) {
        await axios.put(
          `${API_URL}/employees/${employeeId}/self-update`,
          { ...allowedFields, employee_id: employeeId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
      // Sanitize payload for empty strings
const cleanPayload = {
  ...formData,
  rate_per_hour:
    formData.rate_per_hour === "" ? null : Number(formData.rate_per_hour),
      monthly_salary:
    formData.monthly_salary === "" ? null : Number(formData.monthly_salary),
      overtime_rate:
    formData.overtime_rate === "" ? null : Number(formData.overtime_rate),
  salary_type:
    formData.salary_type === "" ? null : formData.salary_type,
  date_hired:
    formData.date_hired === "" ? null : formData.date_hired.slice(0, 10),
};

await axios.put(`${API_URL}/employees/${id}`, cleanPayload, {
  headers: { Authorization: `Bearer ${token}` },
});

      }

      toast.success("Employee updated successfully!");
      setTimeout(() => {
        navigate(`/employees/${id}`);
      }, 1500);
    } catch (err) {
      console.error("Error updating employee:", err);
      toast.error("Failed to update employee.");
    }
  };

  const handleCancel = () => {
    navigate(`/employees/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-700 dark:text-white">
        Loading employee data...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 p-6 ml-64">
        <ToastContainer />
        <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
            Edit Employee Information
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
           
            {/* Personal Details */}
            <section>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
                Personal Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} isEmployee={isEmployee} />
                <Input label="Middle Name" name="middle_name" value={formData.middle_name} onChange={handleChange} isEmployee={isEmployee} />
                <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} isEmployee={isEmployee} />
                <Select label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={["Male", "Female", "Other"]} isEmployee={isEmployee} />
                <Select label="Marital Status" name="marital_status" value={formData.marital_status} onChange={handleChange} options={["Single", "Married", "Widowed"]} isEmployee={isEmployee} />
                <Input label="Contact Number" name="contact_number" value={formData.contact_number} onChange={handleChange} isEmployee={isEmployee} />
                <Input label="Email Address" name="email_address" value={formData.email_address} onChange={handleChange} isEmployee={isEmployee} />
                <Input label="Address" name="address" value={formData.address} onChange={handleChange} isEmployee={isEmployee} />
              </div>
            </section>

            {/* Work Details */}
            <section>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Work Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Department" name="department" value={formData.department} onChange={handleChange} isEmployee={isEmployee} />
                <Input label="Designation" name="designation" value={formData.designation} onChange={handleChange} isEmployee={isEmployee} />
                <Input label="Manager" name="manager" value={formData.manager} onChange={handleChange} isEmployee={isEmployee} />
                <Input label="Date Hired" name="date_hired" type="date" value={formData.date_hired?.slice(0, 10)} onChange={handleChange} isEmployee={isEmployee} />
              </div>
            </section>

            {/* Education Information */}
              <section>
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Education</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="College / Institution" name="college_institution" value={formData.college_institution} onChange={handleChange} isEmployee={isEmployee} />
                  <Input label="Degree" name="degree" value={formData.degree} onChange={handleChange} isEmployee={isEmployee} />
                  <Input label="Specialization" name="specialization" value={formData.specialization} onChange={handleChange} isEmployee={isEmployee} />
                </div>
              </section>

              {/* Emergency Contact */}
              <section>
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Emergency Contact</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Contact Name" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} isEmployee={isEmployee} />
                  <Input label="Relationship" name="emergency_contact_relationship" value={formData.emergency_contact_relationship} onChange={handleChange} isEmployee={isEmployee} />
                  <Input label="Phone Number" name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange} isEmployee={isEmployee} />
                  <Input label="Email" name="emergency_contact_email" value={formData.emergency_contact_email} onChange={handleChange} isEmployee={isEmployee} />
                  <Input label="Address" name="emergency_contact_address" value={formData.emergency_contact_address} onChange={handleChange} isEmployee={isEmployee} />
                </div>
              </section>

              {/* Other Info */}
              <section>
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Other Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Birthdate" name="birthdate" type="date" value={formData.birthdate?.slice(0, 10)} onChange={handleChange} isEmployee={isEmployee} />
                  <Select label="Status" name="status" value={formData.status} onChange={handleChange} options={["Active", "Inactive"]} isEmployee={isEmployee} />
                </div>
              </section>

            {/* Government IDs */}
            <section>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Government IDs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="SSS" name="sss" value={formData.sss} onChange={handleChange} isEmployee={isEmployee} />
                <Input label="TIN" name="tin" value={formData.tin} onChange={handleChange} isEmployee={isEmployee} />
                <Input label="Pag-ibig" name="pagibig" value={formData.pagibig} onChange={handleChange} isEmployee={isEmployee} />
                <Input label="PhilHealth" name="philhealth" value={formData.philhealth} onChange={handleChange} isEmployee={isEmployee} />
              </div>
            </section>

               {/* Pay Information */}
<section>
  <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Pay Information</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Select
      label="Salary Type"
      name="salary_type"
      value={formData.salary_type}
      onChange={handleChange}
      options={["Hourly", "Monthly"]}
      isEmployee={isEmployee}
    />

    {formData.salary_type === "Hourly" && (
      <Input
        label="Rate per Hour"
        name="rate_per_hour"
        type="number"
        value={formData.rate_per_hour}
        onChange={handleChange}
        isEmployee={isEmployee}
      />
    )}

    {formData.salary_type === "Monthly" && (
      <Input
        label="Monthly Salary"
        name="monthly_salary"
        type="number"
        value={formData.monthly_salary}
        onChange={handleChange}
        isEmployee={isEmployee}
      />
    )}
  </div>
</section>

{/* Deductions & Reimbursement - Admin Only */}
{!isEmployee && (
  <section>
    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
      Deductions & Reimbursement
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input label="SSS Amount" name="sss_amount" type="number" value={formData.sss_amount} onChange={handleChange} />
      <Input label="PhilHealth Amount" name="philhealth_amount" type="number" value={formData.philhealth_amount} onChange={handleChange} />
      <Input label="Pag-ibig Amount" name="pagibig_amount" type="number" value={formData.pagibig_amount} onChange={handleChange} />
      <Input label="Tax Amount" name="tax_amount" type="number" value={formData.tax_amount} onChange={handleChange} />
      <Input label="Reimbursement Details" name="reimbursement_details" value={formData.reimbursement_details} onChange={handleChange} />
      <Input label="Reimbursement Amount" name="reimbursement_amount" type="number" value={formData.reimbursement_amount} onChange={handleChange} />
      <Input label="Overtime Rate" name="overtime_rate" type="number" value={formData.overtime_rate} onChange={handleChange} />
    </div>
  </section>
)}


            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

// Reusable Inputs with employee restriction
const Input = ({ label, name, value, onChange, type = "text", isEmployee }) => {
  const editableFields = [
  "marital_status",
  "contact_number",
  "email_address",
  "address",
  "sss",
  "tin",
  "pagibig",
  "philhealth",
  "emergency_contact_name",
  "emergency_contact_relationship",
  "emergency_contact_phone",
  "emergency_contact_email",
  "emergency_contact_address",
  "college_institution",
  "degree",
  "specialization",
];
  const disabled = isEmployee && !editableFields.includes(name);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
          disabled ? "bg-gray-200 dark:bg-gray-600 cursor-not-allowed" : "focus:ring focus:ring-green-300"
        } dark:bg-gray-700 dark:text-white dark:border-gray-600`}
      />
    </div>
  );
};

const Select = ({ label, name, value, onChange, options, isEmployee }) => {
  const editableFields = [
  "marital_status",
];
  const disabled = isEmployee && !editableFields.includes(name);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
          disabled ? "bg-gray-200 dark:bg-gray-600 cursor-not-allowed" : "focus:ring focus:ring-green-300"
        } dark:bg-gray-700 dark:text-white dark:border-gray-600`}
      >
        <option value="">-- Select --</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export default EditEmployeePage;
