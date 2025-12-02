import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { clearAuth, setToken } from "../features/auth/authSlice";
import { fetchCurrentUser } from "../features/user/userSlice";
import { getStoredToken } from "../services/storage";

function SplashScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = getStoredToken();
      if (!storedToken) {
        navigate("/login", { replace: true });
        return;
      }

      dispatch(setToken(storedToken));
      const result = await dispatch(fetchCurrentUser(storedToken));

      if (fetchCurrentUser.fulfilled.match(result)) {
        navigate("/home", { replace: true });
      } else {
        dispatch(clearAuth());
        navigate("/login", { replace: true });
      }
    };

    bootstrap();
  }, [dispatch, navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
      }}
    >
      <Stack spacing={2} alignItems="center">
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Loading Courtside...
        </Typography>
      </Stack>
    </Box>
  );
}

export default SplashScreen;
