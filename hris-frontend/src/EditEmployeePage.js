import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "https://hris-backend-j9jw.onrender.com"; // Replace with your backend URL

const EditEmployeePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    marital_status: "",
    department: "",
    designation: "",
    manager: "",
    date_hired: "",
    sss: "",
    tin: "",
    pagibig: "",
    philhealth: "",
    contact_number: "",
    email: "",
  });

  useEffect(() => {
    axios.get(`${API_URL}/employees/${id}`)
      .then((res) => {
        setEmployee(res.data);
        setFormData(res.data);
      })
      .catch((err) => {
        console.error("Error fetching employee:", err);
        toast.error("Failed to load employee data.");
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/employees/${id}`, formData);
      toast.success("Employee updated successfully!");
      navigate(`/employees/${id}`);
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("Failed to update employee.");
    }
  };

  if (!employee) {
    return <div className="text-center py-20">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white dark:bg-gray-800 shadow-md rounded-xl p-8">
      <h2 className="text-2xl font-bold mb-6 text-center text-fern-600">Edit Employee</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          ["First Name", "first_name"],
          ["Middle Name", "middle_name"],
          ["Last Name", "last_name"],
          ["Gender", "gender"],
          ["Marital Status", "marital_status"],
          ["Department", "department"],
          ["Designation", "designation"],
          ["Manager", "manager"],
          ["Date Hired", "date_hired"],
          ["SSS", "sss"],
          ["TIN", "tin"],
          ["Pag-ibig", "pagibig"],
          ["Philhealth", "philhealth"],
          ["Contact Number", "contact_number"],
          ["Email", "email"],
        ].map(([label, name]) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{label}</label>
            <input
              type={name === "date_hired" ? "date" : "text"}
              name={name}
              value={formData[name] || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-fern-500 focus:border-fern-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        ))}
        <div className="col-span-2 flex justify-between mt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-fern-600 text-white rounded-lg hover:bg-fern-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEmployeePage;
