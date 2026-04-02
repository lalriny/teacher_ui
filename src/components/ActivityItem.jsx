// ActivityItem.jsx
export default function ActivityItem({ date, label, labelColor, lines, dayBadge, onClick }) {
  return (
    <div className="act-item" onClick={onClick} style={onClick ? { cursor: "pointer" } : {}}>
      <span className={`act-bar ${labelColor}`}></span>
      <div className="act-content">
        {dayBadge && <span className="act-day-badge">{dayBadge}</span>}
        <p className="act-date">{date}</p>
        <p className={`act-label ${labelColor}`}>{label}</p>
        {lines && lines.map((line, i) => (
          <p key={i} className="act-line">{line}</p>
        ))}
      </div>
    </div>
  );
}
