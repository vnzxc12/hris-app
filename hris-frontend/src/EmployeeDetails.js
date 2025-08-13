import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Tabs } from "./components/ui/Tabs";
import { Button } from "./components/ui/Button";
import Sidebar from "./Sidebar";
import defaultPhoto from "./assets/default-photo.jpg";
import { toast } from "react-toastify";
import PersonalDetailsTab from "./components/PersonalDetailsTab.js";
import JobDetailsTab from './components/JobDetailsTab';
import AssetsTab from "./components/AssetsTab";
import PayslipTab from "./components/PayslipTab";


import { FaFolderOpen, FaIdCard, FaPhoneAlt , FaGraduationCap } from "react-icons/fa";

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [employee, setEmployee] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("");
  const [trainings, setTrainings] = useState([]);
  const [trainingName, setTrainingName] = useState("");
  const [trainingDate, setTrainingDate] = useState("");

  const API_URL = process.env.REACT_APP_API_URL;

 useEffect(() => {
  if (employee && employee.id) {
    fetchTrainings();
  }
}, [employee]);

const DetailField = ({ label, value }) => (
  <div className="mb-3">
    <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
    <div className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm text-gray-900 dark:text-white">
      {value || "—"}
    </div>
  </div>
);

const fetchTrainings = async () => {
  try {
    const res = await axios.get(`${API_URL}/trainings/employee/${employee.id}`);
    setTrainings(res.data);
  } catch (err) {
    console.error("Failed to fetch trainings:", err);
  }
};

const handleAddTraining = async (e) => {
  e.preventDefault();
  try {
    await axios.post(`${API_URL}/trainings`, {
      employee_id: employee.id,
      training_name: trainingName,
      training_date: trainingDate,
    });
    setTrainingName("");
    setTrainingDate("");
    fetchTrainings();
  } catch (err) {
    console.error("Failed to add training:", err);
  }
};

const handleDeleteTraining = async (id) => {
  try {
    await axios.delete(`${API_URL}/trainings/${id}`);
    fetchTrainings();
  } catch (err) {
    console.error("Failed to delete training:", err);
  }
};
  
                          // DOCUMENTS //
useEffect(() => {
  const fetchEmployee = async () => {
    try {
      const res = await axios.get(`${API_URL}/employees/${id}`);
      setEmployee(res.data);
    } catch (err) {
      console.error("Error fetching employee:", err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token"); // get fresh token here
      if (!token) throw new Error("No token found");

      const res = await axios.get(`${API_URL}/documents/${id}/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  const token = localStorage.getItem("token");
  if (!token) {
    toast.error("Not authorized. Please login.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);

  try {
    await axios.post(`${API_URL}/documents/${id}/documents`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      }
    });
    toast.success("Document uploaded successfully.");
    setFile(null);
    setCategory("");

    // Re-fetch documents with fresh token
    const res = await axios.get(`${API_URL}/documents/${id}/documents`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setDocuments(res.data);
  } catch (err) {
    console.error("Upload error:", err);
    toast.error("Failed to upload document.");
  }
};

const handleDeleteDocument = async (docId) => {
  if (!window.confirm("Delete this document?")) return;

  const token = localStorage.getItem("token");
  if (!token) {
    toast.error("Not authorized. Please login.");
    return;
  }

  try {
    await axios.delete(`${API_URL}/documents/${id}/documents/${docId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

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
             className="bg-[#6a8932] text-white px-4 py-2 rounded"
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
          <h1 className="text-3xl font-bold mb-6 text-[#6a8932]">Employee Profile</h1>
          {(user?.role === "admin" || Number(user?.employee_id) === Number(employee.id))
 && (
  <div className="space-x-4">
    <Button variant="green" onClick={handleEdit}>
  Edit
</Button>
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
            <p className="text-gray-500 dark:text-gray-500">{employee.status}</p>
          </div>
        </div>

  {/*=====================================TABS CODE START HERE==============================*/}

        <div className="mt-10">

          {/* Personal Profile Tabs */}

          <Tabs
  tabs={[
    {
      label: "Personal Profile",
      content: <PersonalDetailsTab employee={employee} />,
    },
    
    
              {
   label: "Job Details",
   content: <JobDetailsTab employee={employee} user={user} />
},

{
  label: "Documents",
  content: (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="bg-white shadow rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-olivegreen">
          <FaFolderOpen className="text-olivegreen" />
          Documents
        </h3>

        {documentsTab} {/* 👈 this renders the full upload form and files */}
      </div>
    </div>
  )
},


{
  label: "Emergency",
  content: (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emergency Contact */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-olivegreen">
          <FaPhoneAlt  className="text-olivegreen" />Emergency Contact</h3>
                <DetailField label="Name" value={employee.emergency_contact_name} />
  <DetailField label="Relationship" value={employee.emergency_contact_relationship} />
  <DetailField label="Phone" value={employee.emergency_contact_phone} />
  <DetailField label="Email" value={employee.emergency_contact_email} />
  <DetailField label="Address" value={employee.emergency_contact_address} />
              </div> </div>
      </div>
    
  )
},

{
  label: "Assets",
  content: employee && user ? (
    <AssetsTab employee={employee} user={user} />
  ) : (
    <p>Loading assets...</p>
  ),
},
{
  label: "Payslips",
  content: <PayslipTab employeeId={employee.id} />
},


          // TRAINING TAB HERE //
{
  label: "Training",
  content: (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="bg-white shadow rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-olivegreen">
          <FaGraduationCap className="text-olivegreen" />Trainings</h3>

        {/* Add Training Form */}
        <form
          onSubmit={handleAddTraining}
          className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <input
            type="text"
            placeholder="Training Name"
            value={trainingName}
            onChange={(e) => setTrainingName(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <input
            type="date"
            value={trainingDate}
            onChange={(e) => setTrainingDate(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <button
            type="submit"
            className="bg-[#6a8932] text-white px-4 py-2 rounded"
          >
            Add Training
          </button>
        </form>

        {/* List of Trainings */}
        {trainings.length === 0 ? (
          <p className="text-gray-600">No trainings found.</p>
        ) : (
          <ul className="space-y-2">
            {trainings.map((t) => (
              <li
                key={t.id}
                className="flex justify-between items-center border p-2 rounded"
              >
                <div>
                  <p className="font-medium">{t.training_name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(t.training_date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteTraining(t.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

           
            ]}
          />
        </div>
        

        
      </div>
    </div>
  );
};

export default EmployeeDetails;