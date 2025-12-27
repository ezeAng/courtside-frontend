export const formatSetsScore = (sets) =>
  sets
    .map(({ your, opponent }) => `${your}-${opponent}`)
    .join(", ");

export const parseScoreToSets = (scoreString) => {
  if (!scoreString || typeof scoreString !== "string") return [];

  const parseValue = (value) => {
    if (value === undefined || value === null || value === "") return "";
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : "";
  };

  return scoreString
    .split(",")
    .map((part) => part.trim())
    .map((setString) => {
      const [teamA, teamB] = setString.split("-").map((val) => val?.trim());
      return {
        teamA: parseValue(teamA),
        teamB: parseValue(teamB),
      };
    })
    .filter((set) => set.teamA !== "" || set.teamB !== "");
};
