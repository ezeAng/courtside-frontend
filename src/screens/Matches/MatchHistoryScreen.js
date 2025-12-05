import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import RecordMatchModal from "./RecordMatchModal";
import { fetchMatchHistory } from "../../features/matches/matchSlice";

function TeamCard({ title, players, isWinner }) {
  return (
    <Stack
      spacing={1}
      sx={{
        border: 1,
        borderColor: isWinner ? "primary.main" : "divider",
        borderRadius: 2,
        p: 2,
      }}
    >
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>
      {players?.map((player) => (
        <Stack key={player.auth_id || player.id || player.username} direction="row" justifyContent="space-between">
          <Typography>{player.username || player.name}</Typography>
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
  const userId = useSelector((state) => state.user.user?.auth_id);
  const { matches, loading } = useSelector((state) => state.matches);
  const [openModal, setOpenModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  useEffect(() => {
    if (userId) {
      dispatch(fetchMatchHistory(userId));
    }
  }, [dispatch, userId]);

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
    const isTeamAWinner = selectedMatch.winner_team === "A";
    const isTeamBWinner = selectedMatch.winner_team === "B";

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
              <Typography color="text.secondary">
                Winner: Team {selectedMatch.winner_team}
              </Typography>
              <Typography>Score: {selectedMatch.score}</Typography>
              <Typography color="text.secondary">
                {selectedMatch.played_at
                  ? new Date(selectedMatch.played_at).toLocaleDateString()
                  : ""}
              </Typography>
            </Stack>

            <TeamCard title="Team A" players={teamAPlayers} isWinner={isTeamAWinner} />
            <TeamCard title="Team B" players={teamBPlayers} isWinner={isTeamBWinner} />
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
          <Button variant="contained" onClick={() => setOpenModal(true)}>
            Record Match
          </Button>
        </Stack>

        {loading ? (
          <Stack alignItems="center" py={4}>
            <CircularProgress />
          </Stack>
        ) : matches?.length ? (
          <List>
            {matches.map((match) => (
              <ListItemButton
                key={match.match_id || match.id}
                divider
                onClick={() => handleMatchClick(match)}
              >
                <ListItemText
                  primary={`${match.match_type === "doubles" ? "Doubles" : "Singles"} • Winner: Team ${match.winner_team}`}
                  secondary={
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.primary">
                        Score: {match.score}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Team A: {formatPlayers(match.players?.team_A)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
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
            ))}
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
