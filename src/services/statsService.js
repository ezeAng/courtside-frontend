import { requireAuthHeader } from "./authHeaders";

const base = process.env.REACT_APP_BACKEND_URL;

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.error || data.message || response.statusText;
    throw new Error(message);
  }

  return data;
}

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

  const response = await fetch(`${base}/api/stats/elo-series?${params.toString()}`, {
    method: "GET",
    headers: requireAuthHeader(token),
  });

  return handleResponse(response);
}

export default {
  getEloSeries,
};
