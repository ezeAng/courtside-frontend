import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import FormLabel from "@mui/material/FormLabel";
import Alert from "@mui/material/Alert";
import { recordMatch } from "../../features/matches/matchSlice";
import ScoreSetsInput from "./ScoreSetsInput";
import { formatSetsScore } from "./scoreFormatting";
import { areSetsWithinRange, determineOutcomeFromSets } from "./scoreValidation";
import PlayerSearchAutocomplete from "../../components/PlayerSearchAutocomplete";

function DoublesForm({
  onRecorded,
  onClose,
  open,
  initialValues,
  submitLabel = "Record Match",
  onSubmit,
}) {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.user);
  const userId = currentUser?.auth_id;

  const [partner, setPartner] = useState(initialValues?.partner || null);
  const [opponent1, setOpponent1] = useState(initialValues?.opponent1 || null);
  const [opponent2, setOpponent2] = useState(initialValues?.opponent2 || null);
  const resolvedInitialSets = useMemo(() => {
    if (Array.isArray(initialValues?.sets) && initialValues.sets.length > 0) {
      return initialValues.sets.map((set) => ({
        your: set?.your ?? "",
        opponent: set?.opponent ?? "",
      }));
    }
    return [{ your: "", opponent: "" }];
  }, [initialValues]);
  const [sets, setSets] = useState(resolvedInitialSets);
  const [winnerTeam, setWinnerTeam] = useState("");
  const [error, setError] = useState(null);

  const autoWinner = useMemo(
    () => determineOutcomeFromSets(sets),
    [sets]
  );

  const allPlayerIds = useMemo(() => {
    const ids = [
      userId,
      partner?.auth_id || partner?.id,
      opponent1?.auth_id || opponent1?.id,
      opponent2?.auth_id || opponent2?.id,
    ].filter(Boolean);
    return new Set(ids.map(String));
  }, [userId, partner, opponent1, opponent2]);

  const isValid = useMemo(
    () =>
      partner &&
      opponent1 &&
      opponent2 &&
      autoWinner &&
      areSetsWithinRange(sets) &&
      allPlayerIds.size === 4,
    [partner, opponent1, opponent2, autoWinner, sets, allPlayerIds]
  );

  useEffect(() => {
    const desiredWinner = autoWinner || "";
    if (desiredWinner !== winnerTeam) {
      setWinnerTeam(desiredWinner);
    }
  }, [autoWinner, winnerTeam]);

  useEffect(() => {
    if (open) {
      setPartner(initialValues?.partner || null);
      setOpponent1(initialValues?.opponent1 || null);
      setOpponent2(initialValues?.opponent2 || null);
      setSets(resolvedInitialSets);
      setWinnerTeam("");
      setError(null);
    }
  }, [open, initialValues, resolvedInitialSets]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isValid) return;

    try {
      if (!winnerTeam) {
        setError("Enter valid set scores to determine the result automatically");
        return;
      }

      const formattedScore = formatSetsScore(sets);
      const winnerToSubmit = winnerTeam === "draw" ? null : winnerTeam;

      const payload = {
        discipline: "doubles",
        match_type: "doubles",
        players_team_A: [
          userId,
          partner.auth_id || partner.id,
        ],
        players_team_B: [
          opponent1.auth_id || opponent1.id,
          opponent2.auth_id || opponent2.id,
        ],
        score: formattedScore,
        winner_team: winnerToSubmit,
      };

      const result = onSubmit
        ? await onSubmit(payload)
        : await dispatch(recordMatch(payload)).unwrap();

      onRecorded?.(result);
      onClose?.();
    } catch (err) {
      setError(err.message || "Failed to record match");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

        <PlayerSearchAutocomplete
          label="Partner"
          value={partner}
          onSelect={setPartner}
          excludeAuthId={userId}
          helperText="Select your doubles partner"
        />

        <PlayerSearchAutocomplete
          label="Opponent 1"
          value={opponent1}
          onSelect={setOpponent1}
          excludeAuthId={userId}
          helperText="Select first opponent"
        />

        <PlayerSearchAutocomplete
          label="Opponent 2"
          value={opponent2}
          onSelect={setOpponent2}
          excludeAuthId={userId}
          helperText="Select second opponent"
        />

        {allPlayerIds.size < 4 &&
          (partner || opponent1 || opponent2) && (
            <Alert severity="warning">
              All four players must be unique.
            </Alert>
          )}

        <ScoreSetsInput sets={sets} onChange={setSets} />

        <Stack spacing={1}>
          <FormLabel>Result</FormLabel>
          {winnerTeam ? (
            <Alert severity="info">
              {winnerTeam === "draw"
                ? "The match will be recorded as a draw."
                : winnerTeam === "A"
                ? "Winner: Team A (You + Partner)"
                : "Winner: Team B (Opponents)"}
            </Alert>
          ) : (
            <Alert severity="warning">
              Enter complete set scores to determine the result.
            </Alert>
          )}
        </Stack>

        <Button type="submit" variant="contained" disabled={!isValid}>
          {submitLabel}
        </Button>
      </Stack>
    </form>
  );
}

export default DoublesForm;
