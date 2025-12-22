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

function DoublesForm({ onRecorded, onClose }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.accessToken);
  const currentUser = useSelector((state) => state.user.user);
  const [partnerId, setPartnerId] = useState("");
  const [opponent1Id, setOpponent1Id] = useState("");
  const [opponent2Id, setOpponent2Id] = useState("");
  const [sets, setSets] = useState([{ your: "", opponent: "" }]);
  const [winnerTeam, setWinnerTeam] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState(null);

  const userId = currentUser?.auth_id;

  const autoWinner = useMemo(() => determineOutcomeFromSets(sets), [sets]);

  const isValid = useMemo(
    () =>
      partnerId && opponent1Id && opponent2Id && autoWinner && areSetsWithinRange(sets),
    [autoWinner, opponent1Id, opponent2Id, partnerId, sets]
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
        const res = await getOtherUsers(token);

        // FIX: extract the array correctly
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res.results)
          ? res.results
          : [];

        setUsers(list);
      } catch (err) {
        setError(err.message);
        setUsers([]);
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
    if (!partnerId || !opponent1Id || !opponent2Id || !userId) return;

    const uniqueIds = new Set([userId, partnerId, opponent1Id, opponent2Id].map(String));

    if (uniqueIds.size < 4) {
      setError("Each player must be unique");
      return;
    }

    const partner = users.find((user) => String(user.auth_id) === String(partnerId));
    const opponent1 = users.find((user) => String(user.auth_id) === String(opponent1Id));
    const opponent2 = users.find((user) => String(user.auth_id) === String(opponent2Id));

    if (!partner || !opponent1 || !opponent2) {
      setError("Please select valid players for all positions");
      return;
    }

    try {
      if (!areSetsWithinRange(sets)) {
        setError("Scores must be between 0 and 30 for each set");
        return;
      }

      const formattedScore = formatSetsScore(sets);
      const winnerToSubmit = winnerTeam === "draw" ? null : winnerTeam;

      if (!winnerTeam) {
        setError("Enter valid set scores to determine the result automatically");
        return;
      }

      const recordedMatch = await dispatch(
        recordMatch({
          match_type: "doubles",
          players_team_A: [userId, partner.auth_id || partner.id],
          players_team_B: [opponent1.auth_id || opponent1.id, opponent2.auth_id || opponent2.id],
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

  const createPlayerSelect = (label, value, setValue) => (
    <TextField
      select
      label={label}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      required
      disabled={loadingUsers}
    >
      {users.map((user) => (
        <MenuItem key={user.auth_id || user.auth_id} value={user.auth_id || user.auth_id}>
          {user.username}
        </MenuItem>
      ))}
    </TextField>
  );

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        {loadingUsers && <LoadingSpinner message="Loading players..." inline size={20} />}
        {createPlayerSelect("Partner", partnerId, setPartnerId)}
        {createPlayerSelect("Opponent 1", opponent1Id, setOpponent1Id)}
        {createPlayerSelect("Opponent 2", opponent2Id, setOpponent2Id)}
        <ScoreSetsInput sets={sets} onChange={setSets} />
        <Stack spacing={1}>
          <FormLabel>Result</FormLabel>
          {winnerTeam ? (
            <Alert severity="info">
              {winnerTeam === "draw"
                ? "The match will be recorded as a draw based on the entered scores."
                : winnerTeam === "A"
                ? "Winner: Team A (You + Partner)"
                : "Winner: Team B (Opponents)"}
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

export default DoublesForm;
