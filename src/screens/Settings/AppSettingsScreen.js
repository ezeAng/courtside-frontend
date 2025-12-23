import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Switch from "@mui/material/Switch";
import Button from "@mui/material/Button";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { toggleThemeMode } from "../../features/preferences/preferencesSlice";
import { clearAuth } from "../../features/auth/authSlice";
import { clearUser, deleteCurrentUser } from "../../features/user/userSlice";

function AppSettingsScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { themeMode } = useSelector((state) => state.preferences);
  const { deleteLoading, deleteError } = useSelector((state) => state.user);

  const handleToggleTheme = () => {
    dispatch(toggleThemeMode());
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Delete your account permanently? This cannot be undone."
    );
    if (!confirmed) return;

    const result = await dispatch(deleteCurrentUser());
    if (deleteCurrentUser.fulfilled.match(result)) {
      dispatch(clearAuth());
      dispatch(clearUser());
      navigate("/login", { replace: true });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={700}>
          Settings
        </Typography>
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={700}>
                Preferences
              </Typography>
              <Divider />
              <List disablePadding>
                <ListItem disableGutters secondaryAction={<Switch edge="end" defaultChecked />}>
                  <ListItemText primary="Notifications" secondary="Match updates and reminders" />
                </ListItem>
                <Divider component="li" />
                <ListItem
                  disableGutters
                  secondaryAction={<Switch edge="end" checked={themeMode === "dark"} onChange={handleToggleTheme} />}
                >
                  <ListItemText
                    primary="Dark mode"
                    secondary={themeMode === "dark" ? "On" : "Off"}
                  />
                </ListItem>
              </List>
              <Divider />
              <Stack spacing={1}>
                {deleteError && (
                  <Typography color="error" variant="body2">
                    {deleteError}
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteForeverIcon />}
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Delete Account"}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}

export default AppSettingsScreen;
