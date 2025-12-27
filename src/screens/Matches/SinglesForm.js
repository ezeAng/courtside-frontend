import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "@mui/material/Button";
import PlayerSearchAutocomplete from "../../components/PlayerSearchAutocomplete";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import FormLabel from "@mui/material/FormLabel";
import Alert from "@mui/material/Alert";
import { recordMatch } from "../../features/matches/matchSlice";
import ScoreSetsInput from "./ScoreSetsInput";
import { formatSetsScore } from "./scoreFormatting";
import { areSetsWithinRange, determineOutcomeFromSets } from "./scoreValidation";
import LoadingSpinner from "../../components/LoadingSpinner";

function SinglesForm({ onRecorded, onClose, open, initialValues }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.accessToken);
  const currentUser = useSelector((state) => state.user.user);
  const [selectedOpponent, setSelectedOpponent] = useState(
    initialValues?.opponent || null
  );

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
  const userId = currentUser?.auth_id;

  const autoWinner = useMemo(() => determineOutcomeFromSets(sets), [sets]);

  const isValid = useMemo(
    () =>
      selectedOpponent &&
      autoWinner &&
      areSetsWithinRange(sets),
    [selectedOpponent, autoWinner, sets]
  );


  useEffect(() => {
    const desiredWinner = autoWinner || "";
    if (desiredWinner !== winnerTeam) {
      setWinnerTeam(desiredWinner);
    }
  }, [autoWinner, winnerTeam]);

  useEffect(() => {
    if (open) {
      setSelectedOpponent(initialValues?.opponent || null);
      setSets(resolvedInitialSets);
      setWinnerTeam("");
      setError(null);
    }
  }, [open, initialValues, resolvedInitialSets]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedOpponent || !userId) return;

    const opponentAuthId =
      selectedOpponent.auth_id ||
      selectedOpponent.user_id ||
      selectedOpponent.id;

    if (!opponentAuthId) {
      setError("Please select a valid opponent");
      return;
    }

    if (String(opponentAuthId) === String(userId)) {
      setError("You cannot select yourself as the opponent");
      return;
    }

    if (!areSetsWithinRange(sets)) {
      setError("Scores must be between 0 and 30 for each set");
      return;
    }

    if (!winnerTeam) {
      setError("Enter valid set scores to determine the result automatically");
      return;
    }

    try {
      const formattedScore = formatSetsScore(sets);
      const winnerToSubmit = winnerTeam === "draw" ? null : winnerTeam;

      const recordedMatch = await dispatch(
        recordMatch({
          discipline: "singles",
          match_type: "singles",
          players_team_A: [userId],
          players_team_B: [opponentAuthId],
          score: formattedScore,
          winner_team: winnerToSubmit,
        })
      ).unwrap();

      onRecorded?.(recordedMatch);
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
          value={selectedOpponent}
          onSelect={setSelectedOpponent}
          label="Opponent"
          helperText="Search and select the opponent you played against"
          excludeAuthId={userId}
        />

        <ScoreSetsInput sets={sets} onChange={setSets} />
        <Stack spacing={1}>
          <FormLabel>Result</FormLabel>
          {winnerTeam ? (
            <Alert severity="info">
              {winnerTeam === "draw"
                ? "The match will be recorded as a draw based on the entered scores."
                : winnerTeam === "A"
                ? "Winner: Team A (You)"
                : "Winner: Team B (Opponent)"}
            </Alert>
          ) : (
            <Alert severity="warning">
              Enter complete set scores to automatically determine the winner or draw.
            </Alert>
          )}
        </Stack>
        <Button type="submit" variant="contained" disabled={!isValid}>
          Record Match
        </Button>
      </Stack>
    </form>
  );
}

export default SinglesForm;
