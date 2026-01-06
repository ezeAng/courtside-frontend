import { getPlayerAuthId, getPlayerDisplayName } from "./matchPlayers";

export const getSessionId = (session) =>
  session?.session_id ?? session?.id ?? session?.session?.session_id ?? session?.session?.id;

export const getSessionDate = (session) =>
  session?.session_date || session?.date || session?.session?.session_date;

export const getSessionTime = (session) =>
  session?.session_time || session?.time || session?.session?.session_time;

export const getJoinedCount = (session) =>
  session?.joined_count ??
  session?.participants?.length ??
  session?.session?.joined_count ??
  session?.session?.participants?.length ??
  0;

export const getCapacity = (session) => session?.capacity ?? session?.session?.capacity ?? 0;

export const getSkillRange = (session) => {
  const min =
    session?.min_elo ??
    session?.skill_range?.min_elo ??
    session?.session?.min_elo ??
    session?.session?.skill_range?.min_elo;
  const max =
    session?.max_elo ??
    session?.skill_range?.max_elo ??
    session?.session?.max_elo ??
    session?.session?.skill_range?.max_elo;
  if (min === undefined && max === undefined) return null;
  return { min, max };
};

export const getHostAuthId = (session) =>
  session?.host_auth_id ?? session?.session?.host_auth_id ?? session?.host?.auth_id;

export const getFormatLabel = (format) => {
  const value = (format || "").toString().toLowerCase();
  if (!value || value === "any") return "Any";
  if (value === "doubles") return "Doubles";
  if (value === "mixed") return "Mixed";
  return "Singles";
};

export const formatDateTime = (date, time) => {
  if (!date || !time) return "Date & time TBD";
  const dateTime = new Date(`${date}T${time}`);
  const dateLabel = dateTime.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeLabel = dateTime.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${dateLabel} • ${timeLabel}`;
};

export const isWithin24Hours = (date, time) => {
  if (!date || !time) return false;
  const start = new Date(`${date}T${time}`);
  const now = new Date();
  const diff = start.getTime() - now.getTime();
  return diff <= 24 * 60 * 60 * 1000 && diff >= 0;
};

export const buildLocationLabel = (session) => {
  const courtNumber =
    session?.court_number ??
    session?.location?.court_number ??
    session?.session?.court_number ??
    session?.session?.location?.court_number;
  const parts = [
    session?.venue_name ??
      session?.location?.venue_name ??
      session?.session?.venue_name ??
      session?.session?.location?.venue_name,
    session?.hall ?? session?.location?.hall ?? session?.session?.hall ?? session?.session?.location?.hall,
    courtNumber ? `Court ${courtNumber}` : null,
  ].filter(Boolean);
  return parts.join(" • ");
};

export const normalizeSessionDetail = (detail) => {
  if (!detail) return null;
  if (detail.session) {
    const { session, participants } = detail;
    return {
      ...session,
      participants: participants ?? session.participants ?? [],
    };
  }
  return detail;
};

export const deriveRecordMatchPrefill = (session, currentUser) => {
  if (!session) return {};
  const participants = session.participants || [];
  const currentUserId = currentUser?.auth_id || currentUser?.id;
  const currentUserEntry =
    participants.find(
      (p) => getPlayerAuthId(p) && currentUserId && String(getPlayerAuthId(p)) === String(currentUserId)
    ) ||
    (currentUser
      ? {
          username: getPlayerDisplayName(currentUser),
          elo: currentUser.elo,
          auth_id: currentUserId,
        }
      : null);

  const others = participants.filter(
    (p) => !currentUserEntry || String(getPlayerAuthId(p)) !== String(getPlayerAuthId(currentUserEntry))
  );

  if (session.format === "singles") {
    const opponent = others[0] || session.host;
    return {
      initialSinglesValues: {
        opponent,
      },
      initialTab: 0,
    };
  }

  const [partner, opponent1, opponent2] = others;
  return {
    initialDoublesValues: {
      partner: partner || null,
      opponent1: opponent1 || null,
      opponent2: opponent2 || null,
    },
    initialTab: 1,
  };
};

export const combineSessionDateTime = (session) => {
  const date = getSessionDate(session);
  if (!date) return null;
  const time = getSessionTime(session) || "00:00";
  const dateTime = new Date(`${date}T${time}`);
  if (Number.isNaN(dateTime.getTime())) return null;
  return dateTime;
};

export const isSessionPast = (session, now = new Date()) => {
  const dateTime = combineSessionDateTime(session);
  if (!dateTime) return false;
  return dateTime.getTime() <= now.getTime();
};

export const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};
