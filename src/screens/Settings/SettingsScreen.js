import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import LanguageIcon from "@mui/icons-material/Language";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import HistoryIcon from "@mui/icons-material/History";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import SettingsIcon from "@mui/icons-material/Settings";
import FeedbackIcon from "@mui/icons-material/Feedback";
import { useNavigate } from "react-router-dom";
import { AVATARS } from "../../constants/avatars";
import PlayerCardModal from "../../components/PlayerCardModal";
import ProfileAvatar from "../../components/ProfileAvatar";
import { clearAuth } from "../../features/auth/authSlice";
import {
  clearUser,
  deleteCurrentUser,
  fetchCurrentUser,
  updateUserProfile,
} from "../../features/user/userSlice";
import FeedbackModal from "./FeedbackModal";

function SettingsScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    user,
    updateLoading,
    updateError,
    avatarError,
    deleteLoading,
    deleteError,
  } = useSelector((state) => state.user);

  const token = useSelector((state) => state.auth.accessToken);

  const [username, setUsername] = useState(user?.username || "");
  const [gender, setGender] = useState(user?.gender || "male");
  const [avatar, setAvatar] = useState(user?.avatar ?? 0);
  const [region, setRegion] = useState(user?.region || "");
  const [address, setAddress] = useState(user?.address || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [successMessage, setSuccessMessage] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUsername, setDeleteUsername] = useState("");
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchCurrentUser(token));
    }
  }, [dispatch, token, user]);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setGender(user.gender || "male");
      setAvatar(user.avatar ?? 0);
      setRegion(user.region || "");
      setAddress(user.address || "");
      setBio(user.bio || "");
    }
  }, [user]);

  const selectedAvatar = useMemo(() => AVATARS[avatar] || "", [avatar]);

  const initials = useMemo(() => {
    if (user?.username) {
      return user.username
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    return "";
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage(null);
    const payload = {
      username,
      gender,
      avatar,
      region,
      address,
      bio,
      profile_image_url: user?.profile_image_url || null,
    };
    const result = await dispatch(updateUserProfile(payload));
    if (updateUserProfile.fulfilled.match(result)) {
      dispatch(fetchCurrentUser(token));
      setSuccessMessage("Profile updated successfully.");
    }
  };

  const handleLogout = () => {
    dispatch(clearAuth());
    dispatch(clearUser());
    navigate("/login", { replace: true });
  };

  const handleDeleteSubmit = async (event) => {
    event.preventDefault();
    setDeleteSuccessMessage("");
    const result = await dispatch(deleteCurrentUser());
    if (deleteCurrentUser.fulfilled.match(result)) {
      setDeleteSuccessMessage("Account deleted. Logging you out...");
      setTimeout(handleLogout, 1200);
    }
  };

  const canDelete =
    deleteUsername.trim().toLowerCase() === (user?.username || "").toLowerCase();

  return (
    <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight={700}>
            My Profile
          </Typography>
          <IconButton
            aria-label="Open settings"
            edge="end"
            onClick={() => navigate("/settings/preferences")}
          >
            <SettingsIcon />
          </IconButton>
        </Stack>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2} alignItems="center" textAlign="center">
              <ProfileAvatar user={user} size={80} editable />
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {user?.username || "Loading user..."}
                </Typography>
                {user?.username && (
                  <Typography color="text.secondary">@{user.username}</Typography>
                )}
              </Box>
              {successMessage && (
                <Alert severity="success" sx={{ width: "100%" }}>
                  {successMessage}
                </Alert>
              )}
              <Stack spacing={1} width="100%">
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={() => setEditOpen(true)}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={() => setShowCard(true)}
                >
                  View Player Card
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent sx={{ p: 0 }}>
            <List disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <FavoriteBorderIcon />
                </ListItemIcon>
                <ListItemText primary="Favourites" secondary="Your saved matches" />
              </ListItemButton>
              <Divider component="li" />
              <ListItemButton>
                <ListItemIcon>
                  <CloudDownloadIcon />
                </ListItemIcon>
                <ListItemText primary="Downloads" secondary="Offline data" />
              </ListItemButton>
              <Divider component="li" />
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
                <ListItemText primary="Location" secondary={region || "Not set"} />
              </ListItemButton>
              <Divider component="li" />
              <ListItemButton>
                <ListItemIcon>
                  <SubscriptionsIcon />
                </ListItemIcon>
                <ListItemText primary="Subscription" secondary="Standard" />
              </ListItemButton>
              <Divider component="li" />
              <ListItemButton>
                <ListItemIcon>
                  <HistoryIcon />
                </ListItemIcon>
                <ListItemText primary="Clear history" />
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
              <Divider component="li" />
              <ListItemButton
                onClick={() => {
                  setDeleteUsername("");
                  setDeleteSuccessMessage("");
                  setDeleteOpen(true);
                }}
                sx={{ color: "error.main" }}
              >
                <ListItemIcon sx={{ color: "error.main" }}>
                  <DeleteForeverIcon />
                </ListItemIcon>
                <ListItemText primary="Delete Account" />
              </ListItemButton>
            </List>
          </CardContent>
        </Card>
      </Stack>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Stack spacing={3} component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
            {updateError && <Alert severity="error">{updateError}</Alert>}
            {avatarError && <Alert severity="error">{avatarError}</Alert>}

            <Stack spacing={1} alignItems="center" textAlign="center">
              <ProfileAvatar user={user} size={72} editable />
              <Typography color="text.secondary">
                Tap your avatar to upload a new profile photo.
              </Typography>
            </Stack>

            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              fullWidth
            />

            <TextField
              select
              label="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              fullWidth
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
            </TextField>

            <TextField
              select
              label="Region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              fullWidth
            >
              <MenuItem value="">Select region</MenuItem>
              <MenuItem value="N">North</MenuItem>
              <MenuItem value="NE">Northeast</MenuItem>
              <MenuItem value="E">East</MenuItem>
              <MenuItem value="SE">Southeast</MenuItem>
              <MenuItem value="S">South</MenuItem>
              <MenuItem value="SW">Southwest</MenuItem>
              <MenuItem value="W">West</MenuItem>
              <MenuItem value="NW">Northwest</MenuItem>
            </TextField>

            <TextField
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              fullWidth
            />

            <TextField
              label="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              multiline
              minRows={3}
              fullWidth
            />

            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight={600}>
                Choose an avatar
              </Typography>
              <Grid container spacing={2} columns={10}>
                {AVATARS.map((icon, index) => (
                  <Grid size={2} key={icon}>
                    <Button
                      variant={avatar === index ? "contained" : "outlined"}
                      onClick={() => setAvatar(index)}
                      sx={{
                        width: "100%",
                        minWidth: 0,
                        p: 0,
                        borderRadius: 2,
                        overflow: "hidden",
                        aspectRatio: "1 / 1",
                        borderColor: avatar === index ? undefined : "divider",
                        boxShadow: avatar === index ? 2 : "none",
                      }}
                      aria-label={`Select avatar ${index + 1}`}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          height: "100%",
                          fontSize: 28,
                        }}
                      >
                        {icon}
                      </Box>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Stack>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={updateLoading}
              startIcon={
                updateLoading ? <CircularProgress size={20} color="inherit" /> : null
              }
            >
              {updateLoading ? "Saving..." : "Save Changes"}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Stack spacing={2} component="form" onSubmit={handleDeleteSubmit} sx={{ pt: 1 }}>
            <Typography>
              This action is permanent. Please type your username to confirm
              deletion.
            </Typography>
            {deleteError && <Alert severity="error">{deleteError}</Alert>}
            {deleteSuccessMessage && (
              <Alert severity="success">{deleteSuccessMessage}</Alert>
            )}
            <TextField
              label="Confirm username"
              value={deleteUsername}
              onChange={(e) => setDeleteUsername(e.target.value)}
              fullWidth
              autoFocus
              disabled={deleteLoading || Boolean(deleteSuccessMessage)}
              placeholder={user?.username || "Your username"}
            />
            <Button
              type="submit"
              variant="contained"
              color="error"
              disabled={!canDelete || deleteLoading}
              startIcon={
                deleteLoading ? <CircularProgress size={20} color="inherit" /> : null
              }
            >
              {deleteLoading ? "Deleting..." : "Delete account"}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {showCard && <PlayerCardModal token={token} onClose={() => setShowCard(false)} />}
      <FeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        token={token}
      />
    </Container>
  );
}

export default SettingsScreen;
