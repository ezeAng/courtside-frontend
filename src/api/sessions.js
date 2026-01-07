import { optionalAuthHeader, requireAuthHeader } from "../services/authHeaders";
import { getSessionId } from "../utils/sessionUtils";

const base = process.env.REACT_APP_BACKEND_URL;

async function handleResponse(response) {
  let payload = null;
  try {
    payload = await response.json();
  } catch (err) {
    // ignore parse errors for non-JSON responses
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error || "Failed to process request";
    const error = new Error(message);
    error.code = payload?.code;
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  if (response.status === 204) return null;
  return payload;
}

const extractSessions = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload?.sessions) return payload.sessions;
  if (payload?.suggested_sessions) return payload.suggested_sessions;
  if (payload?.suggestions) return payload.suggestions;
  if (payload?.items) return payload.items;
  return [];
};

const buildQueryString = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.available_only !== undefined) {
    params.set("available_only", filters.available_only);
  }
  if (filters.format) params.set("format", filters.format);
  if (filters.venue) params.set("venue", filters.venue);
  if (filters.date_from) params.set("date_from", filters.date_from);
  if (filters.date_to) params.set("date_to", filters.date_to);
  if (filters.hosted_by_me !== undefined) {
    params.set("hosted_by_me", filters.hosted_by_me);
  }
  if (filters.joined_by_me !== undefined) {
    params.set("joined_by_me", filters.joined_by_me);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

export async function fetchSessions(filters = {}, token) {
  const query = buildQueryString(filters);
  const response = await fetch(`${base}/api/sessions${query}`, {
    method: "GET",
    headers: optionalAuthHeader(token),
  });
  return handleResponse(response);
}

export async function fetchSuggestedSessions({ limit = 5 } = {}, token) {
  const params = new URLSearchParams();
  if (limit) params.set("limit", limit);
  const queryString = params.toString();
  const response = await fetch(
    `${base}/api/sessions/suggested${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
      headers: optionalAuthHeader(token),
    }
  );
  return handleResponse(response);
}

export async function fetchUpcomingSessionReminders({ limit = 2 } = {}, token) {
  const params = new URLSearchParams();
  if (limit) params.set("limit", limit);
  const queryString = params.toString();
  const response = await fetch(
    `${base}/api/sessions/reminders/upcoming${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
      headers: requireAuthHeader(token),
    }
  );
  return handleResponse(response);
}

export async function fetchMySessions(fromDate, toDate, token) {
  const baseFilters = {
    date_from: fromDate,
    date_to: toDate,
  };

  const [hostedPayload, joinedPayload] = await Promise.all([
    fetchSessions({ ...baseFilters, hosted_by_me: true }, token),
    fetchSessions({ ...baseFilters, joined_by_me: true }, token),
  ]);

  const hostedSessions = extractSessions(hostedPayload);
  const joinedSessions = extractSessions(joinedPayload);

  const mergedSessions = [];
  const seen = new Set();

  [...hostedSessions, ...joinedSessions].forEach((session) => {
    const sessionId = getSessionId(session);
    if (sessionId && !seen.has(sessionId)) {
      seen.add(sessionId);
      mergedSessions.push(session);
    }
  });

  return { sessions: mergedSessions };
}

export async function fetchSessionDetails(sessionId, token) {
  if (!sessionId) throw new Error("Session ID is required");
  const response = await fetch(`${base}/api/sessions/${sessionId}`, {
    method: "GET",
    headers: optionalAuthHeader(token),
  });
  return handleResponse(response);
}

export async function createSession(payload, token) {
  const response = await fetch(`${base}/api/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...requireAuthHeader(token),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function joinSession(sessionId, token) {
  if (!sessionId) throw new Error("Session ID is required");
  const response = await fetch(`${base}/api/sessions/${sessionId}/join`, {
    method: "POST",
    headers: requireAuthHeader(token),
  });
  return handleResponse(response);
}

export async function leaveSession(sessionId, token) {
  if (!sessionId) throw new Error("Session ID is required");
  const response = await fetch(`${base}/api/sessions/${sessionId}/leave`, {
    method: "POST",
    headers: requireAuthHeader(token),
  });
  return handleResponse(response);
}

export async function updateSession(sessionId, payload, token) {
  if (!sessionId) throw new Error("Session ID is required");
  const response = await fetch(`${base}/api/sessions/${sessionId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...requireAuthHeader(token),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function deleteSession(sessionId, token) {
  if (!sessionId) throw new Error("Session ID is required");
  const response = await fetch(`${base}/api/sessions/${sessionId}`, {
    method: "DELETE",
    headers: requireAuthHeader(token),
  });
  return handleResponse(response);
}
