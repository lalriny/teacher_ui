/**
 * FILE: teacher_ui/src/api/privateSessionService.js
 * DEPLOYMENT READY — real API calls, graceful error handling
 */

import api from "./apiClient";

const privateSessionService = {

  // ── Fetch scheduled sessions (approved/ongoing/needs_reconfirmation) ──
  async getSessions() {
    const res = await api.get("/sessions/teacher/sessions/");
    return res.data;
  },

  // ── Fetch pending requests from students ──
  async getRequests() {
    const res = await api.get("/sessions/teacher/requests/");
    return res.data;
  },

  // ── Fetch history (completed/cancelled/declined) ──
  async getHistory() {
    const res = await api.get("/sessions/teacher/history/");
    return res.data;
  },

  // ── Session detail ──
  async getSessionDetail(id) {
    const res = await api.get(`/sessions/${id}/`);
    return res.data;
  },

  // ── Accept a pending request ──
  async acceptRequest(id) {
    const res = await api.post(`/sessions/${id}/accept/`);
    return res.data;
  },

  // ── Decline a request ──
  async declineRequest(id, reason = "") {
    const res = await api.post(`/sessions/${id}/decline/`, { reason });
    return res.data;
  },

  // ── Propose reschedule ──
  async rescheduleRequest(id, { new_date, new_time, duration, note = "" }) {
    const res = await api.post(`/sessions/${id}/reschedule/`, { new_date, new_time, duration, note });
    return res.data;
  },

  // ── Start session (creates LiveKit room) ──
  async startSession(id) {
    const res = await api.post(`/sessions/${id}/start/`);
    return res.data;
  },

  // ── End/cancel session ──
  async endSession(id, reason = "") {
    const res = await api.post(`/sessions/${id}/end/`, { reason });
    return res.data;
  },

  async cancelSession(id, reason = "") {
    const res = await api.post(`/sessions/${id}/cancel/`, { reason });
    return res.data;
  },

  // ── LiveKit token ──
  async getLiveKitToken(sessionId) {
    const res = await api.post("/livekit/token/", { session_id: sessionId });
    return res.data;
  },

  // ── Availability (backend endpoint TBD) ──
  async getAvailability() {
    const res = await api.get("/sessions/teacher/availability/");
    return res.data;
  },

  async saveAvailability(data) {
    const res = await api.post("/sessions/teacher/availability/", data);
    return res.data;
  },

  // ── Constants ──
  DAYS: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  SHORT_DAYS: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  TIME_SLOTS: ["9:00 AM – 11:00 AM", "11:00 AM – 1:00 PM", "2:00 PM – 4:00 PM", "4:00 PM – 6:00 PM", "6:00 PM – 8:00 PM"],
};

export default privateSessionService;