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

function DoublesForm({ onRecorded, onClose }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.accessToken);
  const currentUser = useSelector((state) => state.user.user);
  const [partnerId, setPartnerId] = useState("");
  const [opponent1Id, setOpponent1Id] = useState("");
  const [opponent2Id, setOpponent2Id] = useState("");
  const [score, setScore] = useState("");
  const [winnerTeam, setWinnerTeam] = useState("A");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState(null);

  const userId = currentUser?.auth_id;

  const isValid = useMemo(
    () => partnerId && opponent1Id && opponent2Id && score && winnerTeam,
    [partnerId, opponent1Id, opponent2Id, score, winnerTeam]
  );

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const res = await getOtherUsers(token);
        console.log("API response:", res);

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

    const partner = users.find((user) => String(user.auth_id) === String(partnerId));
    const opponent1 = users.find((user) => String(user.auth_id) === String(opponent1Id));
    const opponent2 = users.find((user) => String(user.auth_id) === String(opponent2Id));

    if (!partner || !opponent1 || !opponent2) {
      setError("Please select valid players for all positions");
      return;
    }

    const uniqueIds = new Set([partner.auth_id, opponent1.auth_id, opponent2.auth_id]);

    if (uniqueIds.size < 3) {
      setError("Please select three distinct players");
      return;
    }

    try {
      await dispatch(
        recordMatch({
          match_type: "doubles",
          players_team_A: [userId, partner.auth_id || partner.id],
          players_team_B: [opponent1.auth_id || opponent1.id, opponent2.auth_id || opponent2.id],
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
        {createPlayerSelect("Partner", partnerId, setPartnerId)}
        {createPlayerSelect("Opponent 1", opponent1Id, setOpponent1Id)}
        {createPlayerSelect("Opponent 2", opponent2Id, setOpponent2Id)}
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
            <FormControlLabel value="A" control={<Radio />} label="Team A (You + Partner)" />
            <FormControlLabel value="B" control={<Radio />} label="Team B (Opponents)" />
          </RadioGroup>
        </Stack>
        <Button type="submit" variant="contained" disabled={!isValid}>
          Record Match
        </Button>
      </Stack>
    </form>
  );
}

export default DoublesForm;
