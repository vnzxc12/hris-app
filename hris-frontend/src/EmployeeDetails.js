import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Tabs } from "./components/ui/Tabs";
import { Button } from "./components/ui/Button";
import Sidebar from "./Sidebar";
import defaultPhoto from "./assets/default-photo.jpg";
import { toast } from "react-toastify";

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [employee, setEmployee] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("");

  const API_URL = process.env.REACT_APP_API_URL;

useEffect(() => {
  const fetchEmployee = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/employees/${id}`);
      setEmployee(res.data);
    } catch (err) {
      console.error("Error fetching employee:", err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/employees/${id}/documents`);
      setDocuments(res.data);
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };

  fetchEmployee();
  fetchDocuments();
}, [id, API_URL]);


  const handleEdit = () => navigate(`/edit/${id}`);

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      axios
        .delete(`${API_URL}/employees/${id}`)
        .then(() => navigate("/"))
        .catch((err) => console.error("Delete error:", err));
    }
  };

  const handleUpload = async () => {
    if (!file || !category) {
      toast.error("Please select a file and category.");
      return;
    }

    const formData = new FormData();
    formData.append("document", file);
    formData.append("category", category);

    try {
      await axios.post(`${API_URL}/employees/${id}/documents/upload`, formData);
      toast.success("Document uploaded successfully.");
      setFile(null);
      setCategory("");
      const res = await axios.get(`${API_URL}/employees/${id}/documents`);
      setDocuments(res.data);
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload document.");
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await axios.delete(`${API_URL}/employees/documents/${docId}`);

      toast.success("Document deleted.");
      setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    } catch (err) {
      console.error("Delete document error:", err);
      toast.error("Failed to delete document.");
    }
  };

  if (!employee) return <div className="p-6">Loading employee details...</div>;

  const photoUrl = employee.photo_url || defaultPhoto;

  const documentsTab = (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">Select Category</option>
          <option value="Resume">Resume</option>
          <option value="Contract">Contract</option>
          <option value="ID">ID</option>
          <option value="Certificate">Certificate</option>
        </select>
        <button
          onClick={handleUpload}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          Upload
        </button>
      </div>

      <div>
        {documents.length === 0 ? (
          <p className="text-gray-500">No documents uploaded yet.</p>
        ) : (
          <ul className="divide-y">
            {documents.map((doc) => (
              <li key={doc.id} className="py-2 flex justify-between items-center">
                <div>
                  <p className="font-medium">{doc.file_name}</p>
                  <p className="text-sm text-gray-400">{doc.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-red-500 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-100">
      <Sidebar />

      <div className="flex-1 p-8 ml-64">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold font-spartan">Employee Profile</h1>
          {(user?.role === "admin" || Number(user?.employee_id) === Number(employee.id))
 && (
  <div className="space-x-4">
    <Button onClick={handleEdit}>Edit</Button>
    {user?.role === "admin" && (
      <Button variant="destructive" onClick={handleDelete}>Delete</Button>
    )}
  </div>
)}
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
          <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Personal Details</h3>
            <p><strong>Full Name:</strong> {employee.first_name} {employee.middle_name} {employee.last_name}</p>
            <p><strong>Gender:</strong> {employee.gender}</p>
            <p><strong>Marital Status:</strong> {employee.marital_status}</p>
            <p><strong>Email:</strong> {employee.email_address}</p>
            <p><strong>Contact Number:</strong> {employee.contact_number}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Work Details</h3>
            <p><strong>Department:</strong> {employee.department}</p>
            <p><strong>Designation:</strong> {employee.designation}</p>
            <p><strong>Date Hired:</strong> {employee.date_hired}</p>
            <p><strong>Manager:</strong> {employee.manager}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Government IDs</h3>
            <p><strong>SSS:</strong> {employee.sss}</p>
            <p><strong>TIN:</strong> {employee.tin}</p>
            <p><strong>Pag-ibig:</strong> {employee.pagibig}</p>
            <p><strong>Philhealth:</strong> {employee.philhealth}</p>
          </div>
      
          <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
           <h3 className="text-lg font-semibold mb-4">Pay Information</h3>
           <p><strong>Salary Type:</strong> {employee.salary_type}</p>
           <p><strong>Rate per Hour:</strong> ₱{employee.rate_per_hour}</p>
        </div>
  </div>

        {/* Tabs */}
        <div className="mt-10">
          <Tabs
            tabs={[
              { label: "Profile", content: <p>This is the Profile tab.</p> },
              { label: "Documents", content: documentsTab },
              { label: "Password", content: <p>Password change coming soon.</p> },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
