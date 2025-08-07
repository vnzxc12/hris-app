import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from './Sidebar';
import { Trash2, Moon, Sun } from "lucide-react";

//NEW ADD
import { useContext } from "react";
import { AuthContext } from "./AuthContext"; 

// ... constants
const sidebarGreen = "#6a8932";
const fern = "#5DBB63";
const BASE_URL = "https://hris-backend-j9jw.onrender.com";

function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("first_name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
const { user } = useContext(AuthContext);


  const [showModal, setShowModal] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");

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

  // eslint-disable-next-line
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

     console.log({ firstName, middleName, lastName, department, designation }); 
     
    let photoUrl = "";

    if (photo) {
      const cloudData = new FormData();
      cloudData.append("file", photo);
      cloudData.append("upload_preset", "Photos");
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
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        department,
        designation,
        photo_url: photoUrl,
      })
      .then(() => {
        toast.success("Employee added!");
        setShowModal(false);
        fetchEmployees();
        setFirstName("");
        setMiddleName("");
        setLastName("");
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

        <main className="flex-1 ml-64 bg-gray-100 dark:bg-gray-900 dark:text-white">
          <header className="sticky top-0 z-50 flex justify-between items-center px-6 py-3 shadow-md border-b bg-[#f8f8f8] text-[#333]">
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
                className="p-2 rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </header>

          <div className="p-6">
  <div className="mb-4 flex justify-start">
    {user?.role !== "employee" && (
  <button
    onClick={() => setShowModal(true)}
    className="px-4 py-2 rounded border font-medium shadow text-[#6a8932] border-[#6a8932] bg-white hover:bg-[#6a8932] hover:text-white transition-colors"
  >
    + Add Employee
  </button>
)}

  </div>

            {/* START DIRECTORY CONTAINER */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
              <h1 className="text-3xl font-bold mb-6 text-[#6a8932]">DIRECTORY</h1>

              {paginatedEmployees.map((emp) => (
                <div
  key={emp.id}
  onClick={() => {
    if (user?.role !== "employee") {
      navigate(`/employee/${emp.id}`);
    }
  }}
  className="bg-gray-100 dark:bg-gray-700 shadow-xl rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 hover:shadow-2xl transition"
>
                  <div className="flex items-center gap-4">
                    {emp.photo_url ? (
                      <img
                        src={emp.photo_url.startsWith("http") ? emp.photo_url : `${BASE_URL}${emp.photo_url}`}
                        alt={[emp.first_name, emp.middle_name, emp.last_name].filter(Boolean).join(" ")}

                        className="w-24 h-24 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-sm text-gray-600">
                        N/A
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
  {[emp.first_name, emp.middle_name, emp.last_name].filter(Boolean).join(" ")}
</h3>

                      <p className="text-sm text-gray-600 dark:text-gray-300">{emp.designation}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{emp.department}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    
                    {user?.role !== "employee" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(emp.id);
                      }}
                      className="p-2 text-white rounded-full shadow-sm transition"
                      style={{ backgroundColor: sidebarGreen }}
                      title="Delete Employee"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}


                  </div>
                </div>
              ))}
            </div>
            {/* END DIRECTORY CONTAINER */}

            {/* Pagination */}
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
                    currentPage === i + 1 ? "bg-[#6a8932] text-white" : "bg-white hover:bg-gray-200"
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

            {/* Add Modal */}
           {user?.role !== "employee" && showModal && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Add Employee</h2>
                  <form onSubmit={handleAddEmployee}>
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      
  <div>
    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">First Name</label>
    <input
      type="text"
      value={firstName}
      onChange={(e) => setFirstName(e.target.value)}
      className="w-full border px-3 py-2 rounded text-black"
      required
    />
  </div>
  <div>
    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Middle Name</label>
    <input
      type="text"
      value={middleName}
      onChange={(e) => setMiddleName(e.target.value)}
      className="w-full border px-3 py-2 rounded text-black"
    />
  </div>
  <div>
    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Last Name</label>
    <input
      type="text"
      value={lastName}
      onChange={(e) => setLastName(e.target.value)}
      className="w-full border px-3 py-2 rounded text-black"
      required
    />
  </div>
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

export default Dashboard;
