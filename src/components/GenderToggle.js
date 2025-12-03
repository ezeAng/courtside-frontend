import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Stack from "@mui/material/Stack";

function GenderToggle({ value, onChange }) {
  const handleChange = (_event, newGender) => {
    if (newGender) {
      onChange(newGender);
    }
  };

  return (
    <Stack spacing={1}>
      <ToggleButtonGroup
        color="primary"
        value={value}
        exclusive
        fullWidth
        onChange={handleChange}
      >
        <ToggleButton value="mixed" sx={{ fontWeight: 600 }}>
          Global
        </ToggleButton>
        <ToggleButton value="male" sx={{ fontWeight: 600 }}>
          Male
        </ToggleButton>
        <ToggleButton value="female" sx={{ fontWeight: 600 }}>
          Female
        </ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}

export default GenderToggle;
