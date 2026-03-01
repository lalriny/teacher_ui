import { Routes, Route, Navigate } from "react-router-dom";
import TeacherLayout from "../layout/TeacherLayout";
import TeacherDashboard from "../pages/TeacherDashboard";
import ClassesList from "../pages/ClassesList";
import Classes from "../pages/Classes";
import Assignments from "../pages/Assignments";
import CreateAssignment from "../pages/CreateAssignment";
import AssignmentView from "../pages/AssignmentView";
import SubmissionView from "../pages/SubmissionView";
import Quizzes from "../pages/Quizzes";
import CreateQuiz from "../pages/CreateQuiz";
import QuizView from "../pages/QuizView";
import QuizSubmissionView from "../pages/QuizSubmissionView";
import QuizReviewView from "../pages/QuizReviewView";
import StudyMaterials from "../pages/StudyMaterials";
import UploadMaterial from "../pages/UploadMaterial";
import StudyMaterialView from "../pages/StudyMaterialView";
import SessionRecordings from "../pages/SessionRecordings";
import UploadRecording from "../pages/UploadRecording";
import LiveSessions from "../pages/LiveSessions";

export default function TeacherRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/teacher/dashboard" />} />

      <Route element={<TeacherLayout />}>

        {/* Dashboard */}
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />

        {/* Subjects */}
        <Route path="/teacher/classes" element={<ClassesList />} />
        <Route path="/teacher/classes/:subjectId" element={<Classes />} />

        {/* ================= ASSIGNMENTS ================= */}
        <Route
          path="/teacher/classes/:subjectId/assignments"
          element={<Assignments />}
        />

        <Route
          path="/teacher/classes/:subjectId/assignments/create"
          element={<CreateAssignment />}
        />

        <Route
          path="/teacher/classes/:subjectId/assignments/:assignmentId"
          element={<AssignmentView />}
        />

        <Route
          path="/teacher/classes/:subjectId/assignments/:assignmentId/submissions"
          element={<SubmissionView />}
        />

        {/* ================= QUIZZES ================= */}
        <Route
          path="/teacher/classes/:subjectId/quizzes"
          element={<Quizzes />}
        />

        <Route
          path="/teacher/classes/:subjectId/quizzes/create"
          element={<CreateQuiz />}
        />

        <Route
          path="/teacher/classes/:subjectId/quizzes/:quizId"
          element={<QuizView />}
        />

        <Route
          path="/teacher/classes/:subjectId/quizzes/:quizId/submissions"
          element={<QuizSubmissionView />}
        />

        <Route
          path="/teacher/classes/:subjectId/quizzes/:quizId/review"
          element={<QuizReviewView />}
        />

        {/* ================= STUDY MATERIALS ================= */}
        <Route
          path="/teacher/classes/:subjectId/study-materials"
          element={<StudyMaterials />}
        />

        <Route
          path="/teacher/classes/:subjectId/study-materials/upload"
          element={<UploadMaterial />}
        />

        <Route
          path="/teacher/classes/:subjectId/study-materials/:materialId"
          element={<StudyMaterialView />}
        />

        {/* ================= RECORDINGS ================= */}
        <Route
          path="/teacher/classes/:subjectId/session-recordings"
          element={<SessionRecordings />}
        />

        <Route
          path="/teacher/classes/:subjectId/session-recordings/upload"
          element={<UploadRecording />}
        />

        {/* ================= LIVE ================= */}
        <Route
          path="/teacher/classes/:subjectId/live-sessions"
          element={<LiveSessions />}
        />

      </Route>
    </Routes>
  );
}