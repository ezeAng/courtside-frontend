import { useState } from "react";
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
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Switch from "@mui/material/Switch";
import LanguageIcon from "@mui/icons-material/Language";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LogoutIcon from "@mui/icons-material/Logout";
import FeedbackIcon from "@mui/icons-material/Feedback";
import { toggleThemeMode } from "../../features/preferences/preferencesSlice";
import { clearAuth } from "../../features/auth/authSlice";
import { clearUser } from "../../features/user/userSlice";
import FeedbackModal from "./FeedbackModal";

function AppSettingsScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { themeMode } = useSelector((state) => state.preferences);
  const { user } = useSelector((state) => state.user);
  const token = useSelector((state) => state.auth.accessToken);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const handleToggleTheme = () => {
    dispatch(toggleThemeMode());
  };

  const handleLogout = () => {
    dispatch(clearAuth());
    dispatch(clearUser());
    navigate("/login", { replace: true });
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
              {/* <Divider />
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
              </Stack> */}
            </Stack>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent sx={{ p: 0 }}>
            <List disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <LanguageIcon />
                </ListItemIcon>
                <ListItemText primary="Language" secondary="English" />
              </ListItemButton>
              <Divider component="li" />
              <ListItemButton>
                <ListItemIcon>
                  <LocationOnIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Location"
                  secondary={user?.region || "Not set"}
                />
              </ListItemButton>
              <Divider component="li" />
              <ListItemButton onClick={() => setFeedbackOpen(true)}>
                <ListItemIcon>
                  <FeedbackIcon />
                </ListItemIcon>
                <ListItemText primary="Send feedback" />
              </ListItemButton>
              <Divider component="li" />
              <ListItemButton onClick={handleLogout} sx={{ color: "error.main" }}>
                <ListItemIcon sx={{ color: "error.main" }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Log out" />
              </ListItemButton>
            </List>
          </CardContent>
        </Card>
      </Stack>
      <FeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        token={token}
      />
    </Container>
  );
}

export default AppSettingsScreen;
