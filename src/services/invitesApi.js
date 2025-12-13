const base = process.env.REACT_APP_BACKEND_URL;

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error || errorData.message || response.statusText;
    throw new Error(message);
  }
  return response.json();
}

const withAuth = (token) => ({
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

// BadgeCounts: { pending: number; invites: number }
export async function fetchBadgeCounts(token) {
  const response = await fetch(`${base}/api/matches/badge-counts`, {
    headers: withAuth(token),
  });
  return handleResponse(response);
}

// Invite: { match_id: string; status: "invite"; created_by: string; accepted_by?: string | null; created_at: string; players: Array<{ auth_id: string; username: string; team: 1 | 2 }> }
export async function fetchInvites(token, type) {
  const response = await fetch(`${base}/api/matches/invites?type=${type}`, {
    headers: withAuth(token),
  });
  return handleResponse(response);
}

export async function acceptInvite(token, matchId) {
  const response = await fetch(`${base}/api/matches/${matchId}/accept`, {
    method: "POST",
    headers: withAuth(token),
  });
  return handleResponse(response);
}

export async function cancelInvite(token, matchId, reason) {
  const response = await fetch(`${base}/api/matches/${matchId}/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...withAuth(token),
    },
    body: JSON.stringify(reason ? { reason } : {}),
  });
  return handleResponse(response);
}

export async function createInvite(token, payload) {
  const response = await fetch(`${base}/api/matches/invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...withAuth(token),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function findMatch(token, mode) {
  const response = await fetch(`${base}/api/matchmaking/find`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...withAuth(token),
    },
    body: JSON.stringify({ mode }),
  });
  return handleResponse(response);
}

export async function leaveQueue(token, mode) {
  const response = await fetch(`${base}/api/matchmaking/leave`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...withAuth(token),
    },
    body: JSON.stringify({ mode }),
  });
  return handleResponse(response);
}

export default {
  fetchBadgeCounts,
  fetchInvites,
  acceptInvite,
  cancelInvite,
  createInvite,
  findMatch,
  leaveQueue,
};
