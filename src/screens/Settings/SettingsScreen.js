import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
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
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import CircularProgress from "@mui/material/CircularProgress";
import CheckIcon from "@mui/icons-material/Check";
import ChevronRightIcon from "@mui/icons-material/ChevronRightOutlined"
import { useNavigate } from "react-router-dom";
import PlayerCardModal from "../../components/PlayerCardModal";
import ProfileAvatar from "../../components/ProfileAvatar";
import Snackbar from "@mui/material/Snackbar";
import { countries } from "../../constants/countries";

import {
  fetchCurrentUser,
  updateUserProfile,
} from "../../features/user/userSlice";
import MySessionsCalendar from "../../components/MySessionsCalendar";

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
  const [countryCode, setCountryCode] = useState(user?.country_code || null);
  const [isProfilePrivate, setIsProfilePrivate] = useState(
    Boolean(user?.is_profile_private)
  );
  const [shareContactWithConnection, setShareContactWithConnection] = useState(
    Boolean(user?.share_contact_with_connections)
  );
  const [successMessage, setSuccessMessage] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [closeAfterAvatarUpload, setCloseAfterAvatarUpload] = useState(false);
  const [countryDialogOpen, setCountryDialogOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  
  const [modalCountryCode, setModalCountryCode] = useState(
    user?.country_code || null
  );
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || "");
  const [contactEmail, setContactEmail] = useState(user?.contact_email || "");



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
      setCountryCode(user.country_code || null);
      setModalCountryCode(user.country_code || null);
      setIsProfilePrivate(Boolean(user.is_profile_private));
      setShareContactWithConnection(Boolean(user.share_contact_with_connections));
      setPhoneNumber(user.phone_number || "");
      setContactEmail(user.contact_email || "");
    }
  }, [user]);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState("success");

  const showToast = (message, severity = "success") => {
    setToastSeverity(severity);
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
      phone_number: phoneNumber,
      contact_email: contactEmail,
      is_profile_private: isProfilePrivate,
      share_contact_with_connections: shareContactWithConnection,
      profile_image_url: user?.profile_image_url || null,
      country_code: normalizedCountryCode,
    };


    const result = await dispatch(updateUserProfile(payload));

    if (updateUserProfile.fulfilled.match(result)) {
      dispatch(fetchCurrentUser(token));
      setEditOpen(false);
      showToast("Profile updated successfully. Changes may take a moment to reflect.");
    }

  };


  const normalizedCountryCode = countryCode ? countryCode.toUpperCase() : null;
  const normalizedModalCountryCode = modalCountryCode
    ? modalCountryCode.toUpperCase()
    : null;

  const selectedCountry = countries.find(
    (country) => country.code === normalizedCountryCode
  );

  const filteredCountries = countries.filter((country) => {
    if (!countrySearch.trim()) return true;
    const searchTerm = countrySearch.trim().toLowerCase();
    return (
      country.name.toLowerCase().includes(searchTerm) ||
      country.code.toLowerCase().includes(searchTerm)
    );
  });

  const openCountrySelector = () => {
    setCountrySearch("");
    setModalCountryCode(countryCode || null);
    setCountryDialogOpen(true);
  };

  const handleCountrySelect = async (code) => {
    const normalizedCode = code ? code.toUpperCase() : null;
    setModalCountryCode(normalizedCode);
    setCountryCode(normalizedCode);
    setCountryDialogOpen(false);
    setCountrySearch("");
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

        <Card
          sx={{
            borderRadius: 1.25,
            border: "1px solid",
            borderColor: "divider",
            transition: "background-color 0.15s ease, box-shadow 0.15s ease",
            cursor: "pointer",
            "&:hover": {
              bgcolor: "action.hover",
              boxShadow: 2,
            },
          }}
        >
          <CardActionArea
            onClick={() => navigate("/connections")}
            sx={{ borderRadius: 1.25 }}
          >
            <CardContent sx={{ px: 2.5, py: 2.5 }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
              >
                {/* Icon container */}
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    flexShrink: 0,
                  }}
                >
                  <PeopleIcon />
                </Box>

                {/* Text */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={800}>
                    Connections
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Find players and manage your connections
                  </Typography>
                </Box>

                {/* Direction */}
                <ChevronRightIcon sx={{ color: "text.secondary" }} />
              </Stack>
            </CardContent>
        </CardActionArea>
        </Card>


        <Card variant="outlined">
          <CardContent>
            <MySessionsCalendar token={token} currentUser={user} />
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
            <TextField
              label="Contact Email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              fullWidth
              helperText="Visible to connections if sharing is enabled"
            />

            <TextField
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              fullWidth
              helperText="Include country code if applicable"
            />


            <List component="div" sx={{ border: 1, borderColor: "divider", borderRadius: 1, overflow: "hidden" }}>
              <ListItemButton onClick={openCountrySelector}>
                <ListItemText
                  primary="Country"
                  secondary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box component="span" sx={{ fontSize: 24, lineHeight: 1 }}>
                        {selectedCountry?.flag}
                      </Box>
                      <Typography component="span" variant="body2" color="text.primary">
                        {selectedCountry?.name}
                      </Typography>
                      <Typography component="span" variant="caption" color="text.secondary">
                        {selectedCountry?.code}
                      </Typography>
                    </Stack>
                  }
                  secondaryTypographyProps={{ component: "div" }}
                />

              </ListItemButton>
            </List>

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
      <Dialog
        open={countryDialogOpen}
        fullWidth
        maxWidth="sm"
        onClose={() => setCountryDialogOpen(false)}
      >
        <DialogTitle>Select country</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="Search"
              placeholder="Search by country or code"
              value={countrySearch}
              onChange={(event) => setCountrySearch(event.target.value)}
              fullWidth
              autoFocus
            />
            <Box sx={{ maxHeight: 360, overflowY: "auto" }}>
              <List disablePadding>
                <ListItemButton
                  onClick={() => handleCountrySelect(null)}
                  selected={normalizedModalCountryCode === null}
                >
                  <ListItemText
                    primary="No country"
                    secondary="Clear selection"
                  />
                  {normalizedModalCountryCode === null && (
                    <CheckIcon color="primary" fontSize="small" />
                  )}
                </ListItemButton>
                <Divider component="li" />
                {filteredCountries.map((country) => (
                  <ListItemButton
                    key={country.code}
                    onClick={() => handleCountrySelect(country.code)}
                    selected={normalizedModalCountryCode === country.code}
                  >
                    <ListItemIcon sx={{ minWidth: 48 }}>
                      <Typography fontSize={24} lineHeight={1}>
                        {country.flag}
                      </Typography>
                    </ListItemIcon>
                    <ListItemText
                      primary={country.name}
                      secondary={country.code}
                    />
                    {normalizedModalCountryCode === country.code && (
                      <CheckIcon color="primary" fontSize="small" />
                    )}
                  </ListItemButton>
                ))}
              </List>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity={toastSeverity}
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
