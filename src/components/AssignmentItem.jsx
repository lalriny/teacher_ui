import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdExpandMore, MdExpandLess } from "react-icons/md";

export default function AssignmentItem({ id, title, subject, dueDate, submissionRate, subjectId, defaultExpanded = false }) {

  const [expanded, setExpanded] = useState(defaultExpanded);
  const navigate = useNavigate();

  return (
    <div className="acc-item">

      <div className="acc-header" onClick={() => setExpanded(!expanded)}>
        <span className="acc-id">{title || id}</span>

        {expanded
          ? <MdExpandLess className="acc-arrow" />
          : <MdExpandMore className="acc-arrow" />
        }
      </div>

      {expanded && (
        <div className="acc-body">

          {subject && (
            <p className="acc-line">
              <strong>Subject Name:</strong> {subject}
            </p>
          )}

          {dueDate && (
            <p className="acc-line">
              <strong>Due Date:</strong> {dueDate}
            </p>
          )}

          {submissionRate && (
            <p className="acc-line">
              <strong>Submission Rate:</strong> {submissionRate}
            </p>
          )}

          <button
            className="btn-view-sub"
            onClick={() =>
              navigate(`/teacher/classes/${subjectId}/assignments/${id}/submissions`)
            }
          >
            View Submissions
          </button>

        </div>
      )}
    </div>
  );
}