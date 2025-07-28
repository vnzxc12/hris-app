import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = "https://hris-backend-j9jw.onrender.com";
const FERN_COLOR = "#5DBB63";
const CLOUDINARY_UPLOAD_PRESET = 'your_upload_preset';
const CLOUDINARY_CLOUD_NAME = 'your_cloud_name';

function EmployeeDetail() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(undefined);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    axios.get(`${BASE_URL}/employees`)
      .then((res) => {
        const found = res.data.find((emp) => emp.id === parseInt(id));
        if (!found) {
          setEmployee(null);
          return;
        }
        setEmployee(found);
        setFormData(found);
        if (found?.photo_url) {
          setPreviewPhoto(found.photo_url);
        }
      })
      .catch((err) => {
        console.error("Error fetching employee:", err);
        setEmployee(null);
      });
  }, [id]);

  if (employee === null) return <div className="text-center mt-10">Employee not found.</div>;
  if (!employee) return <div className="text-center mt-10">Loading...</div>;

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataCloud = new FormData();
    formDataCloud.append('file', file);
    formDataCloud.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formDataCloud
      );
      const secureUrl = uploadRes.data.secure_url;

      await axios.post(`${BASE_URL}/employees/${id}/photo`, { photo_url: secureUrl });
      setPreviewPhoto(secureUrl);
    } catch (err) {
      console.error('Photo upload failed:', err);
      alert('Failed to upload photo');
    }
  };

  const handleDeletePhoto = () => {
    const confirmed = window.confirm("Are you sure you want to delete the photo?");
    if (!confirmed) return;

    axios.delete(`${BASE_URL}/employees/${id}/photo`)
      .then(() => {
        setPreviewPhoto(null);
      })
      .catch((err) => {
        console.error("Failed to delete photo:", err);
        alert("Failed to delete photo.");
      });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();

    const confirmed = window.confirm("Are you sure you want to save the changes?");
    if (!confirmed) return;

    axios.put(`${BASE_URL}/employees/${id}`, formData)
      .then(() => {
        setEmployee(formData);
        setIsEditOpen(false);
      })
      .catch((err) => console.error('Update failed:', err));
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow h-screen p-6">
        <h2 className="text-2xl font-bold mb-6" style={{ color: FERN_COLOR }}>HRIS Menu</h2>
        <ul className="space-y-4 text-gray-700">
          <li><Link to="/" className="hover:text-green-600">Dashboard</Link></li>
          <li><Link to="/employees" className="hover:text-green-600">Employee List</Link></li>
        </ul>
      </aside>

      <div className="flex-1 p-10 text-gray-800">
        <nav className="mb-4 text-sm text-gray-600">
          <Link to="/" className="hover:underline" style={{ color: FERN_COLOR }}>Home</Link> /{" "}
          <Link to="/employees" className="hover:underline" style={{ color: FERN_COLOR }}>Employees</Link> /{" "}
          <span className="font-semibold ml-1">{employee.name || `${employee.first_name} ${employee.last_name}`}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-6" style={{ color: FERN_COLOR }}>Employee Profile</h1>

        <div className="flex items-center gap-6 mb-8">
          <img
            src={previewPhoto || "https://via.placeholder.com/120"}
            alt="Employee"
            className="w-28 h-28 rounded-full border shadow object-cover"
          />
          <div>
            <h2 className="text-2xl font-semibold">{employee.name || `${employee.first_name} ${employee.last_name}`}</h2>
            <p className="text-gray-600">{employee.designation}</p>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="mt-2 text-sm"
            />
            {previewPhoto && (
              <button
                onClick={handleDeletePhoto}
                className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Delete Photo
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
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
        </div>

        <div className="text-right mt-6">
          <button
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            onClick={() => setIsEditOpen(true)}
          >
            Edit
          </button>
        </div>

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
    <div className="border rounded-lg p-6 bg-white shadow-sm">
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
          {[
            "first_name", "middle_name", "last_name", "contact_number",
            "email_address", "department", "designation", "manager",
            "sss", "tin", "pagibig", "philhealth", "address"
          ].map((field) => (
            <div key={field}>
              <label className="block font-medium capitalize">{field.replace("_", " ")}:</label>
              <input
                type="text"
                name={field}
                value={formData[field] || ""}
                onChange={handleEditChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          ))}

          <div>
            <label className="block font-medium">Gender:</label>
            <select
              name="gender"
              value={formData.gender || ""}
              onChange={handleEditChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div>
            <label className="block font-medium">Marital Status:</label>
            <select
              name="marital_status"
              value={formData.marital_status || ""}
              onChange={handleEditChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Select Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>

          <div>
            <label className="block font-medium">Date Hired:</label>
            <input
              type="date"
              name="date_hired"
              value={formData.date_hired || ""}
              onChange={handleEditChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div className="text-right space-x-2">
            <button
              type="button"
              className="px-4 py-2 rounded border"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmployeeDetail;
