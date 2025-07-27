import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = "https://hris-backend-production.up.railway.app";

function EmployeeDetail() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    axios.get(`${BASE_URL}/employees`)
      .then((res) => {
        const found = res.data.find((emp) => emp.id === parseInt(id));
        setEmployee(found);
        setFormData(found);
        if (found?.photo_url) {
          setPreviewPhoto(`${BASE_URL}/${found.photo_url}`);
        }
      })
      .catch((err) => console.error("Error fetching employee:", err));
  }, [id]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const photoData = new FormData();
    photoData.append('photo', file);

    axios.post(`${BASE_URL}/employees/${id}/photo`, photoData)
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
    const confirmed = window.confirm("Are you sure you want to save the changes?");
    if (!confirmed) return;

    axios.put(`${BASE_URL}/employees/${id}`, formData)
      .then(() => {
        setEmployee(formData);
        setIsEditOpen(false);
      })
      .catch((err) => console.error('Update failed:', err));
  };

  if (!employee) return <div className="text-center mt-10">Loading...</div>;

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

      {/* Main Content */}
      <div className="flex-1 p-10 text-gray-800">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm text-gray-600">
          <Link to="/" className="hover:underline text-fern">Home</Link> / 
          <Link to="/employees" className="hover:underline text-fern ml-1">Employees</Link> / 
          <span className="text-gray-800 font-semibold ml-1">{employee.name}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-6 text-fern">Employee Profile</h1>

        {/* Photo and Upload */}
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

        {/* Edit Modal */}
        {isEditOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-lg overflow-y-auto max-h-[90vh]">
              <h2 className="text-xl font-bold mb-4">Edit Employee</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                {["first_name", "middle_name", "last_name"].map((field) => (
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

                {/* Gender dropdown */}
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
                  <label className="block font-medium">Contact Number:</label>
                  <input
                    type="text"
                    name="contact_number"
                    value={formData.contact_number || ""}
                    onChange={handleEditChange}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block font-medium">Email Address:</label>
                  <input
                    type="email"
                    name="email_address"
                    value={formData.email_address || ""}
                    onChange={handleEditChange}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>

                {/* Marital Status dropdown */}
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

                {/* Department, Designation, Manager */}
                {["department", "designation", "manager"].map((field) => (
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

                {/* Date Hired */}
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

                {/* Government IDs */}
                {["sss", "tin", "pagibig", "philhealth"].map((field) => (
                  <div key={field}>
                    <label className="block font-medium capitalize">{field.toUpperCase()}:</label>
                    <input
                      type="text"
                      name={field}
                      value={formData[field] || ""}
                      onChange={handleEditChange}
                      className="w-full border px-3 py-2 rounded"
                    />
                  </div>
                ))}

                <div className="text-right space-x-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded border"
                    onClick={() => setIsEditOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-fern text-white px-4 py-2 rounded hover:bg-fern/80"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
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

export default EmployeeDetail;
