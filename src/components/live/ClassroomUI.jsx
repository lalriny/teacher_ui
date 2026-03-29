import { useTracks, VideoTrack } from "@livekit/components-react";
import { Track } from "livekit-client";
import ParticipantsPanel from "./ParticipantsPanel";
import ChatPanel from "./ChatPanel";
import { useState } from "react";
import "../../styles/classroom.css";

export default function ClassroomUI({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: false },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  // Detect teacher (publisher)
  const teacherTrack = tracks.find(
    (t) => t.participant.permissions?.canPublish
  );

  if (!teacherTrack) {
    return (
      <div className="waiting-screen">
        <h2>Waiting for teacher to start video…</h2>
      </div>
    );
  }

  return (
    <div className="classroom-container">

      {/* MAIN VIDEO */}
      <div className={`video-section ${sidebarOpen ? "" : "full"}`}>
        
        <div className="video-wrapper">
          <VideoTrack trackRef={teacherTrack} />
        </div>

        <button
          className="toggle-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "Hide Panel" : "Show Panel"}
        </button>
      </div>

      {/* SIDEBAR */}
      {sidebarOpen && (
        <div className="sidebar">
          <div className="participants-section">
            <ParticipantsPanel />
          </div>

          <div className="chat-section">
            <ChatPanel role={role} />
          </div>
        </div>
      )}
    </div>
  );
}