import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Alert from "@mui/material/Alert";
import { recordMatch } from "../../features/matches/matchSlice";
import { getOtherUsers } from "../../services/api";

function SinglesForm({ onRecorded, onClose }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.accessToken);
  const currentUser = useSelector((state) => state.user.user);
  const [opponentId, setOpponentId] = useState("");
  const [score, setScore] = useState("");
  const [winnerTeam, setWinnerTeam] = useState("A");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState(null);

  const userId = currentUser?.user_id;

  const isValid = useMemo(() => opponentId && score && winnerTeam, [opponentId, score, winnerTeam]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const results = await getOtherUsers(token);
        setUsers(results);
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

    const opponent = users.find((user) => String(user.user_id) === String(opponentId));

    if (!opponent) {
      setError("Please select a valid opponent");
      return;
    }

    try {
      await dispatch(
        recordMatch({
          match_type: "singles",
          players_team_A: [userId],
          players_team_B: [opponent.user_id || opponent.id],
          score,
          winner_team: winnerTeam,
        })
      ).unwrap();
      onRecorded?.();
      onClose?.();
    } catch (err) {
      setError(err.message || "Failed to record match");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          select
          label="Opponent"
          value={opponentId}
          onChange={(e) => setOpponentId(e.target.value)}
          required
          disabled={loadingUsers}
        >
          {users.map((user) => (
            <MenuItem key={user.user_id || user.id} value={user.user_id || user.id}>
              {user.username}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Score"
          placeholder="21-15, 21-18"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          required
        />
        <Stack spacing={1}>
          <FormLabel>Winner</FormLabel>
          <RadioGroup
            row
            value={winnerTeam}
            onChange={(e) => setWinnerTeam(e.target.value)}
          >
            <FormControlLabel value="A" control={<Radio />} label="Team A (You)" />
            <FormControlLabel value="B" control={<Radio />} label="Team B (Opponent)" />
          </RadioGroup>
        </Stack>
        <Button type="submit" variant="contained" disabled={!isValid}>
          Record Match
        </Button>
      </Stack>
    </form>
  );
}

export default SinglesForm;
