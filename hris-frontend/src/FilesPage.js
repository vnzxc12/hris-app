import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import { AuthContext } from "./AuthContext";

const API_URL = process.env.REACT_APP_API_URL;

const FilesPage = () => {
  const { user } = useContext(AuthContext);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${API_URL}/documents/global`);
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching global files:", error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await axios.post(`${API_URL}/documents/global`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSelectedFile(null);
      fetchFiles();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      await axios.delete(`${API_URL}/documents/global/${id}`);
      fetchFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 p-6 overflow-auto ml-64">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-[#6a8932]">Global Files</h1>

          {/* Admin Upload Section */}
          {user?.role === "admin" && (
            <form onSubmit={handleUpload} className="mb-6 flex gap-4 items-center">
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="border p-2 rounded w-full"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded bg-[#6a8932] text-white font-medium hover:bg-[#577025]"
              >
                Upload
              </button>
            </form>
          )}

          {files.length === 0 ? (
            <p className="text-gray-600">No global files available for download.</p>
          ) : (
            <ul className="space-y-4">
              {files.map((file) => (
                <li
                  key={file.id}
                  className="bg-gray-100 rounded-md p-4 flex justify-between items-center shadow-sm"
                >
                  <div>
                    <p className="font-medium">{file.file_name}</p>
                    <p className="text-sm text-gray-500">
                      Uploaded: {new Date(file.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded border font-medium shadow text-[#6a8932] border-[#6a8932] bg-white hover:bg-[#6a8932] hover:text-white transition-colors"
                    >
                      Open
                    </a>

                    {/* Delete Button for Admin */}
                    {user?.role === "admin" && (
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="px-4 py-2 rounded bg-red-500 text-white font-medium hover:bg-red-600"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilesPage;
