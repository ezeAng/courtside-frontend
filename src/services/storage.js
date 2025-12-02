export const ACCESS_TOKEN_KEY = "courtside_access_token";

export const getStoredToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
};

export const clearStoredToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};
