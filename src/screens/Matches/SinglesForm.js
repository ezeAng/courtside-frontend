import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import FormLabel from "@mui/material/FormLabel";
import Alert from "@mui/material/Alert";
import { recordMatch } from "../../features/matches/matchSlice";
import { getOtherUsers } from "../../services/api";
import ScoreSetsInput from "./ScoreSetsInput";
import { formatSetsScore } from "./scoreFormatting";
import { areSetsWithinRange, determineOutcomeFromSets } from "./scoreValidation";
import LoadingSpinner from "../../components/LoadingSpinner";

function SinglesForm({ onRecorded, onClose }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.accessToken);
  const currentUser = useSelector((state) => state.user.user);
  const [opponentId, setOpponentId] = useState("");
  const [sets, setSets] = useState([{ your: "", opponent: "" }]);
  const [winnerTeam, setWinnerTeam] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState(null);
  const userId = currentUser?.auth_id;

  const autoWinner = useMemo(() => determineOutcomeFromSets(sets), [sets]);

  const isValid = useMemo(
    () => opponentId && autoWinner && areSetsWithinRange(sets),
    [autoWinner, opponentId, sets]
  );

  useEffect(() => {
    const desiredWinner = autoWinner || "";
    if (desiredWinner !== winnerTeam) {
      setWinnerTeam(desiredWinner);
    }
  }, [autoWinner, winnerTeam]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const results = await getOtherUsers(token);
        setUsers(results?.results || []);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (token) {
      loadUsers();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!opponentId || !userId) return;

    if (String(opponentId) === String(userId)) {
      setError("You cannot select yourself as the opponent");
      return;
    }

    const opponent = users.find((user) => String(user.auth_id) === String(opponentId));

    if (!opponent) {
      setError("Please select a valid opponent");
      return;
    }

    if (!areSetsWithinRange(sets)) {
      setError("Scores must be between 0 and 30 for each set");
      return;
    }

    try {
      if (!winnerTeam) {
        setError("Enter valid set scores to determine the result automatically");
        return;
      }

      const formattedScore = formatSetsScore(sets);
      const winnerToSubmit = winnerTeam === "draw" ? null : winnerTeam;

      const teamAIds = [userId];
      const teamBIds = [opponent.auth_id || opponent.id];

      const recordedMatch = await dispatch(
        recordMatch({
          discipline: "singles",
          match_type: "singles",
          team_a_auth_ids: teamAIds,
          team_b_auth_ids: teamBIds,
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
        {loadingUsers && <LoadingSpinner message="Loading opponents..." inline size={20} />}
        <TextField
          select
          label="Opponent"
          value={opponentId}
          onChange={(e) => setOpponentId(e.target.value)}
          required
          disabled={loadingUsers}
        >
          {users.map((user) => (
            <MenuItem key={user.auth_id} value={user.auth_id}>
              {user.username}
            </MenuItem>
          ))}
        </TextField>
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
