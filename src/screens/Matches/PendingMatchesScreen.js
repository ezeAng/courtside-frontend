import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { confirmMatch, getPendingMatches, rejectMatch } from "../../api/matches";
import { getStoredToken } from "../../services/storage";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

export default function PendingMatchesScreen() {
  const navigate = useNavigate();
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmFeedback, setConfirmFeedback] = useState(null);

  const getPlayerLabel = (player) => {
    if (!player) return "Player";

    const names = [
      player.username,
      player.display_name,
      player.name,
      player.player_name,
      player.player_username,
      player.playerId,
      player.player_id,
      player.player_auth_id,
      player.auth_id,
    ];

    return names.find(Boolean) || "Player";
  };

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const token = getStoredToken();
      const data = await getPendingMatches(token);
      setIncoming(data.incoming || []);
      setOutgoing(data.outgoing || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleConfirm(matchId) {
    try {
      const token = getStoredToken();
      const confirmation = await confirmMatch(matchId, token);
      setConfirmFeedback(confirmation);
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleReject(matchId) {
    try {
      const token = getStoredToken();
      await rejectMatch(matchId, token);
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Loading pending matches...
          </Typography>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">Error loading matches: {error}</Alert>
      </Container>
    );
  }

  const renderIncoming = () => (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight={700}>
        Matches You Need To Confirm
      </Typography>
      {incoming.length === 0 ? (
        <Typography color="text.secondary">
          No matches waiting for your confirmation.
        </Typography>
      ) : (
        incoming.map((m) => (
          <Paper
            key={m.match_id}
            variant="outlined"
            sx={{ p: 2, borderRadius: 2 }}
          >
            <Stack spacing={1.5}>
              <Typography variant="subtitle1" fontWeight={700}>
                Match Type: {m.match_type}
              </Typography>
              <Typography variant="body2">Submitted By: {m.submitted_by}</Typography>
              <Typography variant="body2" color="text.secondary">
                Created At: {new Date(m.created_at).toLocaleString()}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleConfirm(m.match_id)}
                >
                  Confirm
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleReject(m.match_id)}
                >
                  Reject
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ))
      )}
    </Stack>
  );

  const renderOutgoing = () => (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight={700}>
        Matches You Submitted
      </Typography>
      {outgoing.length === 0 ? (
        <Typography color="text.secondary">
          No pending matches you have submitted.
        </Typography>
      ) : (
        outgoing.map((m) => (
          <Paper
            key={m.match_id}
            variant="outlined"
            sx={{ p: 2, borderRadius: 2 }}
          >
            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight={700}>
                Match Type: {m.match_type}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: Waiting for opponents to confirm
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Created At: {new Date(m.created_at).toLocaleString()}
              </Typography>
            </Stack>
          </Paper>
        ))
      )}
    </Stack>
  );

  return (
    <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
      <Dialog
        open={Boolean(confirmFeedback)}
        onClose={() => setConfirmFeedback(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Match Confirmed</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            {confirmFeedback?.upset && (
              <Alert
                severity={confirmFeedback.upset.is_upset ? "warning" : "info"}
                variant="filled"
              >
                {confirmFeedback.upset.is_upset ? "Upset! " : "Match result"}
                {confirmFeedback.upset.winner_avg_elo &&
                  confirmFeedback.upset.opponent_avg_elo &&
                  confirmFeedback.upset.elo_gap !== undefined && (
                    <>
                      {" "}Winner avg ELO: {confirmFeedback.upset.winner_avg_elo}, Opponent
                      avg ELO: {confirmFeedback.upset.opponent_avg_elo} (gap {" "}
                      {confirmFeedback.upset.elo_gap}).
                    </>
                  )}
              </Alert>
            )}

            {confirmFeedback?.updated_elos?.updates?.length > 0 && (
              <Stack spacing={0.5}>
                <Typography variant="subtitle1" fontWeight={700}>
                  ELO Updates
                </Typography>
                {confirmFeedback.updated_elos.updates.map((u, idx) => {
                  const playerLabel = getPlayerLabel(u);
                  const delta = u.delta ?? u.change ?? u.elo_change ?? 0;
                  const formattedDelta = delta > 0 ? `+${delta}` : `${delta}`;
                  return (
                    <Typography key={`${playerLabel}-${idx}`} variant="body2">
                      {playerLabel}: {u.new_elo ?? u.newElo ?? u.elo ?? ""} ({formattedDelta})
                    </Typography>
                  );
                })}
              </Stack>
            )}

            {confirmFeedback?.ranks?.length > 0 && (
              <Stack spacing={0.5}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Rank Changes
                </Typography>
                {confirmFeedback.ranks.map((r, idx) => {
                  const playerLabel = getPlayerLabel(r);
                  const movement = r.rankChange ?? 0;
                  const direction = movement > 0 ? "up" : movement < 0 ? "down" : "no";
                  const movementText =
                    direction === "no"
                      ? "No movement"
                      : `Moved ${direction} ${Math.abs(movement)} spots`;
                  return (
                    <Typography key={`${playerLabel}-${idx}`} variant="body2">
                      {playerLabel}: {movementText} (from {r.previousRank ?? "?"} to {" "}
                      {r.newRank ?? "?"})
                    </Typography>
                  );
                })}
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmFeedback(null)}>Dismiss</Button>
        </DialogActions>
      </Dialog>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/matches")}
            variant="text"
          >
            Back
          </Button>
          <Typography variant="h5" fontWeight={700}>
            Pending Matches
          </Typography>
        </Stack>
        {renderIncoming()}

        <Divider />

        {renderOutgoing()}
      </Stack>
    </Container>
  );
}
