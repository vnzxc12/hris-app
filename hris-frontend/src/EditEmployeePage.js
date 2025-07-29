import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const API_URL = "http://localhost:3001"; // change if needed

const EditEmployeePage = () => {
  const { id } = useParams();
    const [employee, setEmployee] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    marital_status: "",
    designation: "",
    department: "",
    manager: "",
    sss: "",
    tin: "",
    pagibig: "",
    philhealth: "",
    contact_number: "",
    email_address: "",
    address: "",
    date_hired: "",
  });

  useEffect(() => {
    axios.get(`${API_URL}/employees/${id}`)
      .then((res) => setEmployee(res.data))
      .catch((err) => {
        console.error("Error fetching employee:", err);
        toast.error("Failed to fetch employee data");
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/employees/${id}`, employee);
      toast.success("Employee details saved successfully!");
    } catch (err) {
      console.error("Error updating employee:", err);
      toast.error("Failed to save employee details");
    }
  };

  const sectionStyle = "bg-white dark:bg-gray-800 p-4 rounded shadow mb-4";
  const labelStyle = "block text-sm font-medium text-gray-700 dark:text-gray-300";
  const inputStyle = "mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:text-white";

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white p-6">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-6">Edit Employee</h1>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Personal Details */}
        <div className={sectionStyle}>
          <h2 className="text-lg font-semibold mb-4">Personal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelStyle}>First Name</label>
              <input type="text" name="first_name" value={employee.first_name} onChange={handleChange} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Middle Name</label>
              <input type="text" name="middle_name" value={employee.middle_name} onChange={handleChange} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Last Name</label>
              <input type="text" name="last_name" value={employee.last_name} onChange={handleChange} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Gender</label>
              <select name="gender" value={employee.gender} onChange={handleChange} className={inputStyle}>
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div>
              <label className={labelStyle}>Marital Status</label>
              <select name="marital_status" value={employee.marital_status} onChange={handleChange} className={inputStyle}>
                <option value="">Select Status</option>
                <option>Single</option>
                <option>Married</option>
                <option>Widowed</option>
              </select>
            </div>
            <div>
              <label className={labelStyle}>Contact Number</label>
              <input type="text" name="contact_number" value={employee.contact_number} onChange={handleChange} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Email Address</label>
              <input type="email" name="email_address" value={employee.email_address} onChange={handleChange} className={inputStyle} />
            </div>
            <div className="md:col-span-2">
              <label className={labelStyle}>Address</label>
              <input type="text" name="address" value={employee.address} onChange={handleChange} className={inputStyle} />
            </div>
          </div>
        </div>

        {/* Work Details */}
        <div className={sectionStyle}>
          <h2 className="text-lg font-semibold mb-4">Work Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelStyle}>Department</label>
              <input type="text" name="department" value={employee.department} onChange={handleChange} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Designation</label>
              <input type="text" name="designation" value={employee.designation} onChange={handleChange} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Manager</label>
              <input type="text" name="manager" value={employee.manager} onChange={handleChange} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Date Hired</label>
              <input type="date" name="date_hired" value={employee.date_hired?.split("T")[0]} onChange={handleChange} className={inputStyle} />
            </div>
          </div>
        </div>

        {/* Government IDs */}
        <div className={sectionStyle}>
          <h2 className="text-lg font-semibold mb-4">Government IDs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelStyle}>SSS</label>
              <input type="text" name="sss" value={employee.sss} onChange={handleChange} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>TIN</label>
              <input type="text" name="tin" value={employee.tin} onChange={handleChange} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Pag-IBIG</label>
              <input type="text" name="pagibig" value={employee.pagibig} onChange={handleChange} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>PhilHealth</label>
              <input type="text" name="philhealth" value={employee.philhealth} onChange={handleChange} className={inputStyle} />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="text-right">
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEmployeePage;
