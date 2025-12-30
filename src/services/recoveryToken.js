const RECOVERY_STORAGE_KEY = "password-recovery-access-token";

function normalizeHash(hash = "") {
  return hash.startsWith("#") ? hash.slice(1) : hash;
}

function persistToken(token) {
  try {
    sessionStorage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(token));
  } catch (error) {
    console.warn("Unable to persist recovery token", error);
  }
}

function parseRecoveryTokenFromHash() {
  const params = new URLSearchParams(normalizeHash(window.location.hash));

  if (params.get("type") !== "recovery" || !params.get("access_token")) {
    return null;
  }

  const token = {
    accessToken: params.get("access_token"),
    refreshToken: params.get("refresh_token"),
    expiresIn: params.get("expires_in")
      ? Number(params.get("expires_in"))
      : null,
    tokenType: params.get("token_type") || "bearer",
  };

  persistToken(token);
  return token;
}

export function getRecoveryToken() {
  try {
    const stored = sessionStorage.getItem(RECOVERY_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn("Unable to read stored recovery token", error);
  }

  return parseRecoveryTokenFromHash();
}

export function subscribeToRecoveryToken(callback) {
  const token = parseRecoveryTokenFromHash();
  if (token) {
    callback(token);
  }

  const onHashChange = () => {
    const updatedToken = parseRecoveryTokenFromHash();
    if (updatedToken) {
      callback(updatedToken);
    }
  };

  window.addEventListener("hashchange", onHashChange);

  return () => {
    window.removeEventListener("hashchange", onHashChange);
  };
}
