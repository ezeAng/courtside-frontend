const base = process.env.REACT_APP_BACKEND_URL;

export async function getPendingMatches(token) {
  const res = await fetch(`${base}/api/matches/pending`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load pending matches");
  return res.json();
}

export async function confirmMatch(matchId, token) {
  const res = await fetch(`${base}/api/matches/${matchId}/confirm`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to confirm match");
  return res.json();
}

export async function rejectMatch(matchId, token) {
  const res = await fetch(`${base}/matches/${matchId}/reject`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to reject match");
  return res.json();
}
