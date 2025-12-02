import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import DialogContentText from "@mui/material/DialogContentText";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import RecordMatchModal from "./RecordMatchModal";
import { fetchMatchHistory } from "../../features/matches/matchSlice";

function MatchHistoryScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = useSelector((state) => state.user.user?.user_id);
  const { matches, loading } = useSelector((state) => state.matches);
  const [openModal, setOpenModal] = useState(false);

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
                onClick={() => navigate(`/matches/${match.match_id || match.id}`)}
              >
                <ListItemText
                  primary={`${match.match_type === "doubles" ? "Doubles" : "Singles"} • Winner: Team ${match.winner_team}`}
                  secondary={
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.primary">
                        Score: {match.score}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Team A: {formatPlayers(match.players_team_A)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Team B: {formatPlayers(match.players_team_B)}
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
    </Container>
  );
}

export default MatchHistoryScreen;
