export default function TeacherRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/teacher/dashboard" />} />

      <Route element={<TeacherLayout />}>
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />

        {/* Subject based routes */}
        <Route path="/teacher/classes" element={<ClassesList />} />

        <Route path="/teacher/classes/:subjectId" element={<Classes />} />

        <Route path="/teacher/classes/:subjectId/assignments" element={<Assignments />} />
        <Route path="/teacher/classes/:subjectId/assignments/create" element={<CreateAssignment />} />
        <Route path="/teacher/classes/:subjectId/assignments/view" element={<AssignmentView />} />
        <Route path="/teacher/classes/:subjectId/assignments/view/submissions" element={<SubmissionView />} />

        <Route path="/teacher/classes/:subjectId/quizzes" element={<Quizzes />} />
        <Route path="/teacher/classes/:subjectId/quizzes/create" element={<CreateQuiz />} />
        <Route path="/teacher/classes/:subjectId/quizzes/view" element={<QuizView />} />
        <Route path="/teacher/classes/:subjectId/quizzes/view/submissions" element={<QuizSubmissionView />} />
        <Route path="/teacher/classes/:subjectId/quizzes/view/submissions/review" element={<QuizReviewView />} />

        <Route path="/teacher/classes/:subjectId/study-materials" element={<StudyMaterials />} />
        <Route path="/teacher/classes/:subjectId/study-materials/upload" element={<UploadMaterial />} />
        <Route path="/teacher/classes/:subjectId/study-materials/view" element={<StudyMaterialView />} />

        <Route path="/teacher/classes/:subjectId/session-recordings" element={<SessionRecordings />} />
        <Route path="/teacher/classes/:subjectId/session-recordings/upload" element={<UploadRecording />} />

        <Route path="/teacher/classes/:subjectId/live-sessions" element={<LiveSessions />} />
      </Route>
    </Routes>
  );
}