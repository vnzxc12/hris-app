import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PasswordManager from "./PasswordManager";
import Sidebar from './Sidebar';

const fern = "#5DBB63";
const BASE_URL = "https://hris-backend-j9jw.onrender.com"; // backend URL

function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Modal Form States
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");

  // Simulated logged-in user
  const currentUser = { role: "Admin", id: 1 }; // Replace with actual auth context or props

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = () => {
    axios
      .get(`${BASE_URL}/employees`)
      .then((res) => setEmployees(res.data))
      .catch((err) => {
        console.error("Fetch employees error:", err);
        toast.error("Failed to fetch employees");
      });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      axios
        .delete(`${BASE_URL}/employees/${id}`)
        .then(() => {
          toast.success("Employee deleted!");
          fetchEmployees();
        })
        .catch(() => toast.error("Delete failed."));
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    (emp.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const valueA = (a[sortBy] ?? "").toString().toLowerCase();
    const valueB = (b[sortBy] ?? "").toString().toLowerCase();
    return sortOrder === "asc"
      ? valueA.localeCompare(valueB)
      : valueB.localeCompare(valueA);
  });

  const employeesPerPage = 10;
  const totalPages = Math.ceil(sortedEmployees.length / employeesPerPage);
  const paginatedEmployees = sortedEmployees.slice(
    (currentPage - 1) * employeesPerPage,
    currentPage * employeesPerPage
  );

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    let photoUrl = "";

    if (photo) {
      const cloudData = new FormData();
      cloudData.append("file", photo);
      cloudData.append("upload_preset", "Photos"); // Cloudinary unsigned preset
      cloudData.append("cloud_name", "ddsrdiqex");

      try {
        const uploadRes = await axios.post(
          "https://api.cloudinary.com/v1_1/ddsrdiqex/image/upload",
          cloudData
        );
        photoUrl = uploadRes.data.secure_url;
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        toast.error("Photo upload failed");
        return;
      }
    }

    axios
      .post(`${BASE_URL}/employees`, {
        name,
        department,
        designation,
        photo_url: photoUrl,
      })
      .then(() => {
        toast.success("Employee added!");
        setShowModal(false);
        fetchEmployees();
        setName("");
        setDepartment("");
        setDesignation("");
        setPhoto(null);
      })
      .catch(() => toast.error("Failed to add employee"));
  };

  return (
    <div className={`${darkMode ? "dark" : ""}`} style={{ fontFamily: "Calibri, sans-serif" }}>
      <ToastContainer position="top-right" />
      <div className="flex min-h-screen">
       
       <Sidebar />

        {/* Main Content */}
        <main className="flex-1 ml-64 bg-gray-100 dark:bg-gray-900 dark:text-white">
          <header
            className="sticky top-0 z-50 flex justify-between items-center px-6 py-3 shadow-md border-b"
            style={{ backgroundColor: "#f8f8f8", color: "#333" }}
          >
            <div className="text-xl font-semibold tracking-wide">Employee Dashboard</div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-full px-4 py-2 text-sm bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5DBB63] text-black shadow-sm"
              />
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="text-sm px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-100"
              >
                {darkMode ? "Light Mode" : "Dark Mode"}
              </button>
             
            </div>
          </header>

          <div className="p-6">
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 rounded text-white shadow"
                style={{ backgroundColor: fern }}
              >
                + Add Employee
              </button>
            </div>

            <div className="space-y-4">
  {paginatedEmployees.map((emp) => (
    <div
      key={emp.id}
      className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex items-center justify-between hover:shadow-md transition cursor-pointer"
      onClick={() => navigate(`/employee/${emp.id}`)}
    >
      {/* Left Side: Photo + Info */}
      <div className="flex items-center gap-4">
        {emp.photo_url ? (
          <img
            src={emp.photo_url.startsWith("http") ? emp.photo_url : `${BASE_URL}${emp.photo_url}`}
            alt={emp.name}
            className="w-16 h-16 rounded-full object-cover border"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-sm text-gray-600">
            N/A
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{emp.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{emp.designation}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{emp.department}</p>
        </div>
      </div>

      {/* Right Side: Actions */}
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedEmployee(emp);
            setShowPasswordModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
        >
          Reset Password
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(emp.id);
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  ))}
</div>
{/* Pagination Controls */}
<div className="flex justify-center mt-6 space-x-2">
  <button
    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
    disabled={currentPage === 1}
    className="px-3 py-1 rounded border text-sm bg-white hover:bg-gray-200 disabled:opacity-50"
  >
    Prev
  </button>

  {Array.from({ length: totalPages }, (_, i) => (
    <button
      key={i + 1}
      onClick={() => setCurrentPage(i + 1)}
      className={`px-3 py-1 rounded border text-sm ${
        currentPage === i + 1
          ? "bg-[##5DBB63] text-white"
          : "bg-white hover:bg-gray-200"
      }`}
    >
      {i + 1}
    </button>
  ))}

  <button
    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
    disabled={currentPage === totalPages}
    className="px-3 py-1 rounded border text-sm bg-white hover:bg-gray-200 disabled:opacity-50"
  >
    Next
  </button>
</div>


            {/* Add Employee Modal */}
            {showModal && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Add Employee</h2>
                  <form onSubmit={handleAddEmployee}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border px-3 py-2 rounded text-black"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Department</label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full border px-3 py-2 rounded text-black"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Designation</label>
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full border px-3 py-2 rounded text-black"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Upload Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPhoto(e.target.files[0])}
                        className="w-full text-black"
                      />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded text-white"
                        style={{ backgroundColor: fern }}
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
      <PasswordManager
        user={currentUser}
        userId={selectedEmployee ? selectedEmployee.user_id : currentUser.id}
        employeeId={selectedEmployee?.id || currentUser.employee_id}
        onClose={() => {
          setShowPasswordModal(false);
          setSelectedEmployee(null);
        }}
      />
    </div>
  </div>
)}

    </div>
  );
}

export default Dashboard;
