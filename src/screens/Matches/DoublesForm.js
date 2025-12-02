import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Alert from "@mui/material/Alert";
import { recordMatch } from "../../features/matches/matchSlice";
import { searchUsers } from "../../services/api";

function DoublesForm({ onRecorded, onClose }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.accessToken);
  const currentUser = useSelector((state) => state.user.user);
  const [partner, setPartner] = useState(null);
  const [opponent1, setOpponent1] = useState(null);
  const [opponent2, setOpponent2] = useState(null);
  const [score, setScore] = useState("");
  const [winnerTeam, setWinnerTeam] = useState("A");
  const [searchValue, setSearchValue] = useState({ partner: "", opponent1: "", opponent2: "" });
  const [searchResults, setSearchResults] = useState({ partner: [], opponent1: [], opponent2: [] });
  const [loadingSearch, setLoadingSearch] = useState({ partner: false, opponent1: false, opponent2: false });
  const [error, setError] = useState(null);

  const userId = currentUser?.user_id;

  const isValid = useMemo(
    () => partner && opponent1 && opponent2 && score && winnerTeam,
    [partner, opponent1, opponent2, score, winnerTeam]
  );

  useEffect(() => {
    const timers = {};
    ["partner", "opponent1", "opponent2"].forEach((key) => {
      if (searchValue[key].trim().length < 2) {
        setSearchResults((prev) => ({ ...prev, [key]: [] }));
        setLoadingSearch((prev) => ({ ...prev, [key]: false }));
        return;
      }
      setLoadingSearch((prev) => ({ ...prev, [key]: true }));
      timers[key] = setTimeout(async () => {
        try {
          const results = await searchUsers(searchValue[key], token);
          setSearchResults((prev) => ({ ...prev, [key]: results }));
        } catch (err) {
          setError(err.message);
        } finally {
          setLoadingSearch((prev) => ({ ...prev, [key]: false }));
        }
      }, 300);
    });

    return () => {
      Object.values(timers).forEach((timer) => clearTimeout(timer));
    };
  }, [searchValue, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!partner || !opponent1 || !opponent2 || !userId) return;

    try {
      await dispatch(
        recordMatch({
          match_type: "doubles",
          players_team_A: [userId, partner.user_id || partner.id],
          players_team_B: [opponent1.user_id || opponent1.id, opponent2.user_id || opponent2.id],
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

  const createAutocomplete = (label, valueKey, value, setValue) => (
    <Autocomplete
      options={searchResults[valueKey]}
      getOptionLabel={(option) => option.username || ""}
      loading={loadingSearch[valueKey]}
      value={value}
      onChange={(e, newValue) => setValue(newValue)}
      inputValue={searchValue[valueKey]}
      onInputChange={(e, newValue) =>
        setSearchValue((prev) => ({ ...prev, [valueKey]: newValue }))
      }
      renderInput={(params) => <TextField {...params} label={label} required />}
    />
  );

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        {createAutocomplete("Partner", "partner", partner, setPartner)}
        {createAutocomplete("Opponent 1", "opponent1", opponent1, setOpponent1)}
        {createAutocomplete("Opponent 2", "opponent2", opponent2, setOpponent2)}
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
