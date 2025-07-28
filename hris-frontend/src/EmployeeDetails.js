import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = "https://hris-backend-j9jw.onrender.com";
const CLOUDINARY_UPLOAD_PRESET = 'Documents';
const CLOUDINARY_CLOUD_NAME = 'ddsrdiqex';
const FERN_COLOR = "#5DBB63";

const getDownloadLink = (url, fileName = "downloaded-file") => {
  try {
    const urlObj = new URL(url);
    const base = url.split("/upload/")[0];
    const path = url.split("/upload/")[1];
    return `${base}/upload/fl_attachment:${fileName}/${path}`;
  } catch {
    return url;
  }
};

// Add this function near the top of your file (below getDownloadLink is fine)
const downloadFile = async (url, filename) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Download failed", error);
    alert("Failed to download file.");
  }
};


function EmployeeDetail() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [formData, setFormData] = useState({});
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [tab, setTab] = useState("profile");
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [docCategory, setDocCategory] = useState("Resume");

  useEffect(() => {
    axios.get(`${BASE_URL}/employees`)
      .then(res => {
        const found = res.data.find(emp => emp.id === parseInt(id));
        setEmployee(found);
        setFormData(found);
        if (found?.photo_url) {
          setPreviewPhoto(found.photo_url);
        }
      });

    axios.get(`${BASE_URL}/employees/${id}/documents`)
      .then(res => setDocuments(res.data))
      .catch(err => console.error("Failed to fetch documents", err));
  }, [id]);

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
    } catch (err) {
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
  backendForm.append("document", file); // 🔑 MUST match multer field name
  backendForm.append("category", docCategory);

  try {
    await axios.post(`${BASE_URL}/employees/${id}/documents/upload`, backendForm, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    const newDocs = await axios.get(`${BASE_URL}/employees/${id}/documents`);
    setDocuments(newDocs.data);
  } catch (err) {
    console.error(err);
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
    } catch (err) {
      alert("Failed to delete document.");
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
          <img
            src={previewPhoto || "https://via.placeholder.com/120"}
            alt="Employee"
            className="w-28 h-28 rounded-full border shadow object-cover"
          />
          <div>
            <h2 className="text-2xl font-semibold">{employee.name || `${employee.first_name} ${employee.last_name}`}</h2>
            <p className="text-gray-600">{employee.designation}</p>
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="mt-2 text-sm" />
            {previewPhoto && (
              <button onClick={handleDeletePhoto} className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                Delete Photo
              </button>
            )}
          </div>
        </div>

        {tab === "profile" && (
          <>
            <Section title="Personal Details" data={[
              { label: "First Name", value: employee.first_name },
              { label: "Middle Name", value: employee.middle_name },
              { label: "Last Name", value: employee.last_name },
              { label: "Gender", value: employee.gender },
              { label: "Marital Status", value: employee.marital_status },
              { label: "Contact Number", value: employee.contact_number },
              { label: "Email Address", value: employee.email_address },
              { label: "Address", value: employee.address }
            ]} />

            <Section title="Work Details" data={[
              { label: "Department", value: employee.department },
              { label: "Designation", value: employee.designation },
              { label: "Manager", value: employee.manager },
              { label: "Date Hired", value: employee.date_hired }
            ]} />

            <Section title="Government IDs" data={[
              { label: "SSS", value: employee.sss },
              { label: "TIN", value: employee.tin },
              { label: "Pag-ibig", value: employee.pagibig },
              { label: "Philhealth", value: employee.philhealth }
            ]} />

            <div className="text-right mt-6">
              <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700" onClick={() => setIsEditOpen(true)}>Edit</button>
            </div>
          </>
        )}

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
            
            <pre className="bg-gray-100 p-2 text-xs overflow-x-auto text-black">
  {JSON.stringify(documents, null, 2)}
</pre>

            <h3 className="text-lg font-semibold mt-6 mb-2">Uploaded Documents</h3>
<ul className="space-y-2">
  {documents.length > 0 ? (
    documents.map((doc) => {
      const documentName = doc?.file_name || "Unnamed";
      const documentCategory = doc?.category || "Uncategorized";
      const documentURL = doc?.file_url || "#";
      const docId = doc?.id;

      const forceDownloadUrl = (() => {
        try {
          const urlParts = documentURL.split("/upload/");
          return `${urlParts[0]}/upload/fl_attachment:${encodeURIComponent(documentName)}/${urlParts[1]}`;
        } catch {
          return documentURL;
        }
      })();

      return (
        <li key={docId || Math.random()} className="flex justify-between items-center border-b py-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <a
              href={documentURL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {documentName}
            </a>
            <span className="text-sm text-gray-500">({documentCategory})</span>
          </div>
          <div className="flex gap-2">
            <a
              href={forceDownloadUrl}
              download
              className="text-green-600 hover:underline text-sm"
              title="Download file"
            >
              Download
            </a>
            <button
              onClick={() => handleDeleteDocument(docId)}
              className="text-red-600 hover:underline text-sm"
              title="Delete file"
            >
              Delete
            </button>
          </div>
        </li>
      );
    })
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
      </div>
    </div>
  );
}

function Section({ title, data }) {
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm mb-6">
      <h3 className="text-xl font-semibold mb-4" style={{ color: FERN_COLOR }}>{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.map((item, idx) => (
          <p key={idx}><strong>{item.label}:</strong> {item.value || "-"}</p>
        ))}
      </div>
    </div>
  );
}

function EditModal({ formData, handleEditChange, handleEditSubmit, closeModal }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-lg overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4">Edit Employee</h2>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {["first_name", "middle_name", "last_name", "contact_number", "email_address", "department", "designation", "manager", "sss", "tin", "pagibig", "philhealth", "address"].map((field) => (
            <div key={field}>
              <label className="block font-medium capitalize">{field.replace("_", " ")}:</label>
              <input type="text" name={field} value={formData[field] || ""} onChange={handleEditChange} className="w-full border px-3 py-2 rounded" />
            </div>
          ))}
          <div>
            <label className="block font-medium">Gender:</label>
            <select name="gender" value={formData.gender || ""} onChange={handleEditChange} className="w-full border px-3 py-2 rounded">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Others">Others</option>
            </select>
          </div>
          <div>
            <label className="block font-medium">Marital Status:</label>
            <select name="marital_status" value={formData.marital_status || ""} onChange={handleEditChange} className="w-full border px-3 py-2 rounded">
              <option value="">Select Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>
          <div>
            <label className="block font-medium">Date Hired:</label>
            <input type="date" name="date_hired" value={formData.date_hired || ""} onChange={handleEditChange} className="w-full border px-3 py-2 rounded" />
          </div>
          <div className="text-right space-x-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 rounded border">Cancel</button>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmployeeDetail;
