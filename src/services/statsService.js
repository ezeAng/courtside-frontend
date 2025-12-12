const base = process.env.REACT_APP_BACKEND_URL;

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error || errorData.message || response.statusText;
    throw new Error(message);
  }
  return response.json();
}

const withAuth = (token) => ({
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export async function getEloSeries(range, token) {
  const response = await fetch(
    `${base}/api/stats/elo-series?range=${encodeURIComponent(range)}`,
    {
      method: "GET",
      headers: withAuth(token),
    }
  );

  return handleResponse(response);
}

export default {
  getEloSeries,
};
