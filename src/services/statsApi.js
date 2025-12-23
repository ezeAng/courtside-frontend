const base = process.env.REACT_APP_BACKEND_URL;

async function handleResponse(response) {
  if (!response.ok) {
    throw new Error("Failed to fetch overall rank");
  }

  return response.json();
}

const withAuth = (token) => ({
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export async function getOverallRank(token) {
  const res = await fetch(`${base}/api/users/me/overall-rank`, {
    headers: withAuth(token),
  });

  return handleResponse(res);
}

export default {
  getOverallRank,
};
