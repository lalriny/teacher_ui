import api from "./apiClient";

const privateSessionService = {

  async getSubjectsByCourse() {
  const res = await api.get("/courses/subjects/mine/");  // ← only student's subjects
  return res.data || [];
},

  async getTeachers(subjectId) {
    if (!subjectId) return [];
    const res = await api.get(`/sessions/subjects/${subjectId}/teachers/`);
    return res.data || [];
  },

  async validateStudentId(studentId) {
    const res = await api.get(`/accounts/validate-student/?student_id=${studentId}`);
    return res.data;
  },

  async requestSession(data) {
    const payload = {
      teacher_id: data.teacher_id,
      subject_id: data.subject_id,
      scheduled_date: data.scheduled_date,
      scheduled_time: data.scheduled_time,
      duration_minutes: data.duration_minutes || 60,
      session_type: data.session_type || "one_on_one",
      group_strength: data.group_strength || 1,
      notes: data.notes || "",
      student_ids: data.student_ids || [],
    };
    const res = await api.post("/sessions/request/", payload);
    return transformSession(res.data);
  },

  async getSessions(tab = "scheduled") {
    const res = await api.get(`/sessions/student/?tab=${tab}`);
    return (res.data || []).map(transformSession);
  },

  async cancelSession(id, reason = "") {
    const res = await api.post(`/sessions/${id}/cancel/`, { reason });
    return transformSession(res.data);
  },

  async confirmReschedule(id) {
    const res = await api.post(`/sessions/${id}/confirm-reschedule/`);
    return transformSession(res.data);
  },

  async declineReschedule(id) {
    const res = await api.post(`/sessions/${id}/decline-reschedule/`);
    return transformSession(res.data);
  },

  async getTeacherSessions() {
    const res = await api.get("/sessions/teacher/sessions/");
    return (res.data || []).map(transformSession);
  },

  async getRequests() {
    const res = await api.get("/sessions/teacher/requests/");
    return (res.data || []).map(transformSession);
  },

  async getHistory() {
    const res = await api.get("/sessions/teacher/history/");
    return (res.data || []).map(transformSession);
  },

  async acceptRequest(id, data = {}) {
    const res = await api.post(`/sessions/${id}/accept/`, data);
    return transformSession(res.data);
  },

  async declineRequest(id, reason = "") {
    const res = await api.post(`/sessions/${id}/decline/`, { reason });
    return transformSession(res.data);
  },

  async rescheduleRequest(id, { new_date, new_time, note = "" }) {
    const res = await api.post(`/sessions/${id}/reschedule/`, {
      scheduled_date: new_date,
      scheduled_time: new_time,
      reason: note,
    });
    return transformSession(res.data);
  },

  async startSession(id) {
    const res = await api.post(`/sessions/${id}/start/`);
    return transformSession(res.data);
  },

  async endSession(id) {
    const res = await api.post(`/sessions/${id}/end/`);
    return transformSession(res.data);
  },

  async teacherCancelSession(id, reason = "") {
    const res = await api.post(`/sessions/${id}/teacher-cancel/`, { reason });
    return transformSession(res.data);
  },

  async getSessionDetail(id) {
    const res = await api.get(`/sessions/${id}/`);
    return transformSession(res.data);
  },

  async joinSession(sessionId) {
    const res = await api.post(`/sessions/${sessionId}/join/`);
    return res.data;
  },

  async getLiveKitToken(sessionId) {
    return privateSessionService.joinSession(sessionId);
  },

  async getAvailability() {
    try {
      const res = await api.get("/sessions/teacher/availability/");
      return res.data;
    } catch {
      return {};
    }
  },

  async saveAvailability(data) {
    try {
      const res = await api.post("/sessions/teacher/availability/", data);
      return res.data;
    } catch {
      return { success: false };
    }
  },

  TIME_SLOTS: [
    { label: "6:00 AM",  value: "06:00" },
    { label: "7:00 AM",  value: "07:00" },
    { label: "8:00 AM",  value: "08:00" },
    { label: "9:00 AM",  value: "09:00" },
    { label: "10:00 AM", value: "10:00" },
    { label: "11:00 AM", value: "11:00" },
    { label: "12:00 PM", value: "12:00" },
    { label: "1:00 PM",  value: "13:00" },
    { label: "2:00 PM",  value: "14:00" },
    { label: "3:00 PM",  value: "15:00" },
    { label: "4:00 PM",  value: "16:00" },
    { label: "5:00 PM",  value: "17:00" },
    { label: "6:00 PM",  value: "18:00" },
    { label: "7:00 PM",  value: "19:00" },
    { label: "8:00 PM",  value: "20:00" },
  ],

  DURATIONS: [
    { label: "30 minutes",  value: 30  },
    { label: "45 minutes",  value: 45  },
    { label: "60 minutes",  value: 60  },
    { label: "90 minutes",  value: 90  },
    { label: "120 minutes", value: 120 },
  ],

  DAYS: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
};

function transformSession(s) {
  if (!s) return s;
  const actualDur = s.actual_duration_minutes;
  const scheduledDur = s.duration_minutes;
  return {
    ...s,
    id: s.id,
    subject: s.subject,
    teacher: s.teacher_name,
    student: s.student_name,
    date: s.scheduled_date,
    time: s.scheduled_time,
    duration: actualDur || scheduledDur,
    durationMinutes: scheduledDur,
    durationLabel: actualDur ? `${actualDur} mins (actual)` : `${scheduledDur} mins`,
    groupStrength: s.group_strength || 1,
    startedAt: s.started_at,
    endedAt: s.ended_at,
    note: s.notes || "",
    teacherNote: s.reschedule_reason || "",
    originalDate: s.scheduled_date,
    originalTime: s.scheduled_time,
    rescheduledDate: s.rescheduled_date || null,
    rescheduledTime: s.rescheduled_time || null,
    cancelReason: s.cancel_reason || "",
    declineReason: s.decline_reason || "",
    sessionType: s.session_type || "one_on_one",
    students: (s.participants || []).map((p) => p.name || p.student_name || "Student"),
    participants: s.participants || [],
  };
}

export const {
  getSubjectsByCourse,
  getTeachers,
  validateStudentId,
  requestSession,
  getSessions,
  cancelSession,
  confirmReschedule,
  declineReschedule,
  getTeacherSessions,
  getRequests,
  getHistory,
  acceptRequest,
  declineRequest,
  rescheduleRequest,
  startSession,
  endSession,
  teacherCancelSession,
  getSessionDetail,
  joinSession,
  getLiveKitToken,
  getAvailability,
  saveAvailability,
} = privateSessionService;

export default privateSessionService;