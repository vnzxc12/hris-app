import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Tabs } from "./components/ui/Tabs";
import { Button } from "./components/ui/Button";
import Sidebar from "./Sidebar";
import defaultPhoto from "./assets/default-photo.jpg";

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/employees/${id}`);
        setEmployee(res.data);
      } catch (err) {
        console.error("Error fetching employee:", err);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleEdit = () => {
    navigate(`/edit/${id}`);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      axios
        .delete(`http://localhost:3001/employees/${id}`)
        .then(() => navigate("/"))
        .catch((err) => console.error("Delete error:", err));
    }
  };

  if (!employee) return <div className="p-6">Loading employee details...</div>;

  const photoUrl = employee.photo_url || defaultPhoto;

  return (
    <div className="flex bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-100">
      <Sidebar />

      <div className="flex-1 p-8 ml-64">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Employee Profile</h1>
          <div className="space-x-4">
            <Button onClick={handleEdit}>Edit</Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>

        {/* Profile Header */}
        <div className="flex items-center mb-10 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <img
            src={photoUrl}
            alt="Employee"
            className="w-36 h-36 object-cover rounded-full border-4 border-gray-300 mr-8"
          />
          <div>
            <h2 className="text-2xl font-semibold">
              {employee.first_name} {employee.last_name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{employee.designation}</p>
            <p className="text-gray-500 dark:text-gray-500">{employee.department}</p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Details */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Personal Details</h3>
            <p><strong>Full Name:</strong> {employee.first_name} {employee.middle_name} {employee.last_name}</p>
            <p><strong>Gender:</strong> {employee.gender}</p>
            <p><strong>Marital Status:</strong> {employee.marital_status}</p>
            <p><strong>Email:</strong> {employee.email}</p>
            <p><strong>Contact Number:</strong> {employee.contact_number}</p>
          </div>

          {/* Work Details */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Work Details</h3>
            <p><strong>Department:</strong> {employee.department}</p>
            <p><strong>Designation:</strong> {employee.designation}</p>
            <p><strong>Date Hired:</strong> {employee.date_hired}</p>
            <p><strong>Manager:</strong> {employee.manager}</p>
          </div>

          {/* Government IDs */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Government IDs</h3>
            <p><strong>SSS:</strong> {employee.sss}</p>
            <p><strong>TIN:</strong> {employee.tin}</p>
            <p><strong>Pag-ibig:</strong> {employee.pagibig}</p>
            <p><strong>Philhealth:</strong> {employee.philhealth}</p>
          </div>
        </div>

        {/* Tabs Placeholder */}
        <div className="mt-10">
          <Tabs
            tabs={[
              { label: "Profile", content: <p>This is the Profile tab.</p> },
              { label: "Documents", content: <p>Documents feature coming soon.</p> },
              { label: "Password", content: <p>Password change coming soon.</p> },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
