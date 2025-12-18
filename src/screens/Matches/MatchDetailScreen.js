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
import { alpha } from "@mui/material/styles";
import { fetchMatchDetail } from "../../features/matches/matchSlice";

const getOutcomeStyles = (theme, outcome) => {
  const isWinner = outcome === "winner";
  const isLoser = outcome === "loser";

  return {
    color: isWinner
      ? theme.palette.success.main
      : isLoser
      ? theme.palette.error.main
      : theme.palette.text.primary,
    backgroundColor: isWinner
      ? alpha(theme.palette.success.main, 0.12)
      : isLoser
      ? alpha(theme.palette.error.main, 0.12)
      : alpha(theme.palette.text.primary, 0.04),
    px: 1,
    py: 0.5,
    borderRadius: 1,
    display: "inline-flex",
    alignItems: "center",
    gap: 0.5,
    fontWeight: isWinner ? 800 : 600,
    fontSize: isWinner ? "1.05rem" : "1rem",
    transform: isWinner ? "translateY(-2px)" : "none",
    boxShadow: isWinner
      ? `0 6px 12px ${alpha(theme.palette.success.main, 0.18)}`
      : "none",
  };
};

const getOutcomeFromWinnerTeam = (winnerTeam, teamKey) => {
  if (winnerTeam === "draw" || winnerTeam === null) return "draw";
  if (!winnerTeam) return "pending";
  return winnerTeam === teamKey ? "winner" : "loser";
};

function TeamCard({ title, players, outcome }) {
  const isWinner = outcome === "winner";

  return (
    <Card
      variant="outlined"
      sx={(theme) => ({
        borderColor: isWinner
          ? theme.palette.success.main
          : outcome === "loser"
          ? alpha(theme.palette.error.main, 0.4)
          : "divider",
        borderWidth: isWinner ? 2 : 1,
        boxShadow: isWinner
          ? `0 6px 14px ${alpha(theme.palette.success.main, 0.16)}`
          : "none",
        transform: isWinner ? "translateY(-2px)" : "none",
        transition: "all 0.2s ease",
      })}
    >
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>
          {players?.map((player) => (
            <Stack
              key={player.auth_id || player.id}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography sx={(theme) => getOutcomeStyles(theme, outcome)}>
                {player.username}
              </Typography>
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

  const winnerTeam = matchDetail.winner_team;
  const isDraw = winnerTeam === "draw" || winnerTeam === null;
  const winnerLabel = isDraw
    ? "Draw"
    : winnerTeam
    ? `Team ${winnerTeam}`
    : "";

  const teamAOutcome = getOutcomeFromWinnerTeam(winnerTeam, "A");
  const teamBOutcome = getOutcomeFromWinnerTeam(winnerTeam, "B");

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
              <Typography color="text.secondary">Result: {winnerLabel}</Typography>
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
          outcome={teamAOutcome}
        />
        <TeamCard
          title="Team B"
          players={matchDetail.players_team_B}
          outcome={teamBOutcome}
        />
      </Stack>
    </Container>
  );
}

export default MatchDetailScreen;
