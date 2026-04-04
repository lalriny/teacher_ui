import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { IoChevronBack } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import { MdCancel } from "react-icons/md";
import api from "../api/apiClient";
import "../styles/live-sessions.css";

/* =====================================
   🔥 COUNTDOWN FUNCTION
===================================== */
function getCountdown(startTime) {
  const now = new Date();
  const start = new Date(startTime);

  const diff = start - now;

  if (diff <= 0) return "🔴 LIVE";

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  if (minutes > 0) return `Starts in ${minutes} min`;
  return `Starts in ${seconds}s`;
}

export default function LiveSessions() {
  const navigate = useNavigate();
  const { subjectId } = useParams();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const fetchSessions = useCallback(async () => {
    try {
      setError(null);

      const url = subjectId
        ? `/livestream/teacher/sessions/?subject_id=${subjectId}`
        : `/livestream/teacher/sessions/`;

      const res = await api.get(url);
      setSessions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    fetchSessions();

    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  /* =====================================
     🔥 COUNTDOWN AUTO UPDATE
  ===================================== */
  useEffect(() => {
    const interval = setInterval(() => {
      setSessions((prev) => [...prev]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleJoin = (session) => {
    if (!session.can_join) return;
    navigate(`/teacher/live/${session.id}`);
  };

  const handleCancel = async (e, sessionId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to cancel this session?")) return;

    try {
      await api.post(`/livestream/sessions/${sessionId}/cancel/`);
      fetchSessions();
    } catch (err) {
      console.error("Failed to cancel session:", err);
      alert(err.response?.data?.detail || "Failed to cancel session.");
    }
  };

  const filtered = sessions.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.title?.toLowerCase().includes(q) ||
      s.subject_name?.toLowerCase().includes(q) ||
      s.course_name?.toLowerCase().includes(q) ||
      s.teacher?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="live-sessions-page">
      <button
        className="live-sessions-back-btn"
        onClick={() => navigate(-1)}
      >
        <IoChevronBack /> Back
      </button>

      <div className="live-sessions-header">
        <h2 className="live-sessions-title">
          Schedule for Interactive Sessions
        </h2>

        <div className="live-sessions-search">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FiSearch className="live-sessions-search-icon" />
        </div>
      </div>

      <div className="live-sessions-content">
        {subjectId && (
          <div className="live-sessions-actions">
            <button
              className="live-sessions-schedule-btn"
              onClick={() =>
                navigate(`/teacher/classes/${subjectId}/live-sessions/create`)
              }
            >
              Schedule Live Session
            </button>
          </div>
        )}

        <div className="live-sessions-grid">
          {loading && (
            <p className="live-sessions-empty">Loading sessions…</p>
          )}
          {error && (
            <p className="live-sessions-empty" style={{ color: "#b91c1c" }}>
              {error}
            </p>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="live-sessions-empty">
              <p style={{ fontSize: 32, margin: "0 0 8px" }}>📅</p>
              <p style={{ margin: 0, fontWeight: 600 }}>
                {search
                  ? "No sessions match your search."
                  : "No sessions scheduled yet."}
              </p>
              {!search && subjectId && (
                <p style={{ margin: "4px 0 0", fontSize: 12 }}>
                  Click "Schedule Live Session" to create one.
                </p>
              )}
            </div>
          )}

          {!loading &&
            !error &&
            filtered.map((session) => {
              const startDate = new Date(session.start_time);
              const endDate = new Date(session.end_time);

              return (
                <div
                  key={session.id}
                  className={`session-card ${
                    !session.can_join ? "disabled" : ""
                  }`}
                  onClick={() => handleJoin(session)}
                >
                  <div className="session-card-info">
                    <h4 className="session-card-subject">
                      {session.subject_name}
                    </h4>

                    <p className="session-card-course">
                      {session.course_name}
                    </p>

                    <p className="session-card-topic">
                      {session.title}
                    </p>

                    {/* 🔥 NEW: TEACHER */}
                    <p className="session-card-teacher">
                      👨‍🏫 {session.teacher || "You"}
                    </p>
                  </div>

                  <div className="session-card-meta">
                    <span className={`status ${session.computed_status}`}>
                      {session.computed_status}
                    </span>

                    {session.computed_status === "LIVE" && (
                      <span className="live-badge">🔴 LIVE</span>
                    )}

                    {session.computed_status === "SCHEDULED" && (
                      <button
                        className="session-cancel-btn"
                        onClick={(e) => handleCancel(e, session.id)}
                        title="Cancel session"
                      >
                        <MdCancel /> Cancel
                      </button>
                    )}
                  </div>

                  {/* 🔥 IMPROVED BOTTOM */}
                  <div className="session-card-bottom">
                    <span>
                      {startDate.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>

                    <span>
                      {startDate.toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>

                    {/* 🔥 NEW: END TIME */}
                    <span>
                      Ends: {endDate.toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>

                    {/* 🔥 COUNTDOWN */}
                    <span className="starts-in">
                      {getCountdown(session.start_time)}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}