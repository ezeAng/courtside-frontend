import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import LanguageIcon from "@mui/icons-material/Language";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import FeedbackIcon from "@mui/icons-material/Feedback";
import PeopleIcon from "@mui/icons-material/People";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import PlayerCardModal from "../../components/PlayerCardModal";
import ProfileAvatar from "../../components/ProfileAvatar";
import { clearAuth } from "../../features/auth/authSlice";
import Snackbar from "@mui/material/Snackbar";

import {
  clearUser,
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
    avatarUploading,
  } = useSelector((state) => state.user);

  const token = useSelector((state) => state.auth.accessToken);

  const [username, setUsername] = useState(user?.username || "");
  const [gender, setGender] = useState(user?.gender || "male");
  const [region, setRegion] = useState(user?.region || "");
  const [address, setAddress] = useState(user?.address || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [isProfilePrivate, setIsProfilePrivate] = useState(
    Boolean(user?.is_profile_private)
  );
  const [shareContactWithConnection, setShareContactWithConnection] = useState(
    Boolean(user?.share_contact_with_connection)
  );
  const [successMessage, setSuccessMessage] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [closeAfterAvatarUpload, setCloseAfterAvatarUpload] = useState(false);


  useEffect(() => {
    if (token && !user) {
      dispatch(fetchCurrentUser(token));
    }
  }, [dispatch, token, user]);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setGender(user.gender || "male");
      setRegion(user.region || "");
      setAddress(user.address || "");
      setBio(user.bio || "");
      setIsProfilePrivate(Boolean(user.is_profile_private));
      setShareContactWithConnection(Boolean(user.share_contact_with_connection));
    }
  }, [user]);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message) => {
    setToastMessage(message);
    setToastOpen(true);
  };


  useEffect(() => {
    if (closeAfterAvatarUpload && !avatarUploading) {
      dispatch(fetchCurrentUser(token));

      setEditOpen(false);
      setCloseAfterAvatarUpload(false);

      showToast("Profile updated. Changes may take a moment to reflect.");
    }
  }, [closeAfterAvatarUpload, avatarUploading, dispatch, token]);




  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage(null);

    const payload = {
      username,
      gender,
      region,
      address,
      bio,
      is_profile_private: isProfilePrivate,
      share_contact_with_connection: shareContactWithConnection,
      profile_image_url: user?.profile_image_url || null,
    };

    const result = await dispatch(updateUserProfile(payload));

    if (updateUserProfile.fulfilled.match(result)) {
      dispatch(fetchCurrentUser(token));
      setEditOpen(false);
      showToast("Profile updated successfully. Changes may take a moment to reflect.");
    }

  };


  const handleLogout = () => {
    dispatch(clearAuth());
    dispatch(clearUser());
    navigate("/login", { replace: true });
  };

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
              <ProfileAvatar user={user} size={80} editable={false} />
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
        <CardContent>
          <Stack spacing={1} alignItems="flex-start">
            <Stack direction="row" spacing={1} alignItems="center">
              <PeopleIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={700}>
                Connections
              </Typography>
            </Stack>
            <Typography color="text.secondary">
              Discover players, manage requests, and view your connections.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/connections")}
              sx={{ textTransform: "none" }}
            >
              Find Players
            </Button>
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
                <ListItemText primary="Location" secondary={region || "Not set"} />
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

      <Dialog 
        open={editOpen}
        fullWidth maxWidth="sm" 
        onClose={avatarUploading || updateLoading ? undefined : () => setEditOpen(false)}
        disableEscapeKeyDown={avatarUploading || updateLoading}
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent sx={{ position: "relative" }}>
          <Stack
            spacing={3}
            component="form"
            onSubmit={handleSubmit}
            sx={{
              pt: 1,
              pointerEvents: avatarUploading ? "none" : "auto",
              opacity: avatarUploading ? 0.6 : 1,
              transition: "opacity 0.2s ease",
            }}
          >
            {avatarUploading && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "rgba(255,255,255,0.6)",
                  zIndex: 1,
                }}
              >
                <Stack spacing={1} alignItems="center">
                  <CircularProgress />
                  <Typography variant="body2" color="text.secondary">
                    Uploading profile photo…
                  </Typography>
                </Stack>
              </Box>
            )}

            {updateError && <Alert severity="error">{updateError}</Alert>}

            <Stack spacing={1} alignItems="center" textAlign="center">
              <ProfileAvatar user={user} size={72} editable onUploadSuccess={() => setCloseAfterAvatarUpload(true)}/>
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
              <FormControlLabel
                control={
                  <Switch
                    checked={isProfilePrivate}
                    onChange={(event) => setIsProfilePrivate(event.target.checked)}
                  />
                }
                label="Make profile private"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 5 }}>
                When enabled, your profile visibility will be limited.
              </Typography>
            </Stack>

            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={shareContactWithConnection}
                    onChange={(event) =>
                      setShareContactWithConnection(event.target.checked)
                    }
                  />
                }
                label="Share contact details with connections"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 5 }}>
                Allow your confirmed connections to view your contact info.
              </Typography>
            </Stack>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={updateLoading || avatarUploading}
              startIcon={
                updateLoading ? <CircularProgress size={20} color="inherit" /> : null
              }
            >
              {updateLoading ? "Saving..." : "Save Changes"}
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
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>

    </Container>
  );
}

export default SettingsScreen;
