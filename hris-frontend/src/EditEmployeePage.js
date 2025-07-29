// src/EditEmployeePage.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "https://hris-backend-j9jw.onrender.com"; // Change to your actual backend URL

const EditEmployeePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    marital_status: "",
    contact_number: "",
    email: "",
    department: "",
    designation: "",
    manager: "",
    sss: "",
    tin: "",
    pagibig: "",
    philhealth: "",
  });

  useEffect(() => {
    axios.get(`${API_URL}/employees/${id}`)
      .then((res) => setEmployee(res.data))
      .catch((err) => console.error("Error fetching employee:", err));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee({ ...employee, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`${API_URL}/employees/${id}`, employee)
      .then(() => {
        toast.success("Employee updated successfully!");
        setTimeout(() => navigate(`/employee/${id}`), 1000);
      })
      .catch((error) => {
        console.error("Error updating employee:", error);
        toast.error("Failed to update employee");
      });
  };

  const Section = ({ title, children }) => (
    <div className="bg-white shadow-md rounded-2xl p-6 mb-6 dark:bg-gray-800">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-sm">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-700 dark:text-white">Edit Employee</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Section title="Personal Details">
            <Input label="First Name" name="first_name" value={employee.first_name} onChange={handleChange} />
            <Input label="Middle Name" name="middle_name" value={employee.middle_name} onChange={handleChange} />
            <Input label="Last Name" name="last_name" value={employee.last_name} onChange={handleChange} />
            <Input label="Gender" name="gender" value={employee.gender} onChange={handleChange} />
            <Input label="Marital Status" name="marital_status" value={employee.marital_status} onChange={handleChange} />
            <Input label="Contact Number" name="contact_number" value={employee.contact_number} onChange={handleChange} />
            <Input label="Email" name="email" value={employee.email} onChange={handleChange} />
          </Section>

          <Section title="Work Details">
            <Input label="Department" name="department" value={employee.department} onChange={handleChange} />
            <Input label="Designation" name="designation" value={employee.designation} onChange={handleChange} />
            <Input label="Manager" name="manager" value={employee.manager} onChange={handleChange} />
          </Section>

          <Section title="Government IDs">
            <Input label="SSS" name="sss" value={employee.sss} onChange={handleChange} />
            <Input label="TIN" name="tin" value={employee.tin} onChange={handleChange} />
            <Input label="Pag-ibig" name="pagibig" value={employee.pagibig} onChange={handleChange} />
            <Input label="PhilHealth" name="philhealth" value={employee.philhealth} onChange={handleChange} />
          </Section>

          <div className="text-right">
            <button type="submit" className="bg-fern text-white px-6 py-2 rounded-xl hover:bg-green-600 transition">
              Save
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

const Input = ({ label, name, value, onChange }) => (
  <div>
    <label htmlFor={name} className="block text-gray-600 dark:text-gray-300 font-medium mb-1">
      {label}
    </label>
    <input
      id={name}
      name={name}
      value={value || ""}
      onChange={onChange}
      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-fern focus:border-fern dark:bg-gray-700 dark:text-white"
    />
  </div>
);

export default EditEmployeePage;
