import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import api from "../api/apiClient";
import "../styles/upload-material.css";

export default function UploadMaterial() {

  const navigate = useNavigate();
  const { subjectId } = useParams();

  const [title, setTitle] = useState("");
  const [files, setFiles] = useState([]);
  const [fileItems, setFileItems] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [chapterId, setChapterId] = useState("");
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (subjectId) {
      loadChapters();
    }
  }, [subjectId]);

  const loadChapters = async () => {
    try {
      const res = await api.get(`/courses/subjects/${subjectId}/chapters/`);
      setChapters(res.data);
    } catch (err) {
      console.error("Failed to load chapters", err);
      alert("Failed to load chapters");
    }
  };

  const handleAddAttachment = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    const allowedTypes = ["pdf", "doc", "docx"];
    const newItems = [];

    selected.forEach((file) => {
      const ext = file.name.split(".").pop().toLowerCase();

      if (!allowedTypes.includes(ext)) {
        alert(`${file.name} not allowed`);
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        alert(`${file.name} exceeds 50MB`);
        return;
      }

      const item = {
        file,
        name: file.name,
        progress: 0,
        uploaded: false,
        size: file.size,
      };

      newItems.push(item);
      simulateUpload(item);
    });

    setFileItems((prev) => [...prev, ...newItems]);
    setFiles((prev) => [...prev, ...selected]);

    e.target.value = "";
  };

  const simulateUpload = (item) => {
    let progress = 0;

    const interval = setInterval(() => {
      progress += 10;

      setFileItems((prev) =>
        prev.map((f) =>
          f.name === item.name ? { ...f, progress } : f
        )
      );

      if (progress >= 100) {
        clearInterval(interval);

        setFileItems((prev) =>
          prev.map((f) =>
            f.name === item.name ? { ...f, uploaded: true } : f
          )
        );
      }
    }, 200);
  };

  const handleUpload = async () => {

    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (!chapterId) {
      alert("Please select a chapter");
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

      fileItems.forEach((item) => {
        formData.append("files", item.file);
      });

      await api.post(
        `/materials/chapters/${chapterId}/materials/upload/`,
        formData
      );

      alert("Upload successful");

      setFiles([]);
      setFileItems([]);
      setTitle("");
      setChapterId("");

      navigate(`/teacher/classes/${subjectId}/study-materials`);

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
        <h2 className="um-title">Study Materials</h2>

        <div className="um-search">
          <input type="text" placeholder="Search" />
          <FiSearch className="um-search-icon" />
        </div>
      </div>

      <div className="um-form-container">

        <div className="um-form-card">

          {/* ✅ LEFT SIDE */}
          <div className="um-form-left">

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

            <div className="um-field">
              <label className="um-label">Chapter</label>

              <select
                className="um-input"
                value={chapterId}
                onChange={(e) => setChapterId(e.target.value)}
              >
                <option value="">Select Chapter</option>

                {chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.title}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* ✅ RIGHT SIDE (UPLOAD PANEL) */}
          <div className="um-upload-panel">

            <div className="um-upload-title">Upload File</div>

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              multiple
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />

            <button
              className="um-add-attachment-btn"
              onClick={handleAddAttachment}
            >
              Click to upload or drag & drop
            </button>

            <div className="um-upload-info">
              Max 50MB • PDF, DOC, DOCX
            </div>

            {fileItems.length > 0 && (
              <div className="um-file-list">
                {fileItems.map((item, i) => (
                  <div key={i} className="um-file-card">

                    <span>{item.name}</span>

                    <small>
                      {(item.size / 1024).toFixed(1)} KB
                    </small>

                    {!item.uploaded ? (
                      <>
                        <div className="um-progress-bar">
                          <div
                            className="um-progress-fill"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span>{item.progress}%</span>
                      </>
                    ) : (
                      <span className="um-uploaded">✔ Uploaded</span>
                    )}

                  </div>
                ))}
              </div>
            )}

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

    </div>
  );
}