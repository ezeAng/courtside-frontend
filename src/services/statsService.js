import { requireAuthHeader } from "./authHeaders";

const base = process.env.REACT_APP_BACKEND_URL;

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error || errorData.message || response.statusText;
    throw new Error(message);
  }
  return response.json();
}

export async function getEloSeries(token, range = "1M", discipline = "singles") {
  const response = await fetch(
    `${base}/api/stats/elo-series?range=${encodeURIComponent(
      range
    )}&discipline=${encodeURIComponent(discipline)}`,
    {
      method: "GET",
      headers: requireAuthHeader(token),
    }
  );

  return handleResponse(response);
}

export default {
  getEloSeries,
};
