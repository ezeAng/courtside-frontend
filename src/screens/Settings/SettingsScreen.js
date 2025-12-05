import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";

import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import { AVATARS } from "../../constants/avatars";
import { clearAuth } from "../../features/auth/authSlice";
import { clearUser, updateUserProfile } from "../../features/user/userSlice";
import { useNavigate } from "react-router-dom";

function SettingsScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, updateLoading, updateError } = useSelector((state) => state.user);

  const [username, setUsername] = useState(user?.username || "");
  const [gender, setGender] = useState(user?.gender || "male");
  const [avatar, setAvatar] = useState(user?.avatar ?? 0);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setGender(user.gender || "male");
      setAvatar(user.avatar ?? 0);
    }
  }, [user]);

  const selectedAvatar = useMemo(() => AVATARS[avatar] || "", [avatar]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage(null);
    const payload = {
      username,
      gender,
      avatar,
    };
    const result = await dispatch(updateUserProfile(payload));
    if (updateUserProfile.fulfilled.match(result)) {
      setSuccessMessage("Profile updated successfully.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={3} component="form" onSubmit={handleSubmit}>
            <Stack spacing={1} alignItems="center" textAlign="center">
              <Typography variant="h5" fontWeight={700}>
                Profile Settings
              </Typography>
              <Typography color="text.secondary">
                Update your profile details and choose a new avatar.
              </Typography>
              <Avatar sx={{ width: 72, height: 72, fontSize: 32 }}>
                {selectedAvatar}
              </Avatar>
            </Stack>

            {successMessage && <Alert severity="success">{successMessage}</Alert>}
            {updateError && <Alert severity="error">{updateError}</Alert>}

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

            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight={600}>
                Choose an avatar
              </Typography>
              <Grid container spacing={2} columns={10}>
                {AVATARS.map((icon, index) => (
                  <Grid item xs={2} key={icon}>
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
            <Button
              variant="text"
              color="error"
              fullWidth
              size="large"
              onClick={() => {
                dispatch(clearAuth());
                dispatch(clearUser());
                navigate("/login", { replace: true });
              }}
            >
              Log out
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}

export default SettingsScreen;
