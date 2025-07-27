// unchanged imports
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const fern = "#5DBB63";
const BACKEND_URL = "https://hris-backend-j9jw.onrender.com";

function App() {
  const [employees, setEmployees] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  // Modal Form States
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = () => {
    axios.get(`${BACKEND_URL}/employees`).then((res) => {
      setEmployees(res.data);
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      axios
        .delete(`${BACKEND_URL}/employees/${id}`)
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
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const valueA = a[sortBy]?.toString().toLowerCase() || "";
    const valueB = b[sortBy]?.toString().toLowerCase() || "";
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

  const handleAddEmployee = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("department", department);
    formData.append("designation", designation);
    if (photo) {
      formData.append("photo", photo);
    }

    axios
      .post(`${BACKEND_URL}/employees`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
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
        {/* Sidebar */}
        <aside className="w-64 p-4" style={{ backgroundColor: fern, color: "white" }}>
          <h1 className="text-2xl font-bold mb-4">HRIS</h1>
          <nav className="flex flex-col gap-2">
            <button className="text-left hover:opacity-80 px-3 py-2 rounded">Dashboard</button>
            <button className="text-left hover:opacity-80 px-3 py-2 rounded">Employees</button>
            <button className="text-left hover:opacity-80 px-3 py-2 rounded">Settings</button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-gray-100 dark:bg-gray-900 dark:text-white">
          <header className="sticky top-0 z-50 flex justify-between items-center px-6 py-3 shadow-md border-b"
            style={{ backgroundColor: "#f8f8f8", color: "#333" }}>
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
              <button
                onClick={() => alert("Logging out...")}
                className="text-sm px-4 py-2 rounded-md"
                style={{ backgroundColor: fern, color: "white" }}
              >
                Logout
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

            <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead style={{ backgroundColor: fern, color: "white" }}>
                  <tr>
                    <th className="px-4 py-2">Photo</th>
                    {["name", "department", "designation"].map((col) => (
                      <th
                        key={col}
                        onClick={() => toggleSort(col)}
                        className="cursor-pointer px-4 py-2"
                      >
                        {col.replace("_", " ").toUpperCase()}
                        {sortBy === col && (sortOrder === "asc" ? " ▲" : " ▼")}
                      </th>
                    ))}
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => navigate(`/employee/${emp.id}`)}
                    >
                      <td className="px-4 py-2">
                        {emp.photo_url ? (
                          <img
                            src={`${BACKEND_URL}${emp.photo_url}`}
                            alt={emp.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600">
                            N/A
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2">{emp.name}</td>
                      <td className="px-4 py-2">{emp.department}</td>
                      <td className="px-4 py-2">{emp.designation}</td>
                      <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center mt-4 gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded ${currentPage === i + 1 ? "text-white" : "bg-gray-300"}`}
                  style={{ backgroundColor: currentPage === i + 1 ? fern : "#e2e8f0" }}
                >
                  {i + 1}
                </button>
              ))}
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
    </div>
  );
}

export default App;
