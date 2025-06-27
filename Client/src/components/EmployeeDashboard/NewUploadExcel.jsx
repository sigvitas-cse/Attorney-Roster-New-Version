import React, { useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

function NewUploadExcel({ onClose, userId }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "https://roster1.sigvitas.com";
  const location = useLocation();
  const userId2 = location.state?.userId;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("❌ Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("excelFile", file);
    formData.append("userId", userId2);

    console.log("Sending userName:", userId2);

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/upload-excel-dynamic`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(res.data.message || "✅ Upload successful.");
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("❌ Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-[9999]">
      <div className="bg-white p-8 rounded-xl shadow-xl w-[90%] max-w-md relative z-[10000]">
        <button
          className="absolute top-3 right-4 bg-red-500 text-white border-none rounded-full px-2 py-1 text-base cursor-pointer"
          onClick={onClose}
        >
          X
        </button>
        <h2 className="text-xl font-semibold">Upload Excel File</h2>

        <div className="mt-5 flex items-center gap-3 flex-wrap">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".xlsx, .xls"
            className="flex-1 p-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-blue-600 text-white border-none rounded-lg cursor-pointer hover:bg-blue-700 transition duration-200"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {message && <p className="mt-4 font-bold text-teal-700">{message}</p>}
      </div>
    </div>
  );
}

export default NewUploadExcel;