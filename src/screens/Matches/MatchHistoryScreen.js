import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "@mui/material/Button";
import Badge from "@mui/material/Badge";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import InboxIcon from "@mui/icons-material/Inbox";
import { useNavigate } from "react-router-dom";
import RecordMatchModal from "./RecordMatchModal";
import { fetchMatchHistory } from "../../features/matches/matchSlice";
import { getPendingMatches } from "../../api/matches";
import { getStoredToken } from "../../services/storage";

const getOutcomeFromWinnerTeam = (winnerTeam, teamKey) => {
  if (winnerTeam === "draw" || winnerTeam === null) return "draw";
  if (!winnerTeam) return "pending";
  return winnerTeam === teamKey ? "winner" : "loser";
};

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

function TeamCard({ title, players, outcome }) {
  const isWinner = outcome === "winner";

  return (
    <Stack
      spacing={1}
      sx={(theme) => ({
        border: 1,
        borderColor: isWinner
          ? theme.palette.success.main
          : outcome === "loser"
          ? alpha(theme.palette.error.main, 0.4)
          : "divider",
        borderRadius: 2,
        p: 2,
        boxShadow: isWinner
          ? `0 6px 14px ${alpha(theme.palette.success.main, 0.16)}`
          : "none",
        transform: isWinner ? "translateY(-2px)" : "none",
        transition: "all 0.2s ease",
      })}
    >
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>
      {players?.map((player) => (
        <Stack
          key={player.auth_id || player.id || player.username}
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography sx={(theme) => getOutcomeStyles(theme, outcome)}>
            {player.username || player.name}
          </Typography>
          {player.elo !== undefined && (
            <Typography color="text.secondary">Elo: {player.elo}</Typography>
          )}
        </Stack>
      ))}
    </Stack>
  );
}

function MatchHistoryScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = useSelector((state) => state.user.user?.auth_id);
  const { matches, loading } = useSelector((state) => state.matches);
  const [openModal, setOpenModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  useEffect(() => {
    if (userId) {
      dispatch(fetchMatchHistory(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    async function loadPendingCount() {
      const token = getStoredToken();
      if (!token) return;

      try {
        const data = await getPendingMatches(token);
        setPendingCount(data.incoming?.length || 0);
      } catch (err) {
        console.error("Failed to load pending matches", err);
      }
    }

    loadPendingCount();
  }, []);

  const handleRecorded = () => {
    setOpenModal(false);
    if (userId) {
      dispatch(fetchMatchHistory(userId));
    }
  };

  const formatPlayers = (team) =>
    team?.map((player) => player.username || player.name).join(", ") || "";

  const handleMatchClick = (match) => {
    setSelectedMatch(match);
  };

  const handleCloseMatchDetail = () => {
    setSelectedMatch(null);
  };

  const getTeamPlayers = (match, teamKey) =>
    match?.players?.[teamKey] || match?.[`players_${teamKey}`] || [];

  const renderMatchDetail = () => {
    if (!selectedMatch) return null;

    const teamAPlayers = getTeamPlayers(selectedMatch, "team_A");
    const teamBPlayers = getTeamPlayers(selectedMatch, "team_B");
    const winnerTeam = selectedMatch.winner_team;
    const isDraw = winnerTeam === "draw" || winnerTeam === null;
    const teamAOutcome = getOutcomeFromWinnerTeam(winnerTeam, "A");
    const teamBOutcome = getOutcomeFromWinnerTeam(winnerTeam, "B");
    const winnerLabel = isDraw
      ? "Draw"
      : winnerTeam
      ? `Team ${winnerTeam}`
      : "";

    return (
      <Dialog
        open={Boolean(selectedMatch)}
        onClose={handleCloseMatchDetail}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Match Detail</DialogTitle>
        <DialogContent>
          <Stack spacing={2} py={1}>
            <Stack spacing={0.5}>
              <Typography variant="h6" fontWeight={700}>
                {selectedMatch.match_type === "doubles" ? "Doubles" : "Singles"}
              </Typography>
              <Typography color="text.secondary">Result: {winnerLabel}</Typography>
              <Typography>Score: {selectedMatch.score}</Typography>
              <Typography color="text.secondary">
                {selectedMatch.played_at
                  ? new Date(selectedMatch.played_at).toLocaleDateString()
                  : ""}
              </Typography>
            </Stack>

            <TeamCard title="Team A" players={teamAPlayers} outcome={teamAOutcome} />
            <TeamCard title="Team B" players={teamBPlayers} outcome={teamBOutcome} />
          </Stack>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight={700}>
            Match History
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={() => navigate("/matches/pending")}> 
              <Badge
                color="error"
                badgeContent={pendingCount}
                overlap="circular"
                showZero
              >
                <InboxIcon />
              </Badge>
            </IconButton>
            <Button variant="contained" onClick={() => setOpenModal(true)}>
              Record Match
            </Button>
          </Stack>
        </Stack>

        {loading ? (
          <Stack alignItems="center" py={4}>
            <CircularProgress />
          </Stack>
        ) : matches?.length ? (
          <List>
            {matches.map((match) => {
              const winnerTeam = match.winner_team;
              const teamAOutcome = getOutcomeFromWinnerTeam(winnerTeam, "A");
              const teamBOutcome = getOutcomeFromWinnerTeam(winnerTeam, "B");

              return (
                <ListItemButton
                  key={match.match_id || match.id}
                  divider
                  onClick={() => handleMatchClick(match)}
                >
                  <ListItemText
                    primary={`${match.match_type === "doubles" ? "Doubles" : "Singles"} • ${(() => {
                      const wt = match.winner_team;
                      if (wt === "draw" || wt === null) return "Draw";
                      if (wt) return `Winner: Team ${wt}`;
                      return "Result pending";
                    })()}`}
                    primaryTypographyProps={{ component: "span" }}
                    secondaryTypographyProps={{ component: "div" }}
                    secondary={
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.primary">
                          Score: {match.score}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={(theme) => getOutcomeStyles(theme, teamAOutcome)}
                        >
                          Team A: {formatPlayers(match.players?.team_A)}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={(theme) => getOutcomeStyles(theme, teamBOutcome)}
                        >
                          Team B: {formatPlayers(match.players?.team_B)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {match.played_at
                            ? new Date(match.played_at).toLocaleDateString()
                            : ""}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItemButton>
              );
            })}
          </List>
        ) : (
          <DialogContentText>No matches recorded yet.</DialogContentText>
        )}
      </Stack>

      <RecordMatchModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onRecorded={handleRecorded}
      />
      {renderMatchDetail()}
    </Container>
  );
}

export default MatchHistoryScreen;
