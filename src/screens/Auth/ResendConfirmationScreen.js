import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink, useLocation } from "react-router-dom";
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
import { resendConfirmationEmail } from "../../features/auth/authSlice";
import logo from "../../logo.svg";

function ResendConfirmationScreen() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { resendLoading, resendMessage, resendError } = useSelector(
    (state) => state.auth
  );
  const [email, setEmail] = useState(location.state?.email || "");
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError(null);

    if (!email.trim()) {
      setSubmitError("Please enter your email to resend the confirmation link.");
      return;
    }

    const result = await dispatch(resendConfirmationEmail({ email }));
    if (resendConfirmationEmail.rejected.match(result)) {
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
                Confirm your email
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your email to receive a new confirmation link.
              </Typography>
            </Stack>

            {(submitError || resendError) && (
              <Alert severity="error">{submitError || resendError}</Alert>
            )}

            {resendMessage && <Alert severity="success">{resendMessage}</Alert>}

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              autoFocus
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={resendLoading}
              startIcon={
                resendLoading ? <CircularProgress size={20} color="inherit" /> : null
              }
            >
              {resendLoading ? "Sending email..." : "Resend confirmation email"}
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

export default ResendConfirmationScreen;
