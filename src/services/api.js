const base = process.env.REACT_APP_BACKEND_URL;

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error || errorData.message || response.statusText;
    throw new Error(message);
  }
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

const withAuth = (token) => ({
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export async function signup(email, password, username, gender) {
  const response = await fetch(`${base}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, username, gender }),
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

export async function getCurrentUser(token) {
  const response = await fetch(`${base}/api/users/me`, {
    headers: withAuth(token),
  });
  return handleResponse(response);
}

export async function updateProfile(token, profileData) {
  const response = await fetch(`${base}/api/users/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
  return handleResponse(response);
}

export async function deleteUser(token) {
  const response = await fetch(`${base}/api/users/me`, {
    method: "DELETE",
    headers: withAuth(token),
  });

  return handleResponse(response);
}

export async function getLeaderboard(gender, token) {
  const response = await fetch(`${base}/api/leaderboard/${gender}`, {
    headers: withAuth(token),
  });
  return handleResponse(response);
}

export async function searchUsersAutocomplete(query, token) {
  const response = await fetch(
    `${base}/api/users/search/autocomplete?query=${encodeURIComponent(query)}`,
    {
      headers: withAuth(token),
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
      headers: withAuth(token),
    }
  );
  return handleResponse(response);
}

export async function getOtherUsers(token) {
  const response = await fetch(`${base}/api/users/others`, {
    headers: withAuth(token),
  });
  return handleResponse(response);
}

export async function getMatchHistory(userId, token) {
  const response = await fetch(`${base}/api/matches/user/${userId}`, {
    headers: withAuth(token),
  });
  return handleResponse(response);
}

export async function getMatchDetail(matchId, token) {
  const response = await fetch(`${base}/api/matches/${matchId}`, {
    headers: withAuth(token),
  });
  return handleResponse(response);
}

export async function createMatch(payload, token) {
  const response = await fetch(`${base}/api/matches/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...withAuth(token),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function getRecentActivity(token) {
  const response = await fetch(`${base}/api/matches/recent`, {
    method: "GET",
    headers: withAuth(token),
  });
  return handleResponse(response);
}

export async function uploadAvatar(token, file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${base}/api/profile/upload-avatar`, {
    method: "POST",
    headers: withAuth(token),
    body: formData,
  });

  return handleResponse(response);
}

export async function getH2H(token) {
  const response = await fetch(`${base}/api/matches/h2h`, {
    method: "GET",
    headers: withAuth(token),
  });
  return handleResponse(response);
}

export async function getHomeStats(token) {
  const response = await fetch(`${base}/api/users/home-stats`, {
    method: "GET",
    headers: withAuth(token),
  });
  return handleResponse(response);
}

export async function getPlayerCardData(token) {
  const response = await fetch(`${base}/api/users/card-data`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
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
  createMatch,
  getRecentActivity,
  getH2H,
  getHomeStats,
  getPlayerCardData,
  uploadAvatar,
  deleteUser,
};
