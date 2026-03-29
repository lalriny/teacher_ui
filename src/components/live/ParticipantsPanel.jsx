import { useParticipants, useRoomContext } from "@livekit/components-react";
import { useEffect, useState } from "react";
import "../../styles/participants.css";

export default function ParticipantsPanel() {
  const participants = useParticipants();
  const room = useRoomContext();

  const [open, setOpen] = useState(true);
  const [raisedHands, setRaisedHands] = useState({});

  useEffect(() => {
    const handleData = (payload, participant) => {
      try {
        const text = new TextDecoder().decode(payload);
        const msg = JSON.parse(text);

        if (msg.type === "raise-hand") {
          setRaisedHands((prev) => ({
            ...prev,
            [participant.identity]: true,
          }));

          setTimeout(() => {
            setRaisedHands((prev) => {
              const updated = { ...prev };
              delete updated[participant.identity];
              return updated;
            });
          }, 15000);
        }
      } catch {}
    };

    room.on("dataReceived", handleData);
    return () => room.off("dataReceived", handleData);
  }, [room]);

  // ✅ teacher first (priority)
  const sortedParticipants = [...participants].sort((a, b) => {
    const aIsTeacher = a.permissions?.canPublish;
    const bIsTeacher = b.permissions?.canPublish;
    return bIsTeacher - aIsTeacher;
  });

  return (
    <div className="participants-container">

      {/* HEADER */}
      <div
        className="participants-header"
        onClick={() => setOpen(!open)}
      >
        <span>Participants ({participants.length})</span>
        <span>{open ? "▾" : "▸"}</span>
      </div>

      {/* LIST */}
      {open && (
        <div className="participants-list">
          {sortedParticipants.map((p) => {
            const isTeacher = p.permissions?.canPublish;

            return (
              <div
                key={p.identity}
                className={`participant-item ${
                  isTeacher ? "teacher" : ""
                }`}
              >
                <div className="avatar">
                  {p.identity.charAt(0).toUpperCase()}
                </div>

                <div className="participant-info">
                  <span className="name">
                    {p.identity}
                    {isTeacher && " (Teacher)"}
                  </span>

                  {raisedHands[p.identity] && (
                    <span className="raise">✋</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}