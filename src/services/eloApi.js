export async function getEloSeries(token, range, eloType) {
  const res = await fetch("/api/elo/series", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      range,
      elo_type: eloType, // "singles" | "doubles" | "overall"
    }),
  });

  if (!res.ok) throw new Error("Failed to fetch elo series");
  return res.json();
}

export default {
  getEloSeries,
};
