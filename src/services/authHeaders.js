import { getStoredToken } from "./storage";

export const optionalAuthHeader = (token) => {
  const finalToken = token || getStoredToken();
  return finalToken ? { Authorization: `Bearer ${finalToken}` } : {};
};

export const requireAuthHeader = (token) => {
  const header = optionalAuthHeader(token);
  if (!header.Authorization) {
    throw new Error("Authentication token missing");
  }
  return header;
};

