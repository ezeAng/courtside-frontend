const base = process.env.REACT_APP_BACKEND_URL;

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || response.statusText;
    throw new Error(message);
  }
  return response.json();
}

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
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(response);
}

export async function getLeaderboard(gender) {
  const response = await fetch(`${base}/api/leaderboard/${gender}`);
  return handleResponse(response);
}

export default {
  signup,
  login,
  getCurrentUser,
  getLeaderboard,
};
