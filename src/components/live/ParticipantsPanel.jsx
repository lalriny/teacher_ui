import { useParticipants, useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";
import { useState, useEffect, useCallback } from "react";
import { IoPeople } from "react-icons/io5";
import { BsMicFill, BsMicMuteFill } from "react-icons/bs";

export default function ParticipantsPanel({ raisedHands = {} }) {
  const participants = useParticipants();
  const room = useRoomContext();
  const [open, setOpen] = useState(true);
  const [mutedMap, setMutedMap] = useState({});

  // Track which participants have their mic muted
  const updateMuteStatus = useCallback(() => {
    const map = {};
    for (const p of participants) {
      const audioTrack = p.audioTrackPublications?.values?.();
      let isMuted = true;
      if (audioTrack) {
        for (const pub of audioTrack) {
          if (pub.source === "microphone") {
            isMuted = pub.isMuted || !pub.isSubscribed;
          }
        }
      }
      map[p.identity] = isMuted;
    }
    setMutedMap(map);
  }, [participants]);

  useEffect(() => {
    updateMuteStatus();
    room.on(RoomEvent.TrackMuted, updateMuteStatus);
    room.on(RoomEvent.TrackUnmuted, updateMuteStatus);
    room.on(RoomEvent.TrackPublished, updateMuteStatus);
    room.on(RoomEvent.TrackUnpublished, updateMuteStatus);
    return () => {
      room.off(RoomEvent.TrackMuted, updateMuteStatus);
      room.off(RoomEvent.TrackUnmuted, updateMuteStatus);
      room.off(RoomEvent.TrackPublished, updateMuteStatus);
      room.off(RoomEvent.TrackUnpublished, updateMuteStatus);
    };
  }, [room, updateMuteStatus]);

  // Mute a remote participant via LiveKit server API (Room.updateParticipant)
  const handleMuteStudent = async (participant) => {
    try {
      // Send a data message telling the student to mute
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify({ type: "force-mute" }));
      await room.localParticipant.publishData(data, { reliable: true, destinationIdentities: [participant.identity] });
    } catch (err) {
      console.error("Failed to mute participant:", err);
    }
  };

  const sortedParticipants = [...participants].sort((a, b) => {
    const aT = a.permissions?.canPublish ? 1 : 0;
    const bT = b.permissions?.canPublish ? 1 : 0;
    return bT - aT;
  });

  return (
    <div className="participants-wrapper">

      {/* HEADER */}
      <div className="participants-header" onClick={() => setOpen((o) => !o)}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <IoPeople size={16} />
          Participants ({participants.length})
        </span>
        <span style={{ fontSize: 12 }}>{open ? "▾" : "▸"}</span>
      </div>

      {/* LIST */}
      {open && (
        <div className="participants-row">
          {sortedParticipants.map((p) => {
            const meta = p.metadata ? JSON.parse(p.metadata) : null;
            const isTeacher = meta?.role === "teacher" || p.permissions?.canPublish;

            const handRaised = raisedHands[p.identity];
            const displayName = p.name || p.identity;

            return (
              <div
                key={p.identity}
                className={`participant-card${handRaised ? " hand-raised" : ""}`}
              >
                <div className="participant-avatar">
                  {displayName.charAt(0).toUpperCase()}
                </div>

                <div className="participant-name">
                  {displayName}
                  {isTeacher && (
                    <span style={{ fontSize: 10, fontWeight: 600, marginLeft: 6, color: "var(--brand)", opacity: 0.8 }}>
                      TEACHER
                    </span>
                  )}
                  {handRaised && <span className="raised-hand-icon">✋</span>}
                </div>

                {/* Mute button — only for students, not the teacher */}
                {!isTeacher && (
                  <button
                    className="participant-mute-btn"
                    onClick={() => handleMuteStudent(p)}
                    title={mutedMap[p.identity] ? "Student is muted" : "Mute student"}
                  >
                    {mutedMap[p.identity]
                      ? <BsMicMuteFill size={13} color="#b91c1c" />
                      : <BsMicFill size={13} color="#15803d" />
                    }
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
