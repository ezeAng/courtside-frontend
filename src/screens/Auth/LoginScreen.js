import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link as RouterLink } from "react-router-dom";
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
import { clearAuth, login } from "../../features/auth/authSlice";
import { fetchCurrentUser } from "../../features/user/userSlice";
import logo from "../../logo.svg";
function LoginScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError(null);
    const loginResult = await dispatch(login({ email, password }));
    if (login.fulfilled.match(loginResult)) {
      const token = loginResult.payload;
      const userResult = await dispatch(fetchCurrentUser(token));
      if (fetchCurrentUser.fulfilled.match(userResult)) {
        navigate("/home");
      } else {
        setSubmitError("Unable to load profile. Please log in again.");
        dispatch(clearAuth());
      }
    } else if (loginResult.payload) {
      setSubmitError(loginResult.payload || "Incorrect email or password");
    } else if (loginResult.error) {
      setSubmitError(loginResult.error.message || "Incorrect email or password");
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
            
            {/* Logo */}
            <Box display="flex" justifyContent="center">
              <Box
                component="img"
                src={logo}
                alt="App logo"
                sx={{
                  height: 128,
                  mb: 1,
                }}
              />
            </Box>

            <Stack spacing={1} textAlign="center">
              <Typography variant="h4" fontWeight={700}>
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Log in to continue competing.
              </Typography>
            </Stack>

            {(submitError || error) && (
              <Alert severity="error">{submitError || error}</Alert>
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

            <Button
              component={RouterLink}
              to="/forgot-password"
              size="small"
              sx={{ alignSelf: "flex-end" }}
            >
              Forgot password?
            </Button>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? "Logging in..." : "Log In"}
            </Button>

            <Typography variant="body2" textAlign="center">
              No account?{" "}
              <Button component={RouterLink} to="/signup" size="small">
                Sign up
              </Button>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}

export default LoginScreen;
