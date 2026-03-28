import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/apiClient";

export default function TeacherCreateLiveSession() {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (!form.title || !form.start_time || !form.end_time) {
      setError("Please fill all required fields.");
      return;
    }

    if (new Date(form.start_time) >= new Date(form.end_time)) {
      setError("End time must be after start time.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/livestream/sessions/", {
        title: form.title,
        description: form.description,
        subject_id: subjectId,
        // ✅ FIXED HERE
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
      });

      navigate(-1);
    } catch (err) {
      console.error(err.response?.data);

      if (err.response?.data) {
        const msg = Object.values(err.response.data)
          .flat()
          .join(" ");
        setError(msg);
      } else {
        setError("Failed to create session.");
      }
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const minDateTime = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 16);

  return (
    <div style={{ padding: 20, maxWidth: 500 }}>
      <h2>Create Live Session</h2>

      {error && (
        <p style={{ color: "red", marginBottom: 10 }}>
          {error}
        </p>
      )}

      <input
        placeholder="Title"
        value={form.title}
        onChange={(e) =>
          setForm({ ...form, title: e.target.value })
        }
        style={{ width: "100%", padding: 8 }}
      />

      <br /><br />

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) =>
          setForm({ ...form, description: e.target.value })
        }
        style={{ width: "100%", padding: 8 }}
      />

      <br /><br />

      <label>Start Time</label>
      <input
        type="datetime-local"
        value={form.start_time}
        min={minDateTime}
        onChange={(e) =>
          setForm({
            ...form,
            start_time: e.target.value,
          })
        }
        style={{ width: "100%", padding: 8 }}
      />

      <br /><br />

      <label>End Time</label>
      <input
        type="datetime-local"
        value={form.end_time}
        min={form.start_time || minDateTime}
        onChange={(e) =>
          setForm({
            ...form,
            end_time: e.target.value,
          })
        }
        style={{ width: "100%", padding: 8 }}
      />

      <br /><br />

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: "10px 20px",
          background: loading ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        {loading ? "Creating..." : "Create Session"}
      </button>
    </div>
  );
}