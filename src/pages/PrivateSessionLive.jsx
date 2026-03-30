import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import api from "../api/apiClient";
import ClassroomUI from "../components/live/ClassroomUI";
import "../styles/privateSessions.css";

export default function PrivateSessionLive() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const joinSession = async () => {
      try {
        // Try the private session join endpoint first
        const res = await api.post(
          `/sessions/${id}/join/`,
          {},
          { signal: controller.signal }
        );
        setData(res.data);
      } catch (err) {
        if (err.name === "CanceledError") return;

        // Fallback: try the regular livestream join endpoint
        try {
          const res2 = await api.post(
            `/livestream/sessions/${id}/join/`,
            {},
            { signal: controller.signal }
          );
          setData(res2.data);
        } catch (err2) {
          if (err2.name === "CanceledError") return;
          console.error("Failed to join private session:", err2);
          setError(
            err2?.response?.data?.detail ||
            "Unable to join session. The session may not have started yet or the server is unavailable."
          );
        }
      }
    };

    joinSession();
    return () => controller.abort();
  }, [id]);

  if (error) {
    return (
      <div className="tps__page">
        <div className="tps__live-error">
          <h2>Unable to join session</h2>
          <p>{error}</p>
          <button
            className="tps__abtn tps__abtn--primary"
            onClick={() => navigate("/teacher/private-sessions")}
          >
            Back to Private Sessions
          </button>
          <button
            className="tps__abtn tps__abtn--outline"
            style={{ marginLeft: 12 }}
            onClick={() => { setError(null); setData(null); }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="tps__page">
        <div className="tps__live-loading">
          <div className="tps__live-spinner" />
          <p>Joining private session...</p>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={data.livekit_url}
      token={data.token}
      connect={true}
      video={data.role === "TEACHER"}
      audio={true}
      onDisconnected={() => navigate("/teacher/private-sessions")}
    >
      <ClassroomUI role={data.role?.toLowerCase() || "teacher"} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}