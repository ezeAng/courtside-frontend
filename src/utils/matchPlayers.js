const normalizeTeamValue = (value) => {
  if (value === undefined || value === null) return null;
  const normalized = typeof value === "string" ? value.toUpperCase() : value;
  if (normalized === "A" || normalized === 1 || normalized === "1") return "A";
  if (normalized === "B" || normalized === 2 || normalized === "2") return "B";
  return null;
};

export const getPlayerAuthId = (player = {}) =>
  player.auth_id ||
  player.user_id ||
  player.id ||
  player.profile_id ||
  player.player_auth_id ||
  player.player_id ||
  player.user?.auth_id;

export const getPlayerDisplayName = (player = {}) => {
  const names = [
    player.username,
    player.display_name,
    player.name,
    player.user?.username,
    player.user?.display_name,
    player.player_name,
    player.player_username,
    player.email,
  ];

  return names.find(Boolean) || "Player";
};

export function normalizeMatchPlayers(rawPlayers) {
  const source =
    rawPlayers?.players ||
    rawPlayers?.match_players ||
    rawPlayers?.matchPlayers ||
    rawPlayers;

  const teamA = [];
  const teamB = [];

  const pushPlayer = (player, forcedTeam) => {
    if (!player) return;
    const teamValue =
      normalizeTeamValue(forcedTeam) ||
      normalizeTeamValue(player.team) ||
      normalizeTeamValue(player.team_side) ||
      normalizeTeamValue(player.side);

    const targetTeam =
      teamValue ||
      (teamA.length <= teamB.length ? "A" : "B");

    const normalizedPlayer = {
      ...player,
      auth_id: getPlayerAuthId(player),
      username: getPlayerDisplayName(player),
      team: targetTeam,
    };

    if (targetTeam === "B") {
      teamB.push(normalizedPlayer);
    } else {
      teamA.push(normalizedPlayer);
    }
  };

  const explicitTeams = [
    { key: "team_A", fallback: "A" },
    { key: "teamA", fallback: "A" },
    { key: "players_team_A", fallback: "A" },
    { key: "players_team_a", fallback: "A" },
    { key: "team_B", fallback: "B" },
    { key: "teamB", fallback: "B" },
    { key: "players_team_B", fallback: "B" },
    { key: "players_team_b", fallback: "B" },
  ];

  let usedExplicitTeams = false;

  explicitTeams.forEach(({ key, fallback }) => {
    const list = source?.[key];
    if (Array.isArray(list)) {
      usedExplicitTeams = true;
      list.forEach((player) => pushPlayer(player, fallback));
    }
  });

  if (!usedExplicitTeams && Array.isArray(source)) {
    source.forEach((player) => pushPlayer(player));
  }

  return { teamA, teamB };
}

export function buildInvitePlayers(teamA, teamB, creatorInfo) {
  const players = [];

  const push = (player, team) => {
    const authId = getPlayerAuthId(player);
    if (!authId) return;
    players.push({
      auth_id: authId,
      username: getPlayerDisplayName(player),
      team,
    });
  };

  teamA.forEach((player) => push(player, "A"));
  teamB.forEach((player) => push(player, "B"));

  const creatorId = creatorInfo?.auth_id;
  const hasCreator = creatorId
    ? players.some((p) => String(p.auth_id) === String(creatorId))
    : false;

  if (creatorId && !hasCreator) {
    const targetTeam = teamA.length <= teamB.length ? "A" : "B";
    players.push({
      auth_id: creatorId,
      username: creatorInfo?.username || "You",
      team: targetTeam,
    });
  }

  return players;
}

export function formatTeamNames(team, currentUserId) {
  return team
    .map((player) =>
      player?.auth_id && currentUserId && String(player.auth_id) === String(currentUserId)
        ? "You"
        : getPlayerDisplayName(player)
    )
    .join(" & ");
}
