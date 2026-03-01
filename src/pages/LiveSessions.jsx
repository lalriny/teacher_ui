export default function LiveSessions() {
  const navigate = useNavigate();
  const { subjectId } = useParams();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        setLoading(true);

        const res = await api.get(
          `/livestream/teacher/sessions/?subject_id=${subjectId}`
        );

        setSessions(res.data || []);
      } catch (err) {
        console.error("Failed to load sessions", err);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    }

    if (subjectId) {
      fetchSessions();
    }
  }, [subjectId]);

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

          {!loading && sessions.length === 0 && (
            <p>No sessions scheduled yet.</p>
          )}

          {!loading &&
            sessions.map((session) => (
              <div
                key={session.id}
                className="session-card"
                onClick={() =>
                  navigate(`/teacher/live/${session.id}`)
                }
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
                    {new Date(session.start_time).toLocaleDateString()}
                  </span>

                  <span className="session-card-timing">
                    {new Date(session.start_time).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}