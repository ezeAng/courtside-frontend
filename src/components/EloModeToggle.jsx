import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useDispatch, useSelector } from "react-redux";
import { setEloMode } from "../features/ui/uiSlice";
import { getEloLabelForMode } from "../utils/elo";

function EloModeToggle({ label = "Elo Mode", size = "medium", hideLabel = false }) {
  const dispatch = useDispatch();
  const eloMode = useSelector((state) => state.ui.eloMode || "singles");

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {!hideLabel && (
        <Typography variant="body2" color="text.secondary">
          {label}: {getEloLabelForMode(eloMode)}
        </Typography>
      )}
      <ToggleButtonGroup
        value={eloMode}
        exclusive
        size={size}
        onChange={(_, value) => value && dispatch(setEloMode(value))}
      >
        <ToggleButton value="singles">Singles</ToggleButton>
        <ToggleButton value="doubles">Doubles</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}

export default EloModeToggle;
