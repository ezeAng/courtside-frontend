import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

const MIN_SETS = 1;
const MAX_SETS = 3;

function ScoreSetsInput({ sets, onChange, yourLabel = "Your Score", opponentLabel = "Opponent Score" }) {
  const handleSetChange = (index, field, value) => {
    const nextSets = sets.map((set, i) => (i === index ? { ...set, [field]: value } : set));
    onChange(nextSets);
  };

  const addSet = () => {
    if (sets.length >= MAX_SETS) return;
    onChange([...sets, { your: "", opponent: "" }]);
  };

  const removeSet = (index) => {
    if (sets.length <= MIN_SETS) return;
    onChange(sets.filter((_, i) => i !== index));
  };

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Sets
      </Typography>
      {sets.map((set, index) => (
        <Grid container spacing={2} alignItems="center" key={index}>
          <Grid item xs={5}>
            <TextField
              label={`${yourLabel} (Set ${index + 1})`}
              type="number"
              inputProps={{ min: 0 }}
              value={set.your}
              onChange={(e) => handleSetChange(index, "your", e.target.value)}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={5}>
            <TextField
              label={`${opponentLabel} (Set ${index + 1})`}
              type="number"
              inputProps={{ min: 0 }}
              value={set.opponent}
              onChange={(e) => handleSetChange(index, "opponent", e.target.value)}
              required
              fullWidth
            />
          </Grid>
          <Grid item>
            {sets.length > MIN_SETS && (
              <IconButton aria-label="Remove set" color="error" onClick={() => removeSet(index)}>
                <RemoveCircleOutlineIcon />
              </IconButton>
            )}
          </Grid>
        </Grid>
      ))}
      <Button
        variant="outlined"
        onClick={addSet}
        disabled={sets.length >= MAX_SETS}
        sx={{ alignSelf: "flex-start" }}
      >
        + Add Set
      </Button>
    </Stack>
  );
}

export default ScoreSetsInput;
