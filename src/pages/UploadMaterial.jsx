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
  const [fileItems, setFileItems] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [chapterId, setChapterId] = useState("");
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);
  const controllersRef = useRef({});

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

  // ✅ REAL UPLOAD FUNCTION
  const uploadFile = async (file) => {

    const formData = new FormData();
    formData.append("file", file);

    const controller = new AbortController();
    controllersRef.current[file.name] = controller;

    const newItem = {
      name: file.name,
      progress: 0,
      uploaded: false,
      size: file.size,
      id: null,
    };

    setFileItems((prev) => [...prev, newItem]);

    try {

      const res = await api.post(
        `/materials/upload-file/`,
        formData,
        {
          signal: controller.signal,
          onUploadProgress: (e) => {
            const percent = Math.round((e.loaded * 100) / e.total);

            setFileItems((prev) =>
              prev.map((f) =>
                f.name === file.name ? { ...f, progress: percent } : f
              )
            );
          },
        }
      );

      setFileItems((prev) =>
        prev.map((f) =>
          f.name === file.name
            ? { ...f, uploaded: true, id: res.data.id }
            : f
        )
      );

    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  // ✅ SELECT → AUTO UPLOAD
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    const allowedTypes = ["pdf", "doc", "docx"];

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

      uploadFile(file);
    });

    e.target.value = "";
  };

  const handleRemoveFile = (name) => {
    setFileItems((prev) => prev.filter((f) => f.name !== name));
  };

  const handleCancelUpload = (name) => {
    const controller = controllersRef.current[name];
    if (controller) {
      controller.abort();
    }

    setFileItems((prev) => prev.filter((f) => f.name !== name));
  };

  // ✅ SAVE (CREATE MATERIAL ONLY)
  const handleSave = async () => {

    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (!chapterId) {
      alert("Please select a chapter");
      return;
    }

    const fileIds = fileItems
      .filter((f) => f.uploaded)
      .map((f) => f.id);

    if (fileIds.length === 0) {
      alert("Upload at least one file");
      return;
    }

    try {

      setUploading(true);

      await api.post(
        `/materials/chapters/${chapterId}/materials/upload/`,
        {
          title,
          file_ids: fileIds,
        }
      );

      alert("Saved successfully");

      navigate(`/teacher/classes/${subjectId}/study-materials`);

    } catch (err) {
      console.error(err);
      alert("Save failed");
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

                    {!item.uploaded ? (
                      <>
                        <div className="um-progress-bar">
                          <div
                            className="um-progress-fill"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>{item.progress}%</span>

                          <span
                            style={{ cursor: "pointer", color: "#ff6b6b" }}
                            onClick={() => handleCancelUpload(item.name)}
                          >
                            Cancel
                          </span>
                        </div>
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
              onClick={handleSave}
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