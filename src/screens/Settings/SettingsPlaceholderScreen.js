import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

function SettingsPlaceholderScreen() {
  return (
    <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
      <Stack spacing={2} alignItems="center" textAlign="center">
        <Typography variant="h5" fontWeight={700}>
          Settings
        </Typography>
        <Typography color="text.secondary">Settings screen coming soon</Typography>
      </Stack>
    </Container>
  );
}

export default SettingsPlaceholderScreen;
