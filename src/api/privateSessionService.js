/**
 * Private Session API Service — Teacher UI
 *
 * All methods hit the real backend. No mock data.
 * LiveKit tokens come from /api/private-sessions/<id>/join/
 * which reuses the existing livestream token generator.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body = null) {
  const opts = { method, headers: authHeaders() };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

// ──────────────────────────────────────────────
// Teacher session lists
// ──────────────────────────────────────────────

/** Approved + ongoing sessions */
export async function getSessions() {
  return request("GET", "/api/private-sessions/teacher/sessions/");
}

/** Pending student requests */
export async function getRequests() {
  return request("GET", "/api/private-sessions/teacher/requests/");
}

/** Completed / cancelled / declined history */
export async function getHistory() {
  return request("GET", "/api/private-sessions/teacher/history/");
}

// ──────────────────────────────────────────────
// Session detail
// ──────────────────────────────────────────────

export async function getSessionDetail(sessionId) {
  return request("GET", `/api/private-sessions/${sessionId}/`);
}

// ──────────────────────────────────────────────
// Teacher actions on requests
// ──────────────────────────────────────────────

export async function acceptRequest(sessionId, data = {}) {
  return request("POST", `/api/private-sessions/${sessionId}/accept/`, data);
}

export async function declineRequest(sessionId, reason = "") {
  return request("POST", `/api/private-sessions/${sessionId}/decline/`, { reason });
}

export async function rescheduleRequest(sessionId, data) {
  return request("POST", `/api/private-sessions/${sessionId}/reschedule/`, data);
}

// ──────────────────────────────────────────────
// Session lifecycle
// ──────────────────────────────────────────────

export async function startSession(sessionId) {
  return request("POST", `/api/private-sessions/${sessionId}/start/`);
}

export async function endSession(sessionId) {
  return request("POST", `/api/private-sessions/${sessionId}/end/`);
}

export async function cancelSession(sessionId, reason = "") {
  return request("POST", `/api/private-sessions/${sessionId}/cancel/`, { reason });
}

// ──────────────────────────────────────────────
// LiveKit — reuses existing livestream token infra
// ──────────────────────────────────────────────

/**
 * Get a LiveKit join token for this private session.
 * Returns { livekit_url, token, room, role }
 * Same response shape as the regular livestream join endpoint.
 */
export async function getLiveKitToken(sessionId) {
  return request("POST", `/api/private-sessions/${sessionId}/join/`);
}

// ──────────────────────────────────────────────
// Availability (placeholder — backend not yet built)
// ──────────────────────────────────────────────

export async function getAvailability() {
  try {
    return await request("GET", "/api/private-sessions/teacher/availability/");
  } catch {
    return {
      monday: [], tuesday: [], wednesday: [], thursday: [],
      friday: [], saturday: [], sunday: [],
    };
  }
}

export async function saveAvailability(availability) {
  try {
    return await request("POST", "/api/private-sessions/teacher/availability/", availability);
  } catch {
    console.warn("Availability endpoint not available yet.");
    return availability;
  }
}

export default {
  getSessions,
  getRequests,
  getHistory,
  getSessionDetail,
  acceptRequest,
  declineRequest,
  rescheduleRequest,
  startSession,
  endSession,
  cancelSession,
  getLiveKitToken,
  getAvailability,
  saveAvailability,
};
