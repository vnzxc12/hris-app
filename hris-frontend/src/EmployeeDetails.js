import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from "./AuthContext";

const BASE_URL = "https://hris-backend-j9jw.onrender.com";
const CLOUDINARY_UPLOAD_PRESET = 'Documents';
const CLOUDINARY_CLOUD_NAME = 'ddsrdiqex';
const FERN_COLOR = "#5DBB63";

function EmployeeDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [employee, setEmployee] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchEmployee();
    fetchDocuments();
  }, []);

  const fetchEmployee = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/employees/${id}`);
      setEmployee(res.data);
    } catch (error) {
      console.error("Error fetching employee:", error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/documents/${id}`);
      setDocuments(res.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !category) {
      alert("Please select a file and category.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const cloudRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
        formData
      );

      const newDoc = {
        employee_id: id,
        file_name: file.name,
        file_url: cloudRes.data.secure_url,
        file_type: file.name.split('.').pop(),
        category,
      };

      await axios.post(`${BASE_URL}/api/documents`, newDoc);
      setFile(null);
      setCategory("");
      fetchDocuments();
    } catch (error) {
      console.error("Error uploading document:", error);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await axios.delete(`${BASE_URL}/api/documents/${docId}`);
        fetchDocuments();
      } catch (error) {
        console.error("Error deleting document:", error);
      }
    }
  };

  const handlePasswordChange = async () => {
    try {
      await axios.put(`${BASE_URL}/api/users/${id}/password`, { password: newPassword });
      setSuccessMsg("Password updated successfully.");
      setNewPassword("");
      setIsPasswordModalOpen(false);
    } catch (error) {
      console.error("Error updating password:", error);
    }
  };

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="p-6 sm:ml-64">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md mt-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-700">Employee Details</h1>
          <div className="space-x-2">
            <Link
              to={`/employee/${id}/edit`}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
            >
              Edit
            </Link>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Edit Password
            </button>
          </div>
        </div>

        {employee ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-1">Personal Details</h3>
              <p><strong>First Name:</strong> {employee.first_name}</p>
              <p><strong>Last Name:</strong> {employee.last_name}</p>
              <p><strong>Middle Name:</strong> {employee.middle_name}</p>
              <p><strong>Gender:</strong> {employee.gender}</p>
              <p><strong>Marital Status:</strong> {employee.marital_status}</p>
              <p><strong>Contact Number:</strong> {employee.contact_number}</p>
              <p><strong>Email:</strong> {employee.email}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Work Details</h3>
              <p><strong>Designation:</strong> {employee.designation}</p>
              <p><strong>Department:</strong> {employee.department}</p>
              <p><strong>Manager:</strong> {employee.manager}</p>
              <p><strong>Date Hired:</strong> {employee.date_hired}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Government IDs</h3>
              <p><strong>SSS:</strong> {employee.sss}</p>
              <p><strong>TIN:</strong> {employee.tin}</p>
              <p><strong>Pag-ibig:</strong> {employee.pagibig}</p>
              <p><strong>PhilHealth:</strong> {employee.philhealth}</p>
            </div>
          </div>
        ) : (
          <p>Loading employee data...</p>
        )}

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Uploaded Documents</h2>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
            <input type="file" onChange={handleFileChange} />
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Document Category"
              className="border px-2 py-1 rounded w-52"
            />
            <button
              onClick={handleUpload}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Upload
            </button>
          </div>

          <ul className="space-y-2">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <li key={doc.id} className="flex justify-between items-center border-b py-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {doc.file_name}
                    </a>
                    <span className="text-sm text-gray-500">({doc.category})</span>
                  </div>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </li>
              ))
            ) : (
              <li className="text-gray-500 text-sm">No documents uploaded.</li>
            )}
          </ul>
        </div>

        {/* Password Change Modal */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
              <h2 className="text-lg font-bold mb-4">Change Password</h2>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border px-3 py-2 rounded mb-4"
              />
              <div className="text-right space-x-2">
                <button onClick={() => setIsPasswordModalOpen(false)} className="border px-4 py-2 rounded">
                  Cancel
                </button>
                <button onClick={handlePasswordChange} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
                  Save
                </button>
              </div>
              {successMsg && <p className="text-green-600 mt-2">{successMsg}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeDetails;
