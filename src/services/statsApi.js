import { requireAuthHeader } from "./authHeaders";

const base = process.env.REACT_APP_BACKEND_URL;

async function handleResponse(response) {
  if (!response.ok) {
    throw new Error("Failed to fetch overall rank");
  }

  return response.json();
}

export async function getOverallRank(token) {
  const res = await fetch(`${base}/api/users/me/overall-rank`, {
    headers: requireAuthHeader(token),
  });

  return handleResponse(res);
}

export default {
  getOverallRank,
};
