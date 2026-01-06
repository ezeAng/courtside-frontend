import { optionalAuthHeader, requireAuthHeader } from "../services/authHeaders";

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
