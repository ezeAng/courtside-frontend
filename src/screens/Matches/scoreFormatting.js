export const formatSetsScore = (sets) =>
  sets
    .map(({ your, opponent }) => `${your}-${opponent}`)
    .join(", ");
