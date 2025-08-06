// src/FilesPage.js
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import { AuthContext } from "./AuthContext";

const API_URL = process.env.REACT_APP_API_URL;

const FilesPage = () => {
  const { user } = useContext(AuthContext);
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${API_URL}/documents/1`);
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching company files:", error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("document", file);
    formData.append("employee_id", 1); // Hardcoded for company-wide docs

    try {
      await axios.post(`${API_URL}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      fetchFiles();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">

      <Sidebar />
      <div className="flex-1 p-6 overflow-auto ml-64">


        <h1 className="text-3xl font-bold mb-6">📁 Company Files</h1>

        {user?.role === "admin" && (
          <form
            onSubmit={handleUpload}
            className="mb-6 bg-white p-4 rounded shadow-md"
          >
            <label className="block mb-2 font-medium">Upload a File</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="mb-2 block"
              required
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Upload
            </button>
          </form>
        )}

        {files.length === 0 ? (
          <p className="text-gray-600">No files available for download.</p>
        ) : (
          <ul className="space-y-4">
            {files.map((file) => (
              <li
                key={file.id}
                className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{file.file_name}</p>
                  <p className="text-sm text-gray-500">
                    Uploaded: {new Date(file.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FilesPage;
