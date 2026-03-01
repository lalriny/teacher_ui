import { useNavigate } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { useEffect, useState } from "react";
import api from "../api/apiClient";
import SearchBar from "../components/SearchBar";
import "../styles/classes-list.css";

export default function ClassesList() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const res = await api.get(
          "/courses/teacher/my-classes/"
        );

        setSubjects(res.data);
      } catch (err) {
        console.error("Failed to load teacher subjects", err);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSubjects();
  }, []);

  if (loading) return <div>Loading classes...</div>;

  return (
    <div className="cl-wrapper">
      <button
        className="cl-back-btn"
        onClick={() => navigate("/teacher/dashboard")}
      >
        <IoChevronBack /> Back
      </button>

      <div className="cl-container">
        <div className="cl-top">
          <h2>My Classes</h2>
          <SearchBar />
        </div>

        <div className="cl-grid">
          {subjects.length === 0 && (
            <p style={{ opacity: 0.6 }}>No subjects assigned.</p>
          )}

          {subjects.map((subject) => (
            <div
              className="cl-card"
              key={subject.subject_id}
              onClick={() =>
                navigate(
                  `/teacher/classes/${subject.subject_id}`
                )
              }
            >
              <p className="cl-card-name">
                {subject.subject_name}
              </p>

              <div className="cl-card-right">
                <span className="cl-card-label">
                  {subject.course_title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}