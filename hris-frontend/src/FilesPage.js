import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import { AuthContext } from "./AuthContext";

const API_URL = process.env.REACT_APP_API_URL;

const FilesPage = () => {
  const { user } = useContext(AuthContext);
  const [files, setFiles] = useState([]);

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${API_URL}/documents/employee/${user.employee_id}`);
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
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
          <h1 className="text-3xl font-bold mb-6 text-[#6a8932]">Files</h1>

          {files.length === 0 ? (
            <p className="text-gray-600">No files available for download.</p>
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
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded border font-medium shadow text-[#6a8932] border-[#6a8932] bg-white hover:bg-[#6a8932] hover:text-white transition-colors"
                  >
                    Open
                  </a>
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
