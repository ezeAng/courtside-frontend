import { optionalAuthHeader, requireAuthHeader } from "./authHeaders";

const base = process.env.REACT_APP_BACKEND_URL;

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error || errorData.message || response.statusText;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export async function signup(email, password, username, gender, seedElo) {
  const payload = { email, password, username, gender };

  if (typeof seedElo === "number") {
    payload.seed_elo = seedElo;
  }

  const response = await fetch(`${base}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function login(email, password) {
  const response = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
}

export async function resendConfirmationEmail(email) {
  const response = await fetch(`${base}/api/auth/resend-confirmation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
}

export async function requestPasswordReset(emailOrUsername) {
  const payload =
    typeof emailOrUsername === "object" && emailOrUsername !== null
      ? emailOrUsername
      : { email: emailOrUsername, username: emailOrUsername };

  const response = await fetch(`${base}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function resetPassword(password, recoveryAccessToken) {
  if (!recoveryAccessToken) {
    throw new Error("Password recovery link is invalid or has expired.");
  }

  const response = await fetch(`${base}/api/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${recoveryAccessToken}`,
    },
    body: JSON.stringify({ password }),
  });

  return handleResponse(response);
}

export async function getCurrentUser(token) {
  const response = await fetch(`${base}/api/users/me`, {
    headers: requireAuthHeader(token),
  });
  return handleResponse(response);
}

export async function updateProfile(token, profileData) {
  const response = await fetch(`${base}/api/users/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...requireAuthHeader(token),
    },
    body: JSON.stringify(profileData),
  });
  return handleResponse(response);
}

export async function deleteUser(token) {
  const response = await fetch(`${base}/api/users/me`, {
    method: "DELETE",
    headers: requireAuthHeader(token),
  });

  return handleResponse(response);
}

export async function getLeaderboard(gender, token, discipline = "singles") {
  const params = new URLSearchParams();
  if (discipline) params.set("discipline", discipline);

  const response = await fetch(
    `${base}/api/leaderboard/${gender}?${params.toString()}`,
    {
      headers: optionalAuthHeader(token),
    }
  );

  const payload = await handleResponse(response);
  const leaders =
    payload?.leaders ||
    payload?.items ||
    (Array.isArray(payload) ? payload : []);

  return { ...payload, leaders };
}

export async function getOverallLeaderboard(
  token,
  { limit = 100, offset = 0 } = {}
) {
  const params = new URLSearchParams();
  if (limit !== undefined && limit !== null) params.set("limit", limit);
  if (offset !== undefined && offset !== null) params.set("offset", offset);

  const response = await fetch(
    `${base}/api/leaderboard/overall?${params.toString()}`,
    {
      headers: optionalAuthHeader(token),
    }
  );

  const payload = await handleResponse(response);
  const leaders =
    payload?.items ||
    payload?.leaders ||
    (Array.isArray(payload) ? payload : []);

  return {
    ...payload,
    leaders,
    limit: payload?.limit ?? (limit !== undefined ? Number(limit) : undefined),
    offset:
      payload?.offset ?? (offset !== undefined ? Number(offset) : undefined),
  };
}

export async function getSinglesLeaderboard(token) {
  return getLeaderboard("mixed", token, "singles");
}

export async function getDoublesLeaderboard(token) {
  return getLeaderboard("mixed", token, "doubles");
}

export async function searchUsersAutocomplete(query, token) {
  const response = await fetch(
    `${base}/api/users/search/autocomplete?query=${encodeURIComponent(query)}`,
    {
      headers: requireAuthHeader(token),
    }
  );
  const payload = await handleResponse(response);
  const results =
    payload?.results ||
    payload?.users ||
    payload?.data ||
    payload;

  return Array.isArray(results) ? results : [];
}

export async function getUserProfile(username, token) {
  const response = await fetch(
    `${base}/api/users/search/profile?username=${encodeURIComponent(username)}`,
    {
      headers: requireAuthHeader(token),
    }
  );
  return handleResponse(response);
}

export async function getOtherUsers(token) {
  const response = await fetch(`${base}/api/users/others`, {
    headers: requireAuthHeader(token),
  });
  return handleResponse(response);
}

export async function getMatchHistory(userId, token) {
  const response = await fetch(`${base}/api/matches/user/${userId}`, {
    headers: requireAuthHeader(token),
  });
  return handleResponse(response);
}

export async function getMatchDetail(matchId, token) {
  const response = await fetch(`${base}/api/matches/${matchId}`, {
    headers: requireAuthHeader(token),
  });
  return handleResponse(response);
}

export async function addMatchVideo(matchId, videoLink, token) {
  const response = await fetch(`${base}/api/matches/${matchId}/video`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...requireAuthHeader(token),
    },
    body: JSON.stringify({ video_link: videoLink }),
  });
  return handleResponse(response);
}

export async function createMatch(payload, token) {
  const response = await fetch(`${base}/api/matches/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...requireAuthHeader(token),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function getRecentActivity(token) {
  const response = await fetch(`${base}/api/matches/recent`, {
    method: "GET",
    headers: requireAuthHeader(token),
  });
  return handleResponse(response);
}

export async function searchUsers(query, token) {
  const params = new URLSearchParams();
  if (query) params.set("query", query);

  const response = await fetch(
    `${base}/api/users/search?${params.toString()}`,
    {
      headers: requireAuthHeader(token),
    }
  );

  const payload = await handleResponse(response);
  return (
    payload?.results ||
    payload?.users ||
    payload?.data ||
    (Array.isArray(payload) ? payload : [])
  );
}

export async function fetchRecommendedPlayers(filters = {}, token) {
  const params = new URLSearchParams();
  if (filters.gender) params.set("gender", filters.gender);
  if (filters.mode) params.set("mode", filters.mode);
  if (filters.region) params.set("region", filters.region);

  const response = await fetch(
    `${base}/api/users/recommended?${params.toString()}`,
    {
      headers: requireAuthHeader(token),
    }
  );

  const payload = await handleResponse(response);
  return (
    payload?.results ||
    payload?.users ||
    payload?.data ||
    (Array.isArray(payload) ? payload : [])
  );
}

export async function sendConnectionRequest(authId, token) {
  const response = await fetch(`${base}/api/connections/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...requireAuthHeader(token),
    },
    body: JSON.stringify({ receiver_auth_id: authId }),
  });

  return handleResponse(response);
}

export async function cancelConnectionRequest(requestId, token) {
  const response = await fetch(`${base}/api/connections/request/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...requireAuthHeader(token),
    },
    body: JSON.stringify({ request_id: requestId }),
  });

  return handleResponse(response);
}

export async function acceptConnectionRequest(requestId, token) {
  const response = await fetch(`${base}/api/connections/request/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...requireAuthHeader(token),
    },
    body: JSON.stringify({ request_id: requestId }),
  });

  return handleResponse(response);
}

export async function fetchIncomingRequests(token) {
  const response = await fetch(`${base}/api/connections/requests/incoming`, {
    method: "GET",
    headers: requireAuthHeader(token),
  });
  let res = handleResponse(response);
  return res;
}

export async function fetchOutgoingRequests(token) {
  const response = await fetch(`${base}/api/connections/requests/outgoing`, {
    method: "GET",
    headers: requireAuthHeader(token),
  });
  let res = handleResponse(response);
  return res;
}

export async function fetchConnections(token) {
  const response = await fetch(`${base}/api/connections`, {
    method: "GET",
    headers: requireAuthHeader(token),
  });

  return handleResponse(response);
}

export async function fetchUserContact(authId, token) {
  const response = await fetch(`${base}/api/users/${authId}/contact`, {
    method: "GET",
    headers: requireAuthHeader(token),
  });

  return handleResponse(response);
}

export async function uploadAvatar(token, file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${base}/api/profile/upload-avatar`, {
    method: "POST",
    headers: requireAuthHeader(token),
    body: formData,
  });

  return handleResponse(response);
}

export async function getH2H(token) {
  const response = await fetch(`${base}/api/matches/h2h`, {
    method: "GET",
    headers: requireAuthHeader(token),
  });
  return handleResponse(response);
}

export async function getHomeStats(token) {
  const response = await fetch(`${base}/api/users/home-stats`, {
    method: "GET",
    headers: requireAuthHeader(token),
  });
  return handleResponse(response);
}

export async function getPlayerCardData(token, targetAuthId) {
  const query = targetAuthId ? `?auth_id=${encodeURIComponent(targetAuthId)}` : "";
  const response = await fetch(`${base}/api/users/card-data${query}`, {
    method: "GET",
    headers: requireAuthHeader(token),
  });

  return handleResponse(response);
}

export default {
  signup,
  login,
  getCurrentUser,
  updateProfile,
  getLeaderboard,
  searchUsersAutocomplete,
  getUserProfile,
  getOtherUsers,
  getMatchHistory,
  getMatchDetail,
  addMatchVideo,
  createMatch,
  getRecentActivity,
  getH2H,
  getHomeStats,
  getOverallLeaderboard,
  getSinglesLeaderboard,
  getDoublesLeaderboard,
  getPlayerCardData,
  uploadAvatar,
  resendConfirmationEmail,
  requestPasswordReset,
  deleteUser,
  resetPassword,
  searchUsers,
  fetchRecommendedPlayers,
  sendConnectionRequest,
  cancelConnectionRequest,
  acceptConnectionRequest,
  fetchIncomingRequests,
  fetchOutgoingRequests,
  fetchConnections,
  fetchUserContact,
};
