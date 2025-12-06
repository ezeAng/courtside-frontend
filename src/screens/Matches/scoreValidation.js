export const MIN_SCORE = 0;
export const MAX_SCORE = 30;

export const areSetsWithinRange = (sets) =>
  Array.isArray(sets) &&
  sets.length >= 1 &&
  sets.length <= 3 &&
  sets.every((set) => isValidScoreValue(set.your) && isValidScoreValue(set.opponent));

export const doesWinnerAlignWithScores = (sets, winnerTeam) => {
  if (!winnerTeam) return false;

  if (sets.length === 2) {
    return true;
  }

  const setWinners = sets.map((set) => {
    const yourScore = Number(set.your);
    const opponentScore = Number(set.opponent);

    if (Number.isNaN(yourScore) || Number.isNaN(opponentScore) || yourScore === opponentScore) {
      return null;
    }

    return yourScore > opponentScore ? "A" : "B";
  });

  if (setWinners.includes(null)) {
    return false;
  }

  if (sets.length === 1) {
    return setWinners[0] === winnerTeam;
  }

  if (sets.length === 3) {
    const winsA = setWinners.filter((winner) => winner === "A").length;
    const winsB = setWinners.length - winsA;

    if (winsA === winsB) {
      return false;
    }

    const winningTeam = winsA > winsB ? "A" : "B";
    return winningTeam === winnerTeam;
  }

  return true;
};

function isValidScoreValue(value) {
  if (value === "" || value === null || value === undefined) return false;
  const numericValue = Number(value);

  return (
    Number.isInteger(numericValue) && numericValue >= MIN_SCORE && numericValue <= MAX_SCORE
  );
}
