import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { FiUpload, FiX, FiFile, FiTrash2 } from "react-icons/fi";
import { BsCalendar3 } from "react-icons/bs";
import toast from "react-hot-toast";
import api from "../api/apiClient";
import "../styles/create-assignment.css";

export default function CreateAssignment() {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const { state: editData } = useLocation();

  const isEditing = Boolean(editData);

  const [chapters, setChapters] = useState([]);
  const [chapterId, setChapterId] = useState(
    editData?.chapter_id || editData?.chapter?.id || ""
  );
  const [title, setTitle] = useState(editData?.title || "");
  const [description, setDescription] = useState(editData?.description || "");
  const [dueDate, setDueDate] = useState(
    editData?.due_date?.slice(0, 10) || ""
  );
  const [dueTime, setDueTime] = useState("23:59");

  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  useEffect(() => {
    async function fetchChapters() {
      try {
        const res = await api.get(`/courses/subject/${subjectId}/`);
        setChapters(res.data?.chapters || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load chapters.");
      }
    }

    if (subjectId) fetchChapters();
  }, [subjectId]);

  const validate = () => {
    const newErrors = {};

    if (!chapterId) newErrors.chapter = "Chapter required";
    if (!title.trim()) newErrors.title = "Title required";
    if (!description.trim()) newErrors.description = "Description required";
    if (!dueDate) newErrors.dueDate = "Due date required";
    if (!file && !isEditing) newErrors.file = "File required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;

    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const name = selectedFile.name.toLowerCase();

    if (!allowedExtensions.some(ext => name.endsWith(ext))) {
      toast.error("Only PDF, DOC, DOCX allowed");
      return;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (selectedFile.size > maxSize) {
      toast.error("File must be less than 50MB");
      return;
    }

    setFile(selectedFile);
    setErrors(prev => ({ ...prev, file: null }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const formData = new FormData();
      formData.append("chapter_id", chapterId);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("due_date", `${dueDate}T${dueTime}:00`);

      if (file) {
        formData.append("attachment", file);
      }

      if (isEditing) {
        const res = await api.patch(
          `/assignments/teacher/${editData.id}/edit/`,
          formData
        );
        toast.success(res?.data?.message || "Assignment updated successfully");
      } else {
        const res = await api.post("/assignments/teacher/create/", formData);
        toast.success(res?.data?.message || "Assignment created successfully");
      }

      setTimeout(() => {
        navigate(`/teacher/classes/${subjectId}/assignments`);
      }, 600);
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.detail ||
        err?.message ||
        "Operation failed."
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="create-assignment-page">
      {/* Header */}
      <div className="ca-header">
        <button className="ca-back-btn" onClick={() => navigate(-1)}>
          <IoChevronBack /> Back
        </button>
      </div>

      {/* Title Card */}
      <div className="ca-title-card">
        <h2 className="ca-page-title">
          {isEditing ? "Edit" : "Create"} <span className="ca-highlight">Assignment</span>
        </h2>
      </div>

      {/* Form Container */}
      <div className="ca-form-container">
        <div className="ca-form">

          {/* Chapter */}
          <div className="ca-field">
            <label className="ca-label">Chapter</label>
            <div className="ca-custom-select-wrapper">
              <select
                value={chapterId}
                onChange={(e) => {
                  setChapterId(e.target.value);
                  setErrors(prev => ({ ...prev, chapter: null }));
                }}
                className={`ca-select ${errors.chapter ? "ca-input-error" : ""}`}
              >
                <option value="">Select Chapter</option>
                {chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.title}
                  </option>
                ))}
              </select>
              <button className="ca-custom-btn">Custom</button>
            </div>
            {errors.chapter && (
              <span className="ca-error">{errors.chapter}</span>
            )}
          </div>

          {/* Title */}
          <div className="ca-field">
            <label className="ca-label">Title</label>
            <input
              type="text"
              placeholder="Select Topic"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors(prev => ({ ...prev, title: null }));
              }}
              className={`ca-input ${errors.title ? "ca-input-error" : ""}`}
            />
            {errors.title && (
              <span className="ca-error">{errors.title}</span>
            )}
          </div>

          {/* Due Date & Time */}
          <div className="ca-datetime-row">
            <div className="ca-field ca-field-half">
              <label className="ca-label">Due Date</label>
              <div className="ca-date-wrapper">
                <div className="ca-date-display">
                  {dueDate ? formatDate(dueDate) : "26 Jan 2026"}
                </div>
                <label className="ca-date-icon-wrapper">
                  <BsCalendar3 className="ca-date-icon" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => {
                      setDueDate(e.target.value);
                      setErrors(prev => ({ ...prev, dueDate: null }));
                    }}
                    className="ca-date-input"
                  />
                </label>
              </div>
              {errors.dueDate && (
                <span className="ca-error">{errors.dueDate}</span>
              )}
            </div>

            <div className="ca-field ca-field-half">
              <label className="ca-label">Set Time</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="ca-input"
              />
            </div>
          </div>

          {/* Description */}
          <div className="ca-field">
            <label className="ca-label">Note</label>
            <textarea
              rows={4}
              placeholder="Teach kids understanding fragment or identities and solving complex problems."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors(prev => ({ ...prev, description: null }));
              }}
              className={`ca-textarea ${errors.description ? "ca-input-error" : ""}`}
            />
            {errors.description && (
              <span className="ca-error">{errors.description}</span>
            )}
          </div>

          {/* Files Section */}
          <div className="ca-field">
            <div className="ca-files-header">
              <label className="ca-label">Files</label>
              <span className="ca-file-count">({file ? 1 : 0})</span>
            </div>

            {/* Drop Zone */}
            <div
              ref={dropZoneRef}
              className={`ca-drop-zone ${dragActive ? "ca-drag-active" : ""} ${errors.file ? "ca-input-error" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                hidden
                onChange={(e) => handleFileChange(e.target.files?.[0])}
                accept=".pdf,.doc,.docx"
              />
              
              <FiUpload className="ca-upload-icon" />
              <p className="ca-drop-text">Click or drag file to this area to upload</p>
              <p className="ca-drop-subtext">Maximum 50 MB file size</p>
            </div>

            {errors.file && (
              <span className="ca-error">{errors.file}</span>
            )}

            {/* Uploaded Files List */}
            {file && (
              <div className="ca-uploaded-files">
                <div className="ca-file-item">
                  <div className="ca-file-icon">
                    <FiFile />
                  </div>
                  <div className="ca-file-details">
                    <div className="ca-file-name">{file.name}</div>
                    <div className="ca-file-meta">
                      <span>{formatFileSize(file.size)}</span>
                      <span className="ca-file-status">✓ Uploaded</span>
                    </div>
                  </div>
                  <button
                    className="ca-file-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    title="Remove file"
                  >
                    <FiX />
                  </button>
                </div>
              </div>
            )}

            {/* Existing file in edit mode */}
            {isEditing && editData?.attachment && !file && (
              <div className="ca-uploaded-files">
                <div className="ca-file-item ca-existing-file">
                  <div className="ca-file-icon">
                    <FiFile />
                  </div>
                  <div className="ca-file-details">
                    <div className="ca-file-name">Existing attachment</div>
                    <a
                      href={editData.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ca-file-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View file
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="ca-actions">
            <button className="ca-submit-btn" onClick={handleSubmit}>
              {isEditing ? "Update Assignment" : "Create Assignment"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}