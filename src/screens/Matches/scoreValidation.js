export const MIN_SCORE = 0;
export const MAX_SCORE = 30;

export const areSetsWithinRange = (sets) =>
  Array.isArray(sets) &&
  sets.length >= 1 &&
  sets.length <= 3 &&
  sets.every((set) => isValidScoreValue(set.your) && isValidScoreValue(set.opponent));

export const determineOutcomeFromSets = (sets) => {
  if (!areSetsWithinRange(sets)) return null;

  const setResults = sets.map((set) => {
    const yourScore = Number(set.your);
    const opponentScore = Number(set.opponent);

    if (Number.isNaN(yourScore) || Number.isNaN(opponentScore) || yourScore === opponentScore) {
      return null;
    }

    const winner = yourScore > opponentScore ? "A" : "B";
    return {
      winner,
      margin: Math.abs(yourScore - opponentScore),
    };
  });

  if (setResults.some((result) => result === null)) {
    return null;
  }

  const winsA = setResults.filter((result) => result.winner === "A").length;
  const winsB = setResults.length - winsA;

  if (setResults.length === 1) {
    return setResults[0].winner;
  }

  if (setResults.length === 2) {
    if (winsA === 2) return "A";
    if (winsB === 2) return "B";

    const [firstSet, secondSet] = setResults;

    if (firstSet.margin === secondSet.margin && winsA === 1 && winsB === 1) {
      return "draw";
    }

    const totalYourScore = sets.reduce((total, set) => total + Number(set.your), 0);
    const totalOpponentScore = sets.reduce((total, set) => total + Number(set.opponent), 0);

    if (totalYourScore === totalOpponentScore) {
      return "draw";
    }

    return totalYourScore > totalOpponentScore ? "A" : "B";
  }

  if (setResults.length === 3) {
    if (winsA === winsB) {
      return null;
    }

    return winsA > winsB ? "A" : "B";
  }

  return null;
};

export const doesWinnerAlignWithScores = (sets, winnerTeam) => {
  if (!winnerTeam) return false;

  const outcome = determineOutcomeFromSets(sets);

  return outcome === winnerTeam;
};

function isValidScoreValue(value) {
  if (value === "" || value === null || value === undefined) return false;
  const numericValue = Number(value);

  return (
    Number.isInteger(numericValue) && numericValue >= MIN_SCORE && numericValue <= MAX_SCORE
  );
}
