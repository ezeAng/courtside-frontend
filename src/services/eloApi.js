import { requireAuthHeader } from "./authHeaders";

const base = process.env.REACT_APP_BACKEND_URL;

export async function getEloSeries(token, range = "1M", eloType = "overall") {
  const res = await fetch(
    `${base}/api/stats/elo-series?range=${encodeURIComponent(
      range
    )}&discipline=${encodeURIComponent(eloType)}`,
    {
      method: "GET",
      headers: requireAuthHeader(token),
    }
  );

  if (!res.ok) throw new Error("Failed to fetch elo series");
  return res.json();
}

export default {
  getEloSeries,
};
