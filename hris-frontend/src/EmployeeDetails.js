// ... (top imports unchanged)
import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from "./AuthContext";

const BASE_URL = "https://hris-backend-j9jw.onrender.com";
const CLOUDINARY_UPLOAD_PRESET = 'Documents';
const CLOUDINARY_CLOUD_NAME = 'ddsrdiqex';
const FERN_COLOR = "#5DBB63";

function EmployeeDetails() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [formData, setFormData] = useState({});
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [tab, setTab] = useState("profile");
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [docCategory, setDocCategory] = useState("Resume");
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState("");

  const unauthorized = user?.role === "Employee" && user.employee_id !== Number(id);

  useEffect(() => {
    axios.get(`${BASE_URL}/employees`)
      .then(res => {
        const found = res.data.find(emp => emp.id === parseInt(id));
        setEmployee(found);
        setFormData(found);
        if (found?.photo_url) setPreviewPhoto(found.photo_url);
      });

    axios.get(`${BASE_URL}/employees/${id}/documents`)
      .then(res => setDocuments(res.data))
      .catch(err => console.error("Failed to fetch documents", err));
  }, [id]);

  if (unauthorized) return <Navigate to="/unauthorized" replace />;
  if (employee === null) return <div className="text-center mt-10">Loading...</div>;

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataCloud = new FormData();
    formDataCloud.append("file", file);
    formDataCloud.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formDataCloud
      );
      const secureUrl = uploadRes.data.secure_url;
      await axios.post(`${BASE_URL}/employees/${id}/photo`, { photo_url: secureUrl });
      setPreviewPhoto(secureUrl);
    } catch {
      alert("Failed to upload photo");
    }
  };

  const handleDeletePhoto = () => {
    if (window.confirm("Are you sure you want to delete the photo?")) {
      axios.delete(`${BASE_URL}/employees/${id}/photo`)
        .then(() => setPreviewPhoto(null));
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!window.confirm("Save changes?")) return;
    axios.put(`${BASE_URL}/employees/${id}`, formData)
      .then(() => {
        setEmployee(formData);
        setIsEditOpen(false);
      });
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const backendForm = new FormData();
    backendForm.append("document", file);
    backendForm.append("category", docCategory);

    try {
      await axios.post(`${BASE_URL}/employees/${id}/documents/upload`, backendForm, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const newDocs = await axios.get(`${BASE_URL}/employees/${id}/documents`);
      setDocuments(newDocs.data);
    } catch (err) {
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await axios.delete(`${BASE_URL}/employees/${id}/documents/${docId}`);
      const updated = await axios.get(`${BASE_URL}/employees/${id}/documents`);
      setDocuments(updated.data);
    } catch {
      alert("Failed to delete document.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = passwordData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return setPasswordError("All fields are required.");
    }

    if (newPassword !== confirmPassword) {
      return setPasswordError("New password and confirm password do not match.");
    }

    try {
      await axios.put(`${BASE_URL}/users/${id}/password`, { oldPassword, newPassword });
      alert("Password changed successfully.");
      setIsPasswordModalOpen(false);
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordError("");
    } catch (err) {
      setPasswordError(err.response?.data || "Failed to change password.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow h-screen p-6">
        <h2 className="text-2xl font-bold mb-6" style={{ color: FERN_COLOR }}>HRIS Menu</h2>
        <ul className="space-y-4 text-gray-700">
          <li><Link to="/" className="hover:text-green-600">Dashboard</Link></li>
          <li><Link to="/employees" className="hover:text-green-600">Employee List</Link></li>
        </ul>
        <hr className="my-6" />
        <ul className="space-y-2">
          <li><button className={`w-full text-left ${tab === "profile" ? 'text-green-700 font-bold' : ''}`} onClick={() => setTab("profile")}>Profile</button></li>
          <li><button className={`w-full text-left ${tab === "documents" ? 'text-green-700 font-bold' : ''}`} onClick={() => setTab("documents")}>Documents</button></li>
        </ul>
      </aside>

      <div className="flex-1 p-10 text-gray-800">
        <nav className="mb-4 text-sm text-gray-600">
          <Link to="/" className="hover:underline" style={{ color: FERN_COLOR }}>Home</Link> /{" "}
          <Link to="/employees" className="hover:underline" style={{ color: FERN_COLOR }}>Employees</Link> /{" "}
          <span className="font-semibold ml-1">{employee.name || `${employee.first_name} ${employee.last_name}`}</span>
        </nav>

        <div className="flex items-center gap-6 mb-8">
          <img src={previewPhoto || "https://via.placeholder.com/120"} alt="Employee" className="w-28 h-28 rounded-full border shadow object-cover" />
          <div>
            <h2 className="text-2xl font-semibold">{employee.name || `${employee.first_name} ${employee.last_name}`}</h2>
            <p className="text-gray-600">{employee.designation}</p>
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="mt-2 text-sm" />
            {previewPhoto && (
              <button onClick={handleDeletePhoto} className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                Delete Photo
              </button>
            )}
            {(user.role === "Employee" && user.employee_id === Number(id)) && (
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="mt-2 ml-3 px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
              >
                Change Password
              </button>
            )}
          </div>
        </div>

        {tab === "profile" && <ProfileTab employee={employee} setIsEditOpen={setIsEditOpen} />}
        {tab === "documents" && (
          <div className="bg-white shadow p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4" style={{ color: FERN_COLOR }}>Uploaded Documents</h3>
            <div className="flex items-center gap-2 mb-4">
              <select value={docCategory} onChange={(e) => setDocCategory(e.target.value)} className="border px-2 py-1 rounded">
                <option value="Resume">Resume</option>
                <option value="ID">ID</option>
                <option value="Certificate">Certificate</option>
                <option value="Other">Other</option>
              </select>
              <input type="file" onChange={handleDocumentUpload} />
            </div>
            {uploading && <p className="text-sm text-gray-500 mb-4">Uploading...</p>}

            <ul className="space-y-2">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <li key={doc.id} className="flex justify-between items-center border-b py-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
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
        )}

        {isEditOpen && (
          <EditModal
            formData={formData}
            handleEditChange={handleEditChange}
            handleEditSubmit={handleEditSubmit}
            closeModal={() => setIsEditOpen(false)}
          />
        )}

        {isPasswordModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Change Password</h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <input
                  type="password"
                  placeholder="Current Password"
                  className="w-full border px-3 py-2 rounded"
                  value={passwordData.oldPassword}
                  onChange={e => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                />
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full border px-3 py-2 rounded"
                  value={passwordData.newPassword}
                  onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  className="w-full border px-3 py-2 rounded"
                  value={passwordData.confirmPassword}
                  onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                />
                {passwordError && <p className="text-red-600 text-sm">{passwordError}</p>}
                <div className="text-right space-x-2">
                  <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default EmployeeDetails;
