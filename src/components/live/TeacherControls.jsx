import { useLocalParticipant, useRoomContext } from "@livekit/components-react";
import { useState, useEffect } from "react";
import {
  BsMicFill,
  BsMicMuteFill,
  BsCameraVideoFill,
  BsCameraVideoOffFill,
} from "react-icons/bs";
import { MdScreenShare, MdStopScreenShare, MdCallEnd } from "react-icons/md";

export default function TeacherControls() {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();

  const [micOn, setMicOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [sharing, setSharing] = useState(false);

  /* =====================================
     🔥 SYNC REAL STATE FROM LIVEKIT
  ===================================== */
  useEffect(() => {
    if (!localParticipant) return;

    setMicOn(localParticipant.isMicrophoneEnabled);
    setCameraOn(localParticipant.isCameraEnabled);
    setSharing(localParticipant.isScreenShareEnabled);
  }, [localParticipant]);

  /* =====================================
     🔥 TOGGLES WITH ERROR SAFETY
  ===================================== */
  const toggleMic = async () => {
    try {
      const next = !micOn;
      await localParticipant.setMicrophoneEnabled(next);
      setMicOn(next);
    } catch (err) {
      console.error("Mic error:", err);
    }
  };

  const toggleCamera = async () => {
    try {
      const next = !cameraOn;
      await localParticipant.setCameraEnabled(next);
      setCameraOn(next);
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const toggleScreen = async () => {
    try {
      const next = !sharing;
      await localParticipant.setScreenShareEnabled(next);
      setSharing(next);
    } catch (err) {
      console.error("Screen share error:", err);
    }
  };

  return (
    <div className="teacher-controls">

      {/* MIC */}
      <button
        className={`control-btn${micOn ? "" : " off"}`}
        onClick={toggleMic}
        title={micOn ? "Mute mic" : "Unmute mic"}
      >
        {micOn ? <BsMicFill size={16} /> : <BsMicMuteFill size={16} />}
        {micOn ? "Mute" : "Unmuted"}
      </button>

      {/* CAMERA */}
      <button
        className={`control-btn${cameraOn ? "" : " off"}`}
        onClick={toggleCamera}
        title={cameraOn ? "Turn off camera" : "Turn on camera"}
      >
        {cameraOn
          ? <BsCameraVideoFill size={16} />
          : <BsCameraVideoOffFill size={16} />}
        {cameraOn ? "Camera" : "No Cam"}
      </button>

      {/* SCREEN SHARE */}
      <button
        className={`control-btn${sharing ? " off" : ""}`}
        onClick={toggleScreen}
        title={sharing ? "Stop sharing" : "Share screen"}
      >
        {sharing
          ? <MdStopScreenShare size={18} />
          : <MdScreenShare size={18} />}
        {sharing ? "Stop Share" : "Share"}
      </button>

      {/* END CALL */}
      <button
        className="control-btn end-call-btn"
        onClick={() => room.disconnect()}
        title="End session"
      >
        <MdCallEnd size={18} />
        End
      </button>
    </div>
  );
}