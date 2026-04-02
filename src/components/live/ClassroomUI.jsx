import { useTracks, VideoTrack, useRoomContext } from "@livekit/components-react";
import { Track } from "livekit-client";
import ParticipantsPanel from "./ParticipantsPanel";
import ChatPanel from "./ChatPanel";
import TeacherControls from "./TeacherControls";
import { useState, useRef, useEffect } from "react";
import "../../styles/live.css";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { IoChatbubblesOutline } from "react-icons/io5";

export default function ClassroomUI({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [raiseHandToasts, setRaiseHandToasts] = useState([]);
  const [raisedHands, setRaisedHands] = useState({});
  const containerRef = useRef(null);
  const room = useRoomContext();

  // Raise-hand listener — teacher only, shows toast + highlights participant card
  useEffect(() => {
    if (role !== "teacher") return;

    const handleData = (payload, participant) => {
      try {
        const text = new TextDecoder().decode(payload);
        const msg = JSON.parse(text);
        if (msg.type !== "raise-hand") return;

        const identity = participant.identity;
        const toastId = Date.now() + Math.random();

        setRaiseHandToasts((prev) => [...prev, { id: toastId, identity }]);
        setTimeout(
          () => setRaiseHandToasts((prev) => prev.filter((t) => t.id !== toastId)),
          5000
        );

        setRaisedHands((prev) => ({ ...prev, [identity]: true }));
        setTimeout(
          () =>
            setRaisedHands((prev) => {
              const u = { ...prev };
              delete u[identity];
              return u;
            }),
          15000
        );
      } catch {}
    };

    room.on("dataReceived", handleData);
    return () => room.off("dataReceived", handleData);
  }, [room, role]);

  // Fullscreen API
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    const onFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFSChange);
    return () => document.removeEventListener("fullscreenchange", onFSChange);
  }, []);

  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: false },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  // Only the teacher can publish — find screen share and camera tracks directly
  const screenTrack = tracks.find((t) => t.source === Track.Source.ScreenShare);
  const cameraTrack = tracks.find((t) => t.source === Track.Source.Camera);

  // Prioritize screen share as main view; fall back to camera
  const mainTrack = screenTrack || cameraTrack;
  // Show camera as PiP only when screen sharing is active
  const pipTrack = screenTrack ? cameraTrack : null;

  if (!mainTrack) {
    return (
      <div className="waiting-screen">
        <h2>
          {role === "teacher"
            ? "Enable your camera to start the session"
            : "Waiting for teacher to start video…"}
        </h2>
      </div>
    );
  }

  return (
    <div
      className={`classroom-layout${isFullscreen ? " fs-mode" : ""}`}
      ref={containerRef}
    >
      {/* Raise-hand toast notifications — visible to teacher only */}
      {raiseHandToasts.length > 0 && (
        <div className="rh-toasts">
          {raiseHandToasts.map((t) => (
            <div key={t.id} className="rh-toast">
              ✋ <strong>{t.identity}</strong> raised their hand
            </div>
          ))}
        </div>
      )}

      {/* MAIN VIDEO STAGE */}
      <div className={`main-stage${!sidebarOpen ? " full-width" : ""}`}>
        <VideoTrack trackRef={mainTrack} />

        {/* Picture-in-picture camera when screen sharing */}
        {pipTrack && (
          <div className="pip-camera">
            <VideoTrack trackRef={pipTrack} />
          </div>
        )}

        {role === "teacher" && <TeacherControls />}

        {/* Top-right overlay action buttons */}
        <div className="video-overlay-actions">
          <button
            className="ov-btn"
            onClick={() => setSidebarOpen((v) => !v)}
            title={sidebarOpen ? "Hide panel" : "Show panel"}
          >
            <IoChatbubblesOutline size={17} />
          </button>
          <button
            className="ov-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <MdFullscreenExit size={19} /> : <MdFullscreen size={19} />}
          </button>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      {sidebarOpen && (
        <div className="right-sidebar">
          <ParticipantsPanel raisedHands={raisedHands} />
          <ChatPanel role={role} />
        </div>
      )}
    </div>
  );
}
