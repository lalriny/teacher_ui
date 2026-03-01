import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { IoChevronBack } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import api from "../api/apiClient";
import "../styles/live-sessions.css";

export default function LiveSessions() {
  const navigate = useNavigate();
  const { subjectId } = useParams();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!subjectId) return;

    let mounted = true;

    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get(
          `/livestream/teacher/sessions/?subject_id=${subjectId}`
        );

        if (mounted) {
          setSessions(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error("Failed to load sessions", err);
        if (mounted) {
          setError("Unable to load sessions.");
          setSessions([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSessions();

    return () => {
      mounted = false;
    };
  }, [subjectId]);

  const handleJoin = (sessionId) => {
    navigate(`/teacher/live/${sessionId}`);
  };

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
          <input type="text" placeholder="Search" />
          <FiSearch className="live-sessions-search-icon" />
        </div>
      </div>

      <div className="live-sessions-content">
        <div className="live-sessions-actions">
          <button
            className="live-sessions-schedule-btn"
            onClick={() =>
              navigate(
                `/teacher/classes/${subjectId}/live-sessions/create`
              )
            }
          >
            Schedule Live Session
          </button>
        </div>

        <div className="live-sessions-grid">

          {loading && <p>Loading sessions...</p>}

          {error && <p style={{ color: "red" }}>{error}</p>}

          {!loading && !error && sessions.length === 0 && (
            <p>No sessions scheduled yet.</p>
          )}

          {!loading &&
            !error &&
            sessions.map((session) => {
              const startDate = new Date(session.start_time);

              return (
                <div
                  key={session.id}
                  className="session-card"
                  onClick={() => handleJoin(session.id)}
                >
                  <div className="session-card-top">
                    <h4 className="session-card-subject">
                      {session.title}
                    </h4>
                  </div>

                  <p className="session-card-teacher">
                    {session.teacher}
                  </p>

                  <div className="session-card-bottom">
                    <span className="session-card-date">
                      {isNaN(startDate)
                        ? "-"
                        : startDate.toLocaleDateString()}
                    </span>

                    <span className="session-card-timing">
                      {isNaN(startDate)
                        ? "-"
                        : startDate.toLocaleTimeString()}
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