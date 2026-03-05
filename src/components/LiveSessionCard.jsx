export default function LiveSessionCard({ subject, topic, startsIn, timing }) {
  return (
    <div className="live-card">
      <div className="live-card-body">
        <h5>{subject}</h5>
        <p>{topic}</p>
        <p>Batch/Class ID</p>
        <p className="live-card-spacer"></p>
        <p className="starts-in">{startsIn}</p>
        <p className="time">{timing}</p>
      </div>
    </div>
  );
}
