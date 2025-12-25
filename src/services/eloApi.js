import { requireAuthHeader } from "./authHeaders";

const base = process.env.REACT_APP_BACKEND_URL;

export async function getEloSeries(
  token,
  range = "1M",
  eloType = "overall",
  timezone
) {
  const params = new URLSearchParams();
  if (range) params.set("range", range);
  if (eloType) params.set("elo_type", eloType);
  if (timezone) params.set("tz", timezone);

  const res = await fetch(`${base}/api/stats/elo-series?${params.toString()}`, {
    method: "GET",
    headers: requireAuthHeader(token),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.error || data.message || "Failed to fetch elo series";
    throw new Error(message);
  }

  return data;
}

export default {
  getEloSeries,
};
