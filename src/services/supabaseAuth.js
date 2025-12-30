const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

const RECOVERY_STORAGE_KEY = "supabase-password-recovery-session";

function ensureSupabaseConfig() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase environment variables are not set.");
  }
}

function normalizeHash(hash = "") {
  return hash.startsWith("#") ? hash.slice(1) : hash;
}

function parseRecoverySessionFromHash() {
  const params = new URLSearchParams(normalizeHash(window.location.hash));
  if (params.get("type") !== "recovery" || !params.get("access_token")) {
    return null;
  }

  const session = {
    access_token: params.get("access_token"),
    refresh_token: params.get("refresh_token"),
    expires_in: params.get("expires_in")
      ? Number(params.get("expires_in"))
      : null,
    token_type: params.get("token_type") || "bearer",
  };

  try {
    sessionStorage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    // If storage is unavailable we can still return the session for immediate use.
    console.warn("Unable to persist recovery session", error);
  }

  return session;
}

export function getRecoverySession() {
  try {
    const stored = sessionStorage.getItem(RECOVERY_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn("Unable to read stored recovery session", error);
  }

  return parseRecoverySessionFromHash();
}

export function subscribeToPasswordRecovery(callback) {
  const session = parseRecoverySessionFromHash();
  if (session) {
    callback("PASSWORD_RECOVERY", session);
  }

  const onHashChange = () => {
    const updatedSession = parseRecoverySessionFromHash();
    if (updatedSession) {
      callback("PASSWORD_RECOVERY", updatedSession);
    }
  };

  window.addEventListener("hashchange", onHashChange);

  return () => {
    window.removeEventListener("hashchange", onHashChange);
  };
}

async function handleSupabaseResponse(response) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      data?.msg ||
      data?.error_description ||
      data?.error ||
      response.statusText;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function requestPasswordResetEmail(
  email,
  { redirectTo } = {}
) {
  ensureSupabaseConfig();
  const response = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email, redirect_to: redirectTo }),
  });

  await handleSupabaseResponse(response);
  return {
    message: "If the account exists, a password reset email has been sent.",
  };
}

export async function updatePasswordWithRecoveryToken(newPassword) {
  ensureSupabaseConfig();
  const session = getRecoverySession();

  if (!session?.access_token) {
    throw new Error("Password recovery link is invalid or has expired.");
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ password: newPassword }),
  });

  await handleSupabaseResponse(response);
  return { message: "Password updated successfully." };
}

export function getPasswordResetRedirectUrl() {
  const redirect =
    process.env.REACT_APP_SUPABASE_REDIRECT_URL ||
    `${window.location.origin}/reset-password`;
  return redirect;
}
