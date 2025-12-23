import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { signup, resendConfirmationEmail } from "../../features/auth/authSlice";
import OnboardingModal from "../../components/OnboardingModal/OnboardingModal";

function SignupScreen() {
  const dispatch = useDispatch();
  const {
    accessToken,
    loading,
    error,
    signupMessage,
    resendMessage,
    resendError,
    resendLoading,
  } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("male");
  const [submitError, setSubmitError] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("onboarding_seen") === "true";
    setHasSeenOnboarding(seen);
    if (!seen && !accessToken) {
      setShowOnboarding(true);
    }
  }, [accessToken]);

  const handleOnboardingDismiss = useCallback(() => {
    localStorage.setItem("onboarding_seen", "true");
    setHasSeenOnboarding(true);
    setShowOnboarding(false);
  }, []);

  const handleOnboardingOpen = useCallback(() => {
    if (!hasSeenOnboarding && !accessToken) {
      setShowOnboarding(true);
    }
  }, [accessToken, hasSeenOnboarding]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError(null);
    const result = await dispatch(signup({ email, password, username, gender }));
    if (signup.rejected.match(result)) {
      setSubmitError(result.payload || result.error?.message);
    }
  };

  const handleResend = async () => {
    setSubmitError(null);
    if (!email) {
      setSubmitError("Please enter your email to resend the confirmation link.");
      return;
    }
    const result = await dispatch(resendConfirmationEmail({ email }));
    if (resendConfirmationEmail.rejected.match(result)) {
      setSubmitError(result.payload || result.error?.message);
    }
  };

  return (
    <>
      {!hasSeenOnboarding && !accessToken && (
        <OnboardingModal open={showOnboarding} onDismiss={handleOnboardingDismiss} />
      )}
      <Container
        maxWidth="sm"
        sx={{ display: "flex", alignItems: "center", minHeight: "100vh", py: 6 }}
      >
        <Card sx={{ width: "100%" }} variant="outlined">
          <CardContent>
            <Stack spacing={3} component="form" onSubmit={handleSubmit}>
              <Stack spacing={1}>
                <Typography variant="h4" fontWeight={700}>
                  Create Account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign up to start competing on the Courtside leaderboard.
                </Typography>
              </Stack>

              {(submitError || error) && (
                <Alert severity="error">{submitError || error}</Alert>
              )}
              {signupMessage && (
                <Stack spacing={1}>
                  <Alert severity="success">{signupMessage}</Alert>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleResend}
                    disabled={resendLoading || !email}
                    startIcon={resendLoading ? <CircularProgress size={16} color="inherit" /> : null}
                  >
                    Resend confirmation email
                  </Button>
                  {resendMessage && <Alert severity="info">{resendMessage}</Alert>}
                  {resendError && <Alert severity="error">{resendError}</Alert>}
                </Stack>
              )}

              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
              />
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

              <Button
                type="submit"
                variant="contained"
                size="large"
                onClick={handleOnboardingOpen}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? "Signing up..." : "Sign Up"}
              </Button>

              <Typography variant="body2" textAlign="center">
                Already have an account?{" "}
                <Button component={RouterLink} to="/login" size="small">
                  Log in
                </Button>
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}

export default SignupScreen;
