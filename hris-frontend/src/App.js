import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const BASE_URL = process.env.REACT_APP_API_URL || "https://hris-backend-production.up.railway.app";

function App() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    marital_status: "",
    designation: "",
    manager: "",
    sss: "",
    tin: "",
    pagibig: "",
    philhealth: "",
    contact_number: "",
    email_address: "",
    department: "",
    date_hired: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const filtered = employees.filter(emp => {
      const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    });
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/employees`);
      setEmployees(res.data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation example
    if (!formData.first_name || !formData.last_name) {
      alert("First and Last Name are required.");
      return;
    }

    const data = new FormData();
    for (let key in formData) {
      data.append(key, formData[key]);
    }
    if (photo) data.append("photo", photo);

    try {
      await axios.post(`${BASE_URL}/employees`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchEmployees();
      setShowModal(false);
      setFormData({
        first_name: "",
        middle_name: "",
        last_name: "",
        gender: "",
        marital_status: "",
        designation: "",
        manager: "",
        sss: "",
        tin: "",
        pagibig: "",
        philhealth: "",
        contact_number: "",
        email_address: "",
        department: "",
        date_hired: "",
      });
      setPhoto(null);
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to add employee.");
    }
  };

  const handleRowClick = (id) => {
    navigate(`/employee/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-calibri">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-fern-green">HRIS Dashboard</h1>

        <input
          type="search"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded p-2 max-w-sm w-full"
        />

        <button
          onClick={() => setShowModal(true)}
          className="bg-fern-green hover:bg-green-700 text-white px-6 py-2 rounded shadow"
        >
          Add Employee
        </button>
      </div>

      {/* Employee Table */}
      <div className="overflow-x-auto bg-white rounded shadow-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-200 font-semibold text-gray-700">
            <tr>
              <th className="p-3 text-left">Photo</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Designation</th>
              <th className="p-3 text-left">Date Hired</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  No employees found.
                </td>
              </tr>
            ) : (
              filteredEmployees.map(emp => (
                <tr
                  key={emp.id}
                  onClick={() => handleRowClick(emp.id)}
                  className="hover:bg-gray-100 cursor-pointer border-b transition duration-150"
                >
                  <td className="p-3">
                    {emp.photo_url ? (
                      <img
                        src={`${BASE_URL}/${emp.photo_url}`}
                        alt={`${emp.first_name} ${emp.last_name}`}
                        className="w-12 h-12 object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-gray-400 italic text-xs">No Photo</span>
                    )}
                  </td>
                  <td className="p-3 font-medium">{`${emp.first_name} ${emp.last_name}`}</td>
                  <td className="p-3">{emp.department || "N/A"}</td>
                  <td className="p-3">{emp.designation || "N/A"}</td>
                  <td className="p-3">
                    {emp.date_hired
                      ? format(new Date(emp.date_hired), "MMM dd, yyyy")
                      : "N/A"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-4xl max-h-[85vh] overflow-y-auto relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl font-bold"
              aria-label="Close"
            >
              &times;
            </button>

            <h2 className="text-2xl font-bold mb-4 text-fern-green">Add New Employee</h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Personal Details */}
              <fieldset className="border p-4 rounded col-span-2">
                <legend className="font-semibold mb-2">Personal Details</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    name="first_name"
                    placeholder="First Name *"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="border p-2 rounded"
                    required
                  />
                  <input
                    name="middle_name"
                    placeholder="Middle Name"
                    value={formData.middle_name}
                    onChange={handleInputChange}
                    className="border p-2 rounded"
                  />
                  <input
                    name="last_name"
                    placeholder="Last Name *"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="border p-2 rounded"
                    required
                  />
                  <input
                    name="gender"
                    placeholder="Gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="border p-2 rounded"
                  />
                  <select
                    name="marital_status"
                    value={formData.marital_status}
                    onChange={handleInputChange}
                    className="border p-2 rounded"
                  >
                    <option value="">Select Marital Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                  <input
                    name="contact_number"
                    placeholder="Contact Number"
                    value={formData.contact_number}
                    onChange={handleInputChange}
                    className="border p-2 rounded"
                    type="tel"
                  />
                  <input
                    name="email_address"
                    placeholder="Email Address"
                    value={formData.email_address}
                    onChange={handleInputChange}
                    className="border p-2 rounded"
                    type="email"
                  />
                </div>
              </fieldset>

              {/* Work Details */}
              <fieldset className="border p-4 rounded col-span-2">
                <legend className="font-semibold mb-2">Work Details</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    name="designation"
                    placeholder="Designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    className="border p-2 rounded"
                  />
                  <input
                    name="manager"
                    placeholder="Manager"
                    value={formData.manager}
                    onChange={handleInputChange}
                    className="border p-2 rounded"
                  />
                  <input
                    name="department"
                    placeholder="Department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="border p-2 rounded"
                  />
                  <input
                    type="date"
                    name="date_hired"
                    value={formData.date_hired}
                    onChange={handleInputChange}
                    className="border p-2 rounded"
                  />
                </div>
              </fieldset>

              {/* Government IDs */}
              <fieldset className="border p-4 rounded col-span-2">
                <legend className="font-semibold mb-2">Government IDs</legend>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    name="sss"
                    placeholder="SSS"
                    value={formData.sss}
                    onChange={handleInputChange}
                    className="border p-2 rounded"
                  />
                  <input
                    name="tin"
                    placeholder="TIN"
                    value={formData.tin}
                    onChange={handleInputChange}
                    className="border p-2 rounded"
                  />
                  <input
                    name="pagibig"
                    placeholder="Pag-ibig"
                    value={formData.pagibig}
                    onChange={handleInputChange}
                    className="border p-2 rounded"
                  />
                  <input
                    name="philhealth"
                    placeholder="Philhealth"
                    value={formData.philhealth}
                    onChange={handleInputChange}
                    className="border p-2 rounded"
                  />
                </div>
              </fieldset>

              {/* Photo Upload */}
              <div className="col-span-2">
                <label className="block mb-1 font-semibold">Upload Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="col-span-2 bg-fern-green hover:bg-green-700 text-white p-3 rounded font-semibold transition"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
