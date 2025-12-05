import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import { confirmMatch, getPendingMatches, rejectMatch } from "../../api/matches";
import { getStoredToken } from "../../services/storage";

export default function PendingMatchesScreen() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      await confirmMatch(matchId, token);
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
            key={m.id}
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
                  onClick={() => handleConfirm(m.id)}
                >
                  Confirm
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleReject(m.id)}
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
            key={m.id}
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
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={700}>
          Pending Matches
        </Typography>

        {renderIncoming()}

        <Divider />

        {renderOutgoing()}
      </Stack>
    </Container>
  );
}
