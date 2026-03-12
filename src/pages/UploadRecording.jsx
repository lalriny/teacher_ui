import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import api from "../api/apiClient";
import "../styles/upload-recording.css";

export default function UploadRecording() {

  const navigate = useNavigate();
  const { subjectId } = useParams();

  const [topic, setTopic] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [timing, setTiming] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  const handleAttachVideo = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {

    if (e.target.files.length > 0) {
      setVideoFile(e.target.files[0]);
    }

    e.target.value = "";
  };

  const handleUpload = async () => {

    console.log("Upload clicked");

    if (!topic.trim()) {
      alert("Please enter a topic/title");
      return;
    }

    if (!videoFile) {
      alert("Please attach a video file");
      return;
    }

    try {

      setUploading(true);

      console.log("Creating Bunny video slot...");
      console.log("UPLOAD KEY:", import.meta.env.VITE_BUNNY_UPLOAD_KEY);
      // 1️⃣ Ask Django to create Bunny video slot
      const res = await api.post(
        "/courses/recordings/create-video/",
        { title: topic }
      );

      const videoId = res.data.video_id;

      console.log("Video slot created:", videoId);

      // 2️⃣ Upload video directly to Bunny Storage
      const uploadUrl =
        `https://storage.bunnycdn.com/library/${import.meta.env.VITE_BUNNY_LIBRARY_ID}/videos/${videoId}`;

      const xhr = new XMLHttpRequest();

      xhr.open("PUT", uploadUrl, true);

      xhr.setRequestHeader(
        "AccessKey",
        import.meta.env.VITE_BUNNY_UPLOAD_KEY
      );

      xhr.setRequestHeader(
        "Content-Type",
        "application/octet-stream"
      );

      xhr.upload.onprogress = (e) => {

        if (e.lengthComputable) {

          const percent = Math.round(
            (e.loaded / e.total) * 100
          );

          setUploadProgress(percent);
        }
      };

      xhr.onload = async () => {

        console.log("Upload finished", xhr.status);

        if (xhr.status !== 200 && xhr.status !== 201) {
          alert("Upload failed");
          setUploading(false);
          return;
        }

        // 3️⃣ Save metadata in Django
        await api.post(
          `/courses/subjects/${subjectId}/recordings/save/`,
          {
            title: topic,
            session_date: sessionDate,
            duration: timing,
            video_id: videoId
          }
        );

        console.log("Recording saved");

        navigate(-1);
      };

      xhr.onerror = () => {
        console.error("Upload failed");
        alert("Upload failed");
        setUploading(false);
      };

      xhr.send(videoFile);

    } catch (err) {

      console.error(err);
      alert("Something went wrong");

      setUploading(false);
    }
  };

  return (

    <div className="ur-page">

      <button
        className="ur-back-btn"
        onClick={() => navigate(-1)}
      >
        <IoChevronBack /> Back
      </button>

      <div className="ur-title-container">

        <h2 className="ur-title">Mathematics</h2>

        <div className="ur-search">
          <input type="text" placeholder="Search" />
          <FiSearch className="ur-search-icon" />
        </div>

      </div>

      <div className="ur-form-container">

        <div className="ur-form-card">

          <h3 className="ur-form-heading">Add Recording</h3>

          <div className="ur-field">

            <label className="ur-label">Topic/Title</label>

            <input
              type="text"
              className="ur-input"
              placeholder="Trigonometry"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />

          </div>

          <div className="ur-field">

            <label className="ur-label">Session Date</label>

            <input
              type="text"
              className="ur-input"
              placeholder="21 Jan 2026"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
            />

          </div>

          <div className="ur-field">

            <label className="ur-label">Timing</label>

            <input
              type="text"
              className="ur-input"
              placeholder="1:00 pm - 2:30 pm"
              value={timing}
              onChange={(e) => setTiming(e.target.value)}
            />

          </div>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleFileChange}
          />

          {videoFile && (
            <span className="ur-file-name">
              {videoFile.name}
            </span>
          )}

          {uploadProgress > 0 && (

            <div className="upload-progress">
              Uploading: {uploadProgress}%
            </div>

          )}

          <button
            className="ur-attach-btn"
            onClick={handleAttachVideo}
          >
            + Attach Video
          </button>

          <button
            className="ur-upload-btn"
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