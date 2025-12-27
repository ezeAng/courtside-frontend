import { requireAuthHeader } from "../services/authHeaders";

const base = process.env.REACT_APP_BACKEND_URL;

export async function getPendingMatches(token) {
  const res = await fetch(`${base}/api/matches/pending`, {
    headers: requireAuthHeader(token),
  });
  if (!res.ok) throw new Error("Failed to load pending matches");
  return res.json();
}

export async function confirmMatch(matchId, token) {
  const res = await fetch(`${base}/api/matches/${matchId}/confirm`, {
    method: "POST",
    headers: requireAuthHeader(token),
  });
  if (!res.ok) throw new Error("Failed to confirm match");
  return res.json();
}

export async function rejectMatch(matchId, token) {
  const res = await fetch(`${base}/api/matches/${matchId}/reject`, {
    method: "POST",
    headers: requireAuthHeader(token),
  });
  if (!res.ok) throw new Error("Failed to reject match");
  return res.json();
}

export async function editMatch(matchId, payload, token) {
  const res = await fetch(`${base}/api/matches/${matchId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...requireAuthHeader(token),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to edit match");
  return res.json();
}

export async function deleteMatch(matchId, token) {
  const res = await fetch(`${base}/api/matches/${matchId}`, {
    method: "DELETE",
    headers: requireAuthHeader(token),
  });
  if (!res.ok) throw new Error("Failed to delete match");
  if (res.status === 204) return null;
  return res.json();
}
