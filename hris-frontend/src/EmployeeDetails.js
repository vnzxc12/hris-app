import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'https://hris-backend-j9jw.onrender.com';

function EmployeeDetail() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    axios.get(`${API_BASE_URL}/employees`)
      .then((res) => {
        const found = res.data.find((emp) => emp.id === parseInt(id));
        if (found) {
          setEmployee(found);
          setFormData(found);
          if (found.photo_url) {
            setPreviewPhoto(`${API_BASE_URL}${found.photo_url}`);
          }
        }
      })
      .catch((err) => console.error("Error fetching employee:", err));
  }, [id]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const photoData = new FormData();
    photoData.append('photo', file);

    axios.post(`${API_BASE_URL}/employees/${id}/photo`, photoData)
      .then(() => {
        setPreviewPhoto(URL.createObjectURL(file));
      })
      .catch((err) => console.error('Photo upload failed:', err));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to save the changes?")) return;

    axios.put(`${API_BASE_URL}/employees/${id}`, formData)
      .then(() => {
        setEmployee(formData);
        setIsEditOpen(false);
      })
      .catch((err) => console.error('Update failed:', err));
  };

  if (!employee) return <div className="text-center mt-10">Loading or employee not found...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow h-screen p-6">
        <h2 className="text-2xl font-bold text-fern mb-6">HRIS Menu</h2>
        <ul className="space-y-4 text-gray-700">
          <li><Link to="/" className="hover:text-fern">Dashboard</Link></li>
          <li><Link to="/employees" className="hover:text-fern">Employee List</Link></li>
        </ul>
      </aside>

      {/* Main */}
      <main className="flex-1 p-10 text-gray-800">
        <nav className="mb-4 text-sm text-gray-600">
          <Link to="/" className="hover:underline text-fern">Home</Link> / 
          <Link to="/employees" className="hover:underline text-fern ml-1">Employees</Link> / 
          <span className="text-gray-800 font-semibold ml-1">{employee.name}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-6 text-fern">Employee Profile</h1>

        {/* Photo */}
        <div className="flex items-center gap-6 mb-8">
          <img
            src={previewPhoto || "https://via.placeholder.com/120"}
            alt="Employee"
            className="w-28 h-28 rounded-full border shadow object-cover"
          />
          <div>
            <h2 className="text-2xl font-semibold">{employee.name}</h2>
            <p className="text-gray-600">{employee.designation}</p>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="mt-2 text-sm"
            />
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          <Section title="Personal Details" data={[
            { label: "First Name", value: employee.first_name },
            { label: "Middle Name", value: employee.middle_name },
            { label: "Last Name", value: employee.last_name },
            { label: "Gender", value: employee.gender },
            { label: "Marital Status", value: employee.marital_status },
            { label: "Contact Number", value: employee.contact_number },
            { label: "Email Address", value: employee.email_address }
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

        {/* Edit Button */}
        <div className="text-right mt-6">
          <button
            className="bg-fern text-white px-6 py-2 rounded hover:bg-fern/80"
            onClick={() => setIsEditOpen(true)}
          >
            Edit
          </button>
        </div>

        {/* Modal */}
        {isEditOpen && (
          <EditModal
            formData={formData}
            handleChange={handleEditChange}
            handleSubmit={handleEditSubmit}
            onClose={() => setIsEditOpen(false)}
          />
        )}
      </main>
    </div>
  );
}

function Section({ title, data }) {
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h3 className="text-xl font-semibold text-fern mb-4">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.map((item, idx) => (
          <p key={idx}><strong>{item.label}:</strong> {item.value}</p>
        ))}
      </div>
    </div>
  );
}

function EditModal({ formData, handleChange, handleSubmit, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-lg overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4">Edit Employee</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {["first_name", "middle_name", "last_name"].map((field) => (
            <InputField key={field} label={field} value={formData[field]} onChange={handleChange} />
          ))}

          <Dropdown label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={["Male", "Female", "Others"]} />
          <InputField label="Contact Number" value={formData.contact_number} onChange={handleChange} />
          <InputField label="Email Address" value={formData.email_address} onChange={handleChange} type="email" />
          <Dropdown label="Marital Status" name="marital_status" value={formData.marital_status} onChange={handleChange} options={["Single", "Married", "Widowed"]} />

          {["department", "designation", "manager"].map((field) => (
            <InputField key={field} label={field} value={formData[field]} onChange={handleChange} />
          ))}

          <InputField label="Date Hired" value={formData.date_hired} onChange={handleChange} type="date" />

          {["sss", "tin", "pagibig", "philhealth"].map((field) => (
            <InputField key={field} label={field.toUpperCase()} value={formData[field]} onChange={handleChange} />
          ))}

          <div className="text-right space-x-2">
            <button type="button" className="px-4 py-2 rounded border" onClick={onClose}>Cancel</button>
            <button type="submit" className="bg-fern text-white px-4 py-2 rounded hover:bg-fern/80">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block font-medium capitalize">{label.replace("_", " ")}:</label>
      <input
        type={type}
        name={label}
        value={value || ""}
        onChange={onChange}
        className="w-full border px-3 py-2 rounded"
      />
    </div>
  );
}

function Dropdown({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="block font-medium">{label}:</label>
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full border px-3 py-2 rounded"
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

export default EmployeeDetail;
