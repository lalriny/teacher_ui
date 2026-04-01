/**
 * FILE: teacher_ui/src/api/privateSessionService.js
 * Matches the REAL backend: sessions_app with UUID IDs,
 * scheduled_date/scheduled_time fields, and /join/ endpoint.
 */

import api from "./apiClient";

const privateSessionService = {

  // ── Fetch lists ──
  async getSessions() {
    const res = await api.get("/sessions/teacher/sessions/");
    return res.data;
  },

  async getRequests() {
    const res = await api.get("/sessions/teacher/requests/");
    return res.data;
  },

  async getHistory() {
    const res = await api.get("/sessions/teacher/history/");
    return res.data;
  },

  // ── Detail ──
  async getSessionDetail(id) {
    const res = await api.get(`/sessions/${id}/`);
    return res.data;
  },

  // ── Teacher actions ──
  async acceptRequest(id, data = {}) {
    const res = await api.post(`/sessions/${id}/accept/`, data);
    return res.data;
  },

  async declineRequest(id, reason = "") {
    const res = await api.post(`/sessions/${id}/decline/`, { reason });
    return res.data;
  },

  /**
   * Backend expects: { scheduled_date, scheduled_time, reason }
   * Frontend sends: { new_date, new_time, duration, note }
   * We map the fields here.
   */
  async rescheduleRequest(id, { new_date, new_time, duration, note = "" }) {
    const res = await api.post(`/sessions/${id}/reschedule/`, {
      scheduled_date: new_date,
      scheduled_time: new_time,
      reason: note,
    });
    return res.data;
  },

  async startSession(id) {
    const res = await api.post(`/sessions/${id}/start/`);
    return res.data;
  },

  async endSession(id, reason = "") {
    const res = await api.post(`/sessions/${id}/end/`, { reason });
    return res.data;
  },

  async cancelSession(id, reason = "") {
    const res = await api.post(`/sessions/${id}/cancel/`, { reason });
    return res.data;
  },

  // ── Aliases (PrivateRequestDetail.jsx uses these names) ──
  async acceptSession(id, data = {}) {
    const res = await api.post(`/sessions/${id}/accept/`, data);
    return res.data;
  },

  async declineSession(id, reason = "") {
    const res = await api.post(`/sessions/${id}/decline/`, { reason });
    return res.data;
  },

  async rescheduleSession(id, { new_date, new_time, duration, note = "" }) {
    const res = await api.post(`/sessions/${id}/reschedule/`, {
      scheduled_date: new_date,
      scheduled_time: new_time,
      reason: note,
    });
    return res.data;
  },

  // ── LiveKit — uses /join/ endpoint ──
  async getLiveKitToken(sessionId) {
    const res = await api.post(`/sessions/${sessionId}/join/`);
    return res.data;
  },

  // ── Availability (backend TBD) ──
  async getAvailability() {
    try {
      const res = await api.get("/sessions/teacher/availability/");
      return res.data;
    } catch {
      const defaults = {};
      ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach(d => { defaults[d] = []; });
      return defaults;
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

  // ── Constants (used by PrivateSessionAvailability.jsx) ──
  DAYS: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  SHORT_DAYS: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  TIME_SLOTS: [
    "9:00 AM – 11:00 AM",
    "11:00 AM – 1:00 PM",
    "2:00 PM – 4:00 PM",
    "4:00 PM – 6:00 PM",
    "6:00 PM – 8:00 PM",
  ],
};

export default privateSessionService;