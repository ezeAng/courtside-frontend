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
  const rpcPayload = {
    p_name: payload?.p_name ?? payload?.name ?? "",
    p_description: payload?.p_description ?? payload?.description ?? "",
    p_emblem_url: payload?.p_emblem_url ?? payload?.emblem_url ?? "",
    p_visibility: payload?.p_visibility ?? payload?.visibility ?? "public",
    p_max_members: payload?.p_max_members ?? payload?.max_members ?? null,
    p_playing_cadence:
      payload?.p_playing_cadence ?? payload?.playing_cadence ?? payload?.cadence ?? null,
    p_usual_venues: payload?.p_usual_venues ?? payload?.usual_venues ?? null,
    p_contact_info: payload?.p_contact_info ?? payload?.contact_info ?? null,
  };
  const response = await fetch(`${base}/api/clubs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...requireAuthHeader(token),
    },
    body: JSON.stringify(rpcPayload),
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

export async function removeClubMember(clubId, userId, token) {
  if (!clubId || !userId) throw new Error("Club ID and user ID are required");
  const response = await fetch(`${base}/api/clubs/${clubId}/members/${userId}/remove`, {
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
  const payload = await handleResponse(response);
  const items = Array.isArray(payload) ? payload : payload?.sessions || payload?.items || [];
  return items.map((session) => {
    if (session?.start_time || session?.end_time) {
      return session;
    }
    const date = session?.session_date;
    const start = session?.session_time;
    const end = session?.session_end_time;
    if (!date || (!start && !end)) {
      return session;
    }
    const startTime = start ? `${date}T${start}` : null;
    const endTime = end ? `${date}T${end}` : null;
    return {
      ...session,
      start_time: session?.start_time || startTime,
      end_time: session?.end_time || endTime,
      venue: session?.venue || session?.venue_name || session?.hall || "",
    };
  });
}

export async function createClubSession(clubId, payload, token) {
  if (!clubId) throw new Error("Club ID is required");
  const sessionPayload = {
    title: payload?.title,
    description: payload?.description,
    format: payload?.format,
    capacity: payload?.capacity,
    session_date: payload?.session_date,
    session_time: payload?.session_time,
    session_end_time: payload?.session_end_time,
    venue_name: payload?.venue_name,
    hall: payload?.hall,
    court_number: payload?.court_number,
    min_elo: payload?.min_elo,
    max_elo: payload?.max_elo,
    is_public: payload?.is_public,
  };
  const body = Object.fromEntries(
    Object.entries(sessionPayload).filter(([, value]) => value !== undefined)
  );
  const response = await fetch(`${base}/api/clubs/${clubId}/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...requireAuthHeader(token),
    },
    body: JSON.stringify(body),
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
