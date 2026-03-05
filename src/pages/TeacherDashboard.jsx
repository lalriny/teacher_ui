import { useState } from "react";
import "../styles/dashboard.css";
import LiveSessionCard from "../components/LiveSessionCard";
import CalendarWidget from "../components/CalendarWidget";
import AssignmentItem from "../components/AssignmentItem";
import QuizItem from "../components/QuizItem";
import ActivityItem from "../components/ActivityItem";

const assignments = [
  { id: "Assignment ID", status: "overdue" },
  { id: "Assignment: 1", subject: "Introduction to AI", dueDate: "27 Feb 26 (Friday)", submissionRate: "28/45 (62%)", status: "due", defaultExpanded: true },
  { id: "Assignment: 2", subject: "Modern Art History", dueDate: "06 Mar 26 (Friday)", status: "due" },
  { id: "Assignment: 3", subject: "Quantum Physics Fundamentals", dueDate: "13 Mar 26 (Friday)", status: "overdue" },
  { id: "Assignment: 4", subject: "Global Economic Trends", dueDate: "20 Mar 26 (Friday)", status: "due" },
];

const quizzes = [
  { id: "Quiz ID", status: "overdue" },
  { id: "Quiz: 1", subject: "Modern Art History", dueDate: "06 Mar 26 (Friday)", submissionRate: "28/45 (62%)", avgScore: "78%", highest: "95%", lowest: "45%", status: "due", defaultExpanded: true },
  { id: "Quiz: 2", subject: "Quantum Physics Fundamentals", dueDate: "13 Mar 26 (Friday)", status: "due" },
  { id: "Quiz: 3", status: "overdue" },
];

const activityItems = [
  { date: "04/03/2026 (Wed)", label: "Live Session",    type: "live-session", labelColor: "yellow", lines: ["Mathematics chapter 1: algebra", "Teacher: Sir Zothana", "Time: 1:00pm to 2:00pm"] },
  { date: "04/03/2026 (Wed)", label: "Due Assignment",  type: "assignment",   labelColor: "green",  lines: ["Mathematics chapter 1: algebra", "Teacher: Sir Zothana"] },
  { date: "04/03/2026 (Wed)", label: "Live Session",    type: "live-session", labelColor: "yellow", lines: ["English chapter 1: Poem", "Teacher: Miss Ruatfeli", "Time: 10:00am to 12:00pm"] },
  { date: "06/03/2026 (Fri)", label: "Quiz",            type: "quiz",         labelColor: "purple", lines: ["Science: chapter 1: Chemistry", "Teacher: Sir Rasta", "Due Date: 06/03/26 (Friday)"] },
  { date: "13/03/2026 (Fri)", label: "Due Assignment",  type: "assignment",   labelColor: "green",  lines: ["Mathematics chapter 1: algebra", "Teacher: Sir Zothana"] },
  { date: "20/03/2026 (Fri)", label: "Due Assignment",  type: "assignment",   labelColor: "green",  lines: ["Mathematics chapter 1: algebra", "Teacher: Sir Zothana"] },
];

export default function TeacherDashboard() {
  const [assignFilter, setAssignFilter] = useState(null); // null | "due" | "overdue"
  const [quizFilter, setQuizFilter] = useState(null);
  const [activityFilter, setActivityFilter] = useState("all");

  const toggleFilter = (current, value, setter) => {
    setter(current === value ? null : value);
  };

  const filteredAssignments = assignFilter
    ? assignments.filter(a => a.status === assignFilter)
    : assignments;

  const filteredQuizzes = quizFilter
    ? quizzes.filter(q => q.status === quizFilter)
    : quizzes;

  return (
    <div className="dashboard">

      {/* TOP ROW */}
      <div className="dash-top">
        <div className="dash-live-section">
          <div className="dash-live-header">
            <span className="dash-section-title">Upcoming Live Sessions</span>
            <span className="dash-remaining">4 Classes (Remaining classes)</span>
          </div>
          <div className="dash-live-row">
            <LiveSessionCard subject="Subject Name" topic="Title/Topic" startsIn="Starts in [time]" timing="Session Timing" />
            <LiveSessionCard subject="Biology 101" topic="Introduction to Genetics" startsIn="Starts in 15 minutes" timing="10:00 AM - 11:30 AM" />
            <LiveSessionCard subject="Art History" topic="Renaissance to Modern" startsIn="Starts in 30 min" timing="1:00 PM - 2:30 PM" />
          </div>
        </div>
        <CalendarWidget />
      </div>

      {/* BOTTOM ROW */}
      <div className="dash-bottom">

        {/* Column 1 — Assignments */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h4>Assignments</h4>
            <div className="dash-pills">
              <span
                className={`dash-pill pill-due ${assignFilter === "due" ? "pill-active" : ""}`}
                onClick={() => toggleFilter(assignFilter, "due", setAssignFilter)}
              >Due</span>
              <span
                className={`dash-pill pill-overdue ${assignFilter === "overdue" ? "pill-active" : ""}`}
                onClick={() => toggleFilter(assignFilter, "overdue", setAssignFilter)}
              >Over Due</span>
            </div>
          </div>
          <div className="dash-card-body">
            {filteredAssignments.map((a, i) => (
              <AssignmentItem key={i} {...a} />
            ))}
            {filteredAssignments.length === 0 && (
              <p className="dash-empty">No items</p>
            )}
          </div>
        </div>

        {/* Column 2 — Quiz */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h4>Quiz</h4>
            <div className="dash-pills">
              <span
                className={`dash-pill pill-due ${quizFilter === "due" ? "pill-active" : ""}`}
                onClick={() => toggleFilter(quizFilter, "due", setQuizFilter)}
              >Due</span>
              <span
                className={`dash-pill pill-overdue ${quizFilter === "overdue" ? "pill-active" : ""}`}
                onClick={() => toggleFilter(quizFilter, "overdue", setQuizFilter)}
              >Over Due</span>
            </div>
          </div>
          <div className="dash-card-body">
            {filteredQuizzes.map((q, i) => (
              <QuizItem key={i} {...q} />
            ))}
            {filteredQuizzes.length === 0 && (
              <p className="dash-empty">No items</p>
            )}
          </div>
        </div>

        {/* Column 3 — Activity Timeline */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h4>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</h4>
            <select
              className="dash-filter"
              value={activityFilter}
              onChange={e => setActivityFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="assignment">Assignments</option>
              <option value="live-session">Live Sessions</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>
          <div className="dash-card-body">
            {activityItems
              .filter(item => activityFilter === "all" || item.type === activityFilter)
              .map((item, i) => (
                <ActivityItem key={i} date={item.date} label={item.label} labelColor={item.labelColor} lines={item.lines} />
              ))
            }
          </div>
        </div>

      </div>
    </div>
  );
}
