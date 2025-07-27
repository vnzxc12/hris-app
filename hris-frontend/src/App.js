import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const BASE_URL = "https://hris-backend-production.up.railway.app";

function App() {
  const [employees, setEmployees] = useState([]);
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = () => {
    axios.get(`${BASE_URL}/employees`)
      .then((res) => {
        setEmployees(res.data);
      })
      .catch((err) => console.error("Fetch error:", err));
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
    const data = new FormData();
    for (let key in formData) {
      data.append(key, formData[key]);
    }
    if (photo) data.append("photo", photo);

    try {
      await axios.post(`${BASE_URL}/employees`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchEmployees();
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
    }
  };

  const handleRowClick = (id) => {
    navigate(`/employee/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-calibri">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-fern-green">HRIS Dashboard</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-fern-green hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Add Employee
        </button>
      </div>

      {/* Employee Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Photo</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Department</th>
              <th className="p-2 text-left">Designation</th>
              <th className="p-2 text-left">Date Hired</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr
                key={emp.id}
                onClick={() => handleRowClick(emp.id)}
                className="hover:bg-gray-100 cursor-pointer border-b"
              >
                <td className="p-2">
                  {emp.photo_url ? (
                    <img
                      src={`${BASE_URL}/${emp.photo_url}`}
                      alt="Employee"
                      className="w-12 h-12 object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-gray-400">No Photo</span>
                  )}
                </td>
                <td className="p-2">{`${emp.first_name} ${emp.last_name}`}</td>
                <td className="p-2">{emp.department}</td>
                <td className="p-2">{emp.designation}</td>
                <td className="p-2">{format(new Date(emp.date_hired), "MMM dd, yyyy")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-3xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Add New Employee</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-2">
              <input name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleInputChange} className="border p-2 rounded" required />
              <input name="middle_name" placeholder="Middle Name" value={formData.middle_name} onChange={handleInputChange} className="border p-2 rounded" />
              <input name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleInputChange} className="border p-2 rounded" required />
              <input name="gender" placeholder="Gender" value={formData.gender} onChange={handleInputChange} className="border p-2 rounded" />
              <select name="marital_status" value={formData.marital_status} onChange={handleInputChange} className="border p-2 rounded">
                <option value="">Select Marital Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
              </select>
              <input name="designation" placeholder="Designation" value={formData.designation} onChange={handleInputChange} className="border p-2 rounded" />
              <input name="manager" placeholder="Manager" value={formData.manager} onChange={handleInputChange} className="border p-2 rounded" />
              <input name="department" placeholder="Department" value={formData.department} onChange={handleInputChange} className="border p-2 rounded" />
              <input name="sss" placeholder="SSS" value={formData.sss} onChange={handleInputChange} className="border p-2 rounded" />
              <input name="tin" placeholder="TIN" value={formData.tin} onChange={handleInputChange} className="border p-2 rounded" />
              <input name="pagibig" placeholder="Pag-ibig" value={formData.pagibig} onChange={handleInputChange} className="border p-2 rounded" />
              <input name="philhealth" placeholder="Philhealth" value={formData.philhealth} onChange={handleInputChange} className="border p-2 rounded" />
              <input name="contact_number" placeholder="Contact Number" value={formData.contact_number} onChange={handleInputChange} className="border p-2 rounded" />
              <input name="email_address" placeholder="Email Address" value={formData.email_address} onChange={handleInputChange} className="border p-2 rounded" />
              <input type="date" name="date_hired" value={formData.date_hired} onChange={handleInputChange} className="border p-2 rounded" />
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="col-span-2" />
              <button type="submit" className="col-span-2 bg-fern-green hover:bg-green-700 text-white p-2 rounded">
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
