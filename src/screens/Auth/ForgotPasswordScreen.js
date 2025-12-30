import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { requestPasswordReset } from "../../features/auth/authSlice";
import logo from "../../logo.svg";

function ForgotPasswordScreen() {
  const dispatch = useDispatch();
  const { resetLoading, resetMessage, resetError } = useSelector(
    (state) => state.auth
  );

  const [identifier, setIdentifier] = useState("");
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError(null);

    if (!identifier.trim()) {
      setSubmitError("Please enter your email or username.");
      return;
    }

    const result = await dispatch(requestPasswordReset({ identifier }));
    if (requestPasswordReset.rejected.match(result)) {
      setSubmitError(result.payload || result.error?.message);
    }
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
                Forgot password
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your email to receive a reset link.
              </Typography>
            </Stack>

            {(submitError || resetError) && (
              <Alert severity="error">{submitError || resetError}</Alert>
            )}

            {resetMessage && <Alert severity="success">{resetMessage}</Alert>}

            <TextField
              label="Email or Username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              fullWidth
              autoFocus
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={resetLoading}
              startIcon={
                resetLoading ? <CircularProgress size={20} color="inherit" /> : null
              }
            >
              {resetLoading ? "Sending reset link..." : "Send reset link"}
            </Button>

            <Stack direction="row" spacing={1} justifyContent="center">
              <Button component={RouterLink} to="/login" size="small">
                Back to login
              </Button>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
              <Button component={RouterLink} to="/signup" size="small">
                Create account
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}

export default ForgotPasswordScreen;
