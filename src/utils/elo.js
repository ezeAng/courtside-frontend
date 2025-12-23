export function getDisciplineFromMatch(match) {
  return match?.discipline || match?.match_type || match?.matchType || "singles";
}

export function getEloLabelForMode(mode) {
  return mode === "doubles" ? "Doubles Elo" : "Singles Elo";
}

export function getEloForMode(entity, mode, { fallback } = {}) {
  const singlesRatings = [
    entity?.elo,
    entity?.rating,
    entity?.current_elo,
    entity?.elo_rating,
    entity?.eloSingles,
  ];

  const doublesRatings = [
    entity?.elo_doubles,
    entity?.doubles_elo,
    entity?.eloDoubles,
    entity?.elo_dbl,
  ];

  const chosen =
    mode === "doubles"
      ? doublesRatings.find((v) => v !== undefined && v !== null) ??
        singlesRatings.find((v) => v !== undefined && v !== null)
      : singlesRatings.find((v) => v !== undefined && v !== null) ??
        doublesRatings.find((v) => v !== undefined && v !== null);

  if (chosen === undefined || chosen === null) {
    if (fallback !== undefined) return fallback;
    return null;
  }

  return chosen;
}

export function getEloDeltaForMode(update, mode) {
  const singlesDelta =
    update?.delta ?? update?.change ?? update?.elo_change ?? update?.eloDelta;
  const doublesDelta =
    update?.delta_doubles ?? update?.elo_change_doubles ?? update?.doubles_delta;

  if (mode === "doubles") {
    if (doublesDelta !== undefined && doublesDelta !== null) return doublesDelta;
    return singlesDelta;
  }

  if (singlesDelta !== undefined && singlesDelta !== null) return singlesDelta;
  return doublesDelta;
}
