import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { completePasswordReset } from "../../features/auth/authSlice";
import logo from "../../logo.svg";

/**
 * Extracts Supabase recovery access_token from URL hash
 */
const getRecoveryTokenFromUrl = () => {
  const hash = window.location.hash.replace("#", "");
  const params = new URLSearchParams(hash);
  return params.get("access_token");
};

function ResetPasswordScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    passwordUpdateLoading,
    passwordUpdateMessage,
    passwordUpdateError,
  } = useSelector((state) => state.auth);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState(null);
  const [recoveryReady, setRecoveryReady] = useState(false);

  useEffect(() => {
    const token = getRecoveryTokenFromUrl();
    if (token) {
      setRecoveryReady(true);
    } else {
      setLocalError("Password recovery link is invalid or has expired.");
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError(null);

    const recoveryToken = getRecoveryTokenFromUrl();

    if (!recoveryToken) {
      setLocalError("Password recovery link is invalid or expired.");
      return;
    }

    if (!newPassword.trim()) {
      setLocalError("Please enter a new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    const result = await dispatch(
      completePasswordReset({
        recoveryToken,
        newPassword,
      })
    );

    if (completePasswordReset.rejected.match(result)) {
      setLocalError(result.payload || result.error?.message);
      return;
    }

    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 1200);
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        alignItems: "center",
        minHeight: "100vh",
        py: 6,
      }}
    >
      <Card sx={{ width: "100%" }} variant="outlined">
        <CardContent>
          <Stack spacing={3} component="form" onSubmit={handleSubmit}>
            <Box display="flex" justifyContent="center">
              <Box
                component="img"
                src={logo}
                alt="App logo"
                sx={{ height: 128, mb: 1 }}
              />
            </Box>

            <Stack spacing={1} textAlign="center">
              <Typography variant="h4" fontWeight={700}>
                Reset password
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {recoveryReady
                  ? "Enter a new password to finish resetting your account."
                  : "Open the password recovery link from your email to continue."}
              </Typography>
            </Stack>

            {(localError || passwordUpdateError) && (
              <Alert severity="error">
                {localError || passwordUpdateError}
              </Alert>
            )}

            {passwordUpdateMessage && (
              <Alert severity="success">{passwordUpdateMessage}</Alert>
            )}

            <TextField
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              fullWidth
              autoFocus
              disabled={!recoveryReady}
            />

            <TextField
              type="password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              disabled={!recoveryReady}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!recoveryReady || passwordUpdateLoading}
              startIcon={
                passwordUpdateLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {passwordUpdateLoading
                ? "Updating password..."
                : "Update password"}
            </Button>

            <Stack direction="row" spacing={1} justifyContent="center">
              <Button component={RouterLink} to="/login" size="small">
                Back to login
              </Button>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
              <Button component={RouterLink} to="/forgot-password" size="small">
                Resend reset link
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}

export default ResetPasswordScreen;
