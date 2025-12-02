import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import GenderToggle from "../../components/GenderToggle";
import LeaderboardCard from "../../components/LeaderboardCard";
import { setGender, fetchLeaderboard } from "../../features/leaderboard/leaderboardSlice";

function HomeScreen() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { gender, data, loading, error } = useSelector((state) => state.leaderboard);

  useEffect(() => {
    dispatch(fetchLeaderboard(gender));
  }, [dispatch, gender]);

  const handleGenderChange = (newGender) => {
    dispatch(setGender(newGender));
    dispatch(fetchLeaderboard(newGender));
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={700}>
            {user ? `Welcome, ${user.username}` : "Welcome"}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {user ? `Elo: ${user.elo}` : "Loading your profile..."}
          </Typography>
        </Stack>

        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" spacing={2}>
            <Typography variant="h5" fontWeight={700}>
              Leaderboard
            </Typography>
            <GenderToggle value={gender} onChange={handleGenderChange} />
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          {loading ? (
            <Stack alignItems="center" py={4}>
              <CircularProgress />
            </Stack>
          ) : (
            <Stack spacing={2}>
              {data.map((entry, index) => (
                <LeaderboardCard
                  key={entry.id || `${entry.username}-${index}`}
                  username={entry.username}
                  elo={entry.elo}
                  gender={entry.gender}
                  rank={entry.rank ?? index + 1}
                />
              ))}
              {!data.length && !error && (
                <Typography color="text.secondary">No entries yet.</Typography>
              )}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Container>
  );
}

export default HomeScreen;
