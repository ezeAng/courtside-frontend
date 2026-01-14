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

export async function fetchClubs(token) {
  const response = await fetch(`${base}/api/clubs`, {
    method: "GET",
    headers: optionalAuthHeader(token),
  });
  return handleResponse(response);
}

export async function searchClubs(query, token) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  const response = await fetch(`${base}/api/clubs/search?${params.toString()}`, {
    method: "GET",
    headers: optionalAuthHeader(token),
  });
  return handleResponse(response);
}

export async function fetchClubDetails(clubId, token) {
  if (!clubId) throw new Error("Club ID is required");
  const response = await fetch(`${base}/api/clubs/${clubId}`, {
    method: "GET",
    headers: optionalAuthHeader(token),
  });
  return handleResponse(response);
}

export async function createClub(payload, token) {
  const response = await fetch(`${base}/api/clubs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...requireAuthHeader(token),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function updateClub(clubId, payload, token) {
  if (!clubId) throw new Error("Club ID is required");
  const response = await fetch(`${base}/api/clubs/${clubId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...requireAuthHeader(token),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function joinClub(clubId, token) {
  if (!clubId) throw new Error("Club ID is required");
  const response = await fetch(`${base}/api/clubs/${clubId}/join`, {
    method: "POST",
    headers: requireAuthHeader(token),
  });
  return handleResponse(response);
}

export async function leaveClub(clubId, token) {
  if (!clubId) throw new Error("Club ID is required");
  const response = await fetch(`${base}/api/clubs/${clubId}/leave`, {
    method: "POST",
    headers: requireAuthHeader(token),
  });
  return handleResponse(response);
}

export async function fetchClubRequests(clubId, token) {
  if (!clubId) throw new Error("Club ID is required");
  const response = await fetch(`${base}/api/clubs/${clubId}/requests`, {
    method: "GET",
    headers: requireAuthHeader(token),
  });
  return handleResponse(response);
}

export async function approveClubMember(clubId, userId, token) {
  if (!clubId || !userId) throw new Error("Club ID and user ID are required");
  const response = await fetch(`${base}/api/clubs/${clubId}/members/${userId}/approve`, {
    method: "POST",
    headers: requireAuthHeader(token),
  });
  return handleResponse(response);
}

export async function rejectClubMember(clubId, userId, token) {
  if (!clubId || !userId) throw new Error("Club ID and user ID are required");
  const response = await fetch(`${base}/api/clubs/${clubId}/members/${userId}/reject`, {
    method: "POST",
    headers: requireAuthHeader(token),
  });
  return handleResponse(response);
}

export async function fetchClubSessions(clubId, token) {
  if (!clubId) throw new Error("Club ID is required");
  const response = await fetch(`${base}/api/clubs/${clubId}/sessions`, {
    method: "GET",
    headers: requireAuthHeader(token),
  });
  return handleResponse(response);
}

export async function createClubSession(clubId, payload, token) {
  if (!clubId) throw new Error("Club ID is required");
  const response = await fetch(`${base}/api/clubs/${clubId}/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...requireAuthHeader(token),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function updateClubSession(sessionId, payload, token) {
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

export async function deleteClubSession(sessionId, token) {
  if (!sessionId) throw new Error("Session ID is required");
  const response = await fetch(`${base}/api/sessions/${sessionId}`, {
    method: "DELETE",
    headers: requireAuthHeader(token),
  });
  return handleResponse(response);
}

export async function fetchClubLeague(clubId, token) {
  if (!clubId) throw new Error("Club ID is required");
  const response = await fetch(`${base}/api/clubs/${clubId}/league`, {
    method: "GET",
    headers: requireAuthHeader(token),
  });
  return handleResponse(response);
}

export async function fetchMyClubs(token) {
  const response = await fetch(`${base}/api/me/clubs`, {
    method: "GET",
    headers: requireAuthHeader(token),
  });
  return handleResponse(response);
}
