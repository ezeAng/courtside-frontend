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

const normalizeTeam = (value, fallback) => {
  const normalized = typeof value === "string" ? value.trim().toUpperCase() : value;
  if (normalized === "A" || normalized === 1 || normalized === "1") return "A";
  if (normalized === "B" || normalized === 2 || normalized === "2") return "B";
  return fallback || "A";
};

const resolveAuthId = (player = {}) =>
  player.auth_id ||
  player.user_id ||
  player.id ||
  player.profile_id ||
  player.player_auth_id ||
  player.player_id ||
  player.user?.auth_id;

const resolveUsername = (player = {}, fallback) =>
  player.username ||
  player.display_name ||
  player.name ||
  player.user?.username ||
  player.user?.display_name ||
  fallback ||
  "Player";

const ensureInvitePlayers = (players = [], creatorInfo) => {
  const safePlayers = Array.isArray(players) ? players : [];
  const normalized = [];

  safePlayers.forEach((player, index) => {
    const authId = resolveAuthId(player);
    if (!authId) return;
    normalized.push({
      auth_id: authId,
      username: resolveUsername(player, `Player ${index + 1}`),
      team: normalizeTeam(player.team || player.team_side || player.side, index % 2 === 0 ? "A" : "B"),
    });
  });

  const creatorId =
    creatorInfo?.auth_id || creatorInfo?.user_id || creatorInfo?.id || creatorInfo?.profile_id;

  if (creatorId) {
    const hasCreator = normalized.some(
      (player) => String(player.auth_id) === String(creatorId)
    );

    if (!hasCreator) {
      const counts = normalized.reduce(
        (acc, player) => {
          if (player.team === "A") acc.A += 1;
          else if (player.team === "B") acc.B += 1;
          return acc;
        },
        { A: 0, B: 0 }
      );
      normalized.push({
        auth_id: creatorId,
        username: resolveUsername(creatorInfo, "You"),
        team: counts.A <= counts.B ? "A" : "B",
      });
    }
  }

  return normalized;
};

// BadgeCounts: { pending: number; invites: number }
export async function fetchBadgeCounts(token) {
  const response = await fetch(`${base}/api/matches/badge-counts`, {
    headers: requireAuthHeader(token),
  });
  return handleResponse(response);
}

// Invite: { match_id: string; status: "invite"; submitted_by: string; accepted_by?: string | null; created_at: string; players: { team_A?: Array<Player>; team_B?: Array<Player> } | Array<Player> }
export async function fetchInvites(token, type) {
  const response = await fetch(`${base}/api/matches/invites?type=${type}`, {
    headers: requireAuthHeader(token),
  });
  return handleResponse(response);
}

export async function acceptInvite(token, matchId) {
  const response = await fetch(`${base}/api/matches/${matchId}/accept`, {
    method: "POST",
    headers: requireAuthHeader(token),
  });
  return handleResponse(response);
}

export async function cancelInvite(token, matchId, reason) {
  const response = await fetch(`${base}/api/matches/${matchId}/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...requireAuthHeader(token),
    },
    body: JSON.stringify(reason ? { reason } : {}),
  });
  return handleResponse(response);
}

export async function createInvite(token, payload, creatorInfo) {
  const normalizedPlayers = ensureInvitePlayers(payload?.players, creatorInfo);
  if (!normalizedPlayers.length) {
    throw new Error("Invite must include at least one player.");
  }

  const response = await fetch(`${base}/api/matches/invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...requireAuthHeader(token),
    },
    body: JSON.stringify({
      mode: payload?.mode || payload?.discipline,
      players: normalizedPlayers,
    }),
  });
  return handleResponse(response);
}

export async function findMatch(token, mode) {
  const response = await fetch(`${base}/api/matchmaking/find`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...requireAuthHeader(token),
    },
    body: JSON.stringify({ mode }),
  });
  return handleResponse(response);
}

export async function findMatchSuggestions(token, mode) {
  const response = await fetch(`${base}/api/matchmaking/find`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...requireAuthHeader(token),
    },
    body: JSON.stringify({ mode }),
  });
  return handleResponse(response);
}

export async function leaveQueue(token, mode) {
  const response = await fetch(`${base}/api/matchmaking/leave`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...requireAuthHeader(token),
    },
    body: JSON.stringify({ mode }),
  });
  return handleResponse(response);
}

export default {
  fetchBadgeCounts,
  fetchInvites,
  acceptInvite,
  cancelInvite,
  createInvite,
  findMatch,
  findMatchSuggestions,
  leaveQueue,
};
