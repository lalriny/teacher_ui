import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
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

  // ✅ NEW
  const [useCustomChapter, setUseCustomChapter] = useState(false);
  const [customChapter, setCustomChapter] = useState("");

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
        size: file.size,
      };

      newItems.push(item);
    });

    setFileItems((prev) => [...prev, ...newItems]);
    setFiles((prev) => [...prev, ...selected]);

    e.target.value = "";
  };

  const handleRemoveFile = (name) => {
    setFileItems((prev) => prev.filter((f) => f.name !== name));
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  // ✅ FIXED UPLOAD (ONE REQUEST)
  const handleUpload = async () => {

    if (!title.trim()) {
      alert("Enter title");
      return;
    }

    if (!useCustomChapter && !chapterId) {
      alert("Select chapter");
      return;
    }

    if (useCustomChapter && !customChapter.trim()) {
      alert("Enter custom chapter");
      return;
    }

    if (files.length === 0) {
      alert("Add files");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("title", title);

      if (useCustomChapter) {
        formData.append("custom_chapter", customChapter);
        formData.append("subject_id", subjectId);
      } else {
        formData.append("chapter_id", chapterId);
      }

      files.forEach((file) => {
        formData.append("files", file);
      });

      await api.post(`/materials/materials/upload/`, formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );

          setFileItems((prev) =>
            prev.map((f) => ({ ...f, progress: percent }))
          );
        },
      });

      alert("Saved successfully");

      navigate(`/teacher/classes/${subjectId}/study-materials`);

    } catch (err) {
      console.error("Upload failed:", err);
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

          {/* LEFT */}
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

            {/* ✅ UPDATED CHAPTER FIELD */}
            <div className="um-field">
              <label className="um-label">Chapter</label>

              {!useCustomChapter ? (
                <>
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

                  <button
                    className="um-custom-btn"
                    onClick={() => setUseCustomChapter(true)}
                  >
                    Custom
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    className="um-input"
                    placeholder="Enter new chapter"
                    value={customChapter}
                    onChange={(e) => setCustomChapter(e.target.value)}
                  />

                  <button
                    className="um-custom-btn"
                    onClick={() => setUseCustomChapter(false)}
                  >
                    Use Existing
                  </button>
                </>
              )}
            </div>

          </div>

          {/* RIGHT */}
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

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>{item.name}</span>
                      <MdDelete
                        style={{ cursor: "pointer" }}
                        onClick={() => handleRemoveFile(item.name)}
                      />
                    </div>

                    <small>
                      {(item.size / 1024).toFixed(1)} KB
                    </small>

                    <div className="um-progress-bar">
                      <div
                        className="um-progress-fill"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>

                    <span>{item.progress}%</span>

                  </div>
                ))}
              </div>
            )}

            <button
              className="um-upload-btn"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? "Saving..." : "Save"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}