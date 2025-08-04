// No changes here
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import Sidebar from "./Sidebar";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.REACT_APP_API_URL;

const EditEmployeePage = () => {
  const { id } = useParams(); // employee id from route
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
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const isEmployee = user?.role?.toLowerCase() === "employee";
  const employeeId = user?.employee_id;

 useEffect(() => {
  if (isEmployee && parseInt(id) !== parseInt(employeeId)) {
    navigate("/unauthorized");
  }
}, [id, employeeId, isEmployee, navigate]);

useEffect(() => {
  console.log("isEmployee:", isEmployee);
  console.log("route id:", id, typeof id);
  console.log("employee_id:", employeeId, typeof employeeId);

  if (!user || employeeId === undefined) return;

  if (isEmployee && parseInt(id) !== parseInt(employeeId)) {
    toast.error("Unauthorized to edit this employee.");
    navigate("/unauthorized");
  }
}, [id, isEmployee, employeeId, user, navigate]);


// ✅ Fetch the data only if allowed
useEffect(() => {
  axios
    .get(`${API_URL}/employees/${id}`)
    .then((res) => setFormData(res.data))
    .catch((err) => {
      console.error("Error fetching employee:", err);
      toast.error("Failed to load employee data.");
    });
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
      sss: formData.sss,
      tin: formData.tin,
      pagibig: formData.pagibig,
      philhealth: formData.philhealth,
    };

    const payload = isEmployee ? allowedFields : formData;
    const endpoint = isEmployee
      ? `${API_URL}/employees/${employeeId}/self-update`
      : `${API_URL}/employees/${id}`;

   try {
 const token = localStorage.getItem("token");

if (isEmployee) {
  await axios.put(
    `${API_URL}/employees/${employeeId}/self-update`,
    {
      ...allowedFields,
      employee_id: employeeId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
} else {
  await axios.put(
    `${API_URL}/employees/${id}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
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
                <Input label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} />
                <Input label="Middle Name" name="middle_name" value={formData.middle_name} onChange={handleChange} />
                <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} />
                <Select label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={["Male", "Female", "Other"]} />
                <Select label="Marital Status" name="marital_status" value={formData.marital_status} onChange={handleChange} options={["Single", "Married", "Widowed"]} />
                <Input label="Contact Number" name="contact_number" value={formData.contact_number} onChange={handleChange} />
                <Input label="Email Address" name="email_address" value={formData.email_address} onChange={handleChange} />
                <Input label="Address" name="address" value={formData.address} onChange={handleChange} />
              </div>
            </section>

            {/* Work Details */}
            <section>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Work Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Department" name="department" value={formData.department} onChange={handleChange} />
                <Input label="Designation" name="designation" value={formData.designation} onChange={handleChange} />
                <Input label="Manager" name="manager" value={formData.manager} onChange={handleChange} />
                <Input label="Date Hired" name="date_hired" type="date" value={formData.date_hired?.slice(0, 10)} onChange={handleChange} />
              </div>
            </section>

            {/* Government IDs */}
            <section>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Government IDs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="SSS" name="sss" value={formData.sss} onChange={handleChange} />
                <Input label="TIN" name="tin" value={formData.tin} onChange={handleChange} />
                <Input label="Pag-ibig" name="pagibig" value={formData.pagibig} onChange={handleChange} />
                <Input label="PhilHealth" name="philhealth" value={formData.philhealth} onChange={handleChange} />
              </div>
            </section>

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

// Reusable Inputs
const Input = ({ label, name, value, onChange, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
    />
  </div>
);

const Select = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-300 dark:bg-gray-700 dark:text-white dark:border-gray-600"
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

export default EditEmployeePage;
