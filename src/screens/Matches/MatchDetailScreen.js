import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { fetchMatchDetail } from "../../features/matches/matchSlice";

function TeamCard({ title, players, isWinner }) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: isWinner ? "primary.main" : "divider",
        borderWidth: isWinner ? 2 : 1,
      }}
    >
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>
          {players?.map((player) => (
            <Stack key={player.auth_id || player.id} direction="row" justifyContent="space-between">
              <Typography>{player.username}</Typography>
              <Typography color="text.secondary">Elo: {player.elo}</Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function MatchDetailScreen() {
  const { match_id: matchId } = useParams();
  const dispatch = useDispatch();
  const { matchDetail, loading, error } = useSelector((state) => state.matches);

  useEffect(() => {
    if (matchId) {
      dispatch(fetchMatchDetail(matchId));
    }
  }, [dispatch, matchId]);

  if (loading && !matchDetail) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
        <Stack alignItems="center" py={4}>
          <CircularProgress />
        </Stack>
      </Container>
    );
  }

  if (error && !matchDetail) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const isTeamAWinner = matchDetail.winner_team === "A";
  const isTeamBWinner = matchDetail.winner_team === "B";

  return (
    <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={700}>
          Match Detail
        </Typography>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="h6" fontWeight={700}>
                {matchDetail.match_type === "doubles" ? "Doubles" : "Singles"}
              </Typography>
              <Typography color="text.secondary">Winner: Team {matchDetail.winner_team}</Typography>
              <Typography>Score: {matchDetail.score}</Typography>
              <Typography color="text.secondary">
                {matchDetail.played_at
                  ? new Date(matchDetail.played_at).toLocaleDateString()
                  : ""}
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <TeamCard
          title="Team A"
          players={matchDetail.players_team_A}
          isWinner={isTeamAWinner}
        />
        <TeamCard
          title="Team B"
          players={matchDetail.players_team_B}
          isWinner={isTeamBWinner}
        />
      </Stack>
    </Container>
  );
}

export default MatchDetailScreen;
