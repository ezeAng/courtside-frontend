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
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { signup } from "../../features/auth/authSlice";

function SignupScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("male");
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);
    const result = await dispatch(
      signup({ email, password, username, gender })
    );
    if (signup.fulfilled.match(result)) {
      setSuccessMessage("Signup successful. Please log in to continue.");
      navigate("/login");
    } else if (result.payload) {
      setSubmitError(result.payload);
    } else if (result.error) {
      setSubmitError(result.error.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ display: "flex", alignItems: "center", minHeight: "100vh" }}>
      <Card sx={{ width: "100%" }}>
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
            {successMessage && (
              <Alert severity="success">{successMessage}</Alert>
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
  );
}

export default SignupScreen;
