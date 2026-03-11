import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import api from "../api/apiClient";
import "../styles/upload-material.css";

export default function UploadMaterial() {

  const navigate = useNavigate();

  // Correct param name
  const { chapterId } = useParams();

  const [title, setTitle] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  const handleAddAttachment = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {

    const selected = Array.from(e.target.files || []);

    if (selected.length > 0) {
      setFiles((prev) => [...prev, ...selected]);
    }

    e.target.value = "";

  };

  const handleUpload = async () => {

    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (files.length === 0) {
      alert("Please attach at least one file");
      return;
    }

    try {

      setUploading(true);

      const formData = new FormData();
      formData.append("title", title);

      files.forEach((file) => {
        formData.append("files", file);
      });

      await api.post(
        `/materials/chapters/${chapterId}/materials/upload/`,
        formData
      );

      alert("Upload successful");

      navigate(
        `/teacher/chapters/${chapterId}/study-materials`
      );

    } catch (err) {

      console.error("Upload failed:", err.response?.data || err);
      alert("Upload failed");

    } finally {

      setUploading(false);

    }

  };

  return (

    <div className="upload-material-page">

      <button
        className="um-back-btn"
        onClick={() => navigate(-1)}
      >
        <IoChevronBack /> Back
      </button>

      <div className="um-title-container">

        <h2 className="um-title">
          Study Materials
        </h2>

        <div className="um-search">
          <input type="text" placeholder="Search" />
          <FiSearch className="um-search-icon" />
        </div>

      </div>

      <div className="um-form-container">

        <div className="um-form-card">

          <h3 className="um-form-heading">
            Create New Study Material
          </h3>

          <div className="um-field">

            <label className="um-label">Title</label>

            <input
              type="text"
              className="um-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

          </div>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            multiple
            onChange={handleFileChange}
          />

          {files.length > 0 && (

            <div className="um-file-list">

              {files.map((f, i) => (
                <span key={i} className="um-file-name">
                  {f.name}
                </span>
              ))}

            </div>

          )}

          <button
            className="um-add-attachment-btn"
            onClick={handleAddAttachment}
          >
            + Add Attachment
          </button>

          <button
            className="um-upload-btn"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>

        </div>

      </div>

    </div>

  );

}