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

function LeaderboardScreen() {
  const dispatch = useDispatch();
  const { gender, data, loading, error } = useSelector((state) => state.leaderboard);
  console.log("Leaderboard data:", data);

  useEffect(() => {
    dispatch(fetchLeaderboard(gender));
  }, [dispatch, gender]);

  const handleGenderChange = (newGender) => {
    dispatch(setGender(newGender));
    dispatch(fetchLeaderboard(newGender));
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
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
    </Container>
  );
}

export default LeaderboardScreen;
