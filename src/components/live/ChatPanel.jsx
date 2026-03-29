import { useLocalParticipant, useRoomContext } from "@livekit/components-react";
import { useEffect, useState, useRef } from "react";
import "../../styles/chat.css";

export default function ChatPanel({ role }) {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const messagesEndRef = useRef(null);

  // ✅ auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleData = (payload, participant) => {
      const text = new TextDecoder().decode(payload);

      try {
        const msg = JSON.parse(text);
        if (msg.type === "raise-hand") return;
      } catch {}

      const isTeacher = participant.permissions?.canPublish;

      setMessages((prev) => [
        ...prev,
        {
          sender: participant.identity,
          text,
          isTeacher,
          time: new Date(),
        },
      ]);
    };

    room.on("dataReceived", handleData);
    return () => room.off("dataReceived", handleData);
  }, [room]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const encoder = new TextEncoder();
    await localParticipant.publishData(
      encoder.encode(input),
      { reliable: true }
    );

    setMessages((prev) => [
      ...prev,
      {
        sender: "Me",
        text: input,
        isMe: true,
        time: new Date(),
      },
    ]);

    setInput("");
  };

  const raiseHand = async () => {
    const message = { type: "raise-hand" };

    const encoder = new TextEncoder();
    await localParticipant.publishData(
      encoder.encode(JSON.stringify(message)),
      { reliable: true }
    );
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="chat-container">

      {/* MESSAGES */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-row ${msg.isMe ? "me" : "other"}`}
          >
            <div
              className={`chat-bubble 
                ${msg.isMe ? "me-bubble" : ""}
                ${msg.isTeacher ? "teacher-bubble" : ""}
              `}
            >
              <div className="chat-header">
                <span className="chat-name">
                  {msg.isMe ? "You" : msg.sender}
                </span>
                <span className="chat-time">
                  {formatTime(msg.time)}
                </span>
              </div>

              <div className="chat-text">{msg.text}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="chat-input-area">
        {role === "student" && (
          <button onClick={raiseHand} className="raise-btn">
            ✋
          </button>
        )}

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button onClick={sendMessage}>➤</button>
      </div>
    </div>
  );
}