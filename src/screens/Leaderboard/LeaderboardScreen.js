import Container from "@mui/material/Container";
import LeaderboardPanel from "../../components/leaderboard/LeaderboardPanel";

function LeaderboardScreen() {
  return (
    <Container maxWidth="md" sx={{ py: 4, pb: 10 }}>
      <LeaderboardPanel />
    </Container>
  );
}

export default LeaderboardScreen;
