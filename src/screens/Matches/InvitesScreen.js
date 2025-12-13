import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  acceptInvite,
  cancelInvite,
  fetchBadgeCounts,
  fetchInvites,
} from "../../services/invitesApi";
import MatchmakingLobbyModal from "./MatchmakingLobbyModal";

const tabOptions = [
  { label: "Received", value: "received" },
  { label: "Sent", value: "sent" },
];

function formatPlayersLabel(invite, currentUserId) {
  const team1 = invite.players?.filter((p) => p.team === 1) || [];
  const team2 = invite.players?.filter((p) => p.team === 2) || [];

  const isOnTeam1 = team1.some((p) => p.auth_id === currentUserId);
  const myTeam = isOnTeam1 ? team1 : team2;
  const opponentTeam = isOnTeam1 ? team2 : team1;

  const formatTeam = (team) => team.map((p) => p.username || "Player").join(" & ");

  if (myTeam.length <= 1 && opponentTeam.length <= 1) {
    return `You vs ${formatTeam(opponentTeam) || "Opponent"}`;
  }

  return `You${myTeam.length > 1 ? ` & ${formatTeam(myTeam.filter((p) => p.auth_id !== currentUserId))}` : ""} vs ${formatTeam(opponentTeam) || "Opponents"}`;
}

function InviteCard({ invite, tab, onAccept, onDecline, onCancel }) {
  const currentUserId = useSelector((state) => state.user.user?.auth_id);
  const statusLabel = invite.accepted_by ? "Accepted" : "Pending acceptance";

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography fontWeight={700}>{formatPlayersLabel(invite, currentUserId)}</Typography>
          <Typography variant="body2" color="text.secondary">
            {statusLabel}
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {new Date(invite.created_at).toLocaleString()}
        </Typography>
        {tab === "received" ? (
          <Stack direction="row" spacing={1}>
            <Button variant="contained" color="primary" onClick={() => onAccept(invite.match_id)}>
              Accept
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => onDecline(invite.match_id)}
            >
              Decline
            </Button>
          </Stack>
        ) : (
          <Button
            variant="outlined"
            color="error"
            onClick={() => onCancel(invite.match_id)}
          >
            Cancel Invite
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

function InvitesScreen() {
  const token = useSelector((state) => state.auth.accessToken);
  const navigate = useNavigate();
  const [tab, setTab] = useState("received");
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [badgeCounts, setBadgeCounts] = useState({ pending: 0, invites: 0 });
  const [modalOpen, setModalOpen] = useState(false);

  const activeInvites = useMemo(() => invites || [], [invites]);

  const loadInvites = async (type) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchInvites(token, type);
      setInvites(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshBadges = async () => {
    if (!token) return;
    try {
      const data = await fetchBadgeCounts(token);
      setBadgeCounts(data || { pending: 0, invites: 0 });
    } catch (err) {
      console.warn("Failed to load badge counts", err);
    }
  };

  useEffect(() => {
    loadInvites(tab);
    refreshBadges();
  }, [tab, token]);

  const handleAccept = async (matchId) => {
    try {
      await acceptInvite(token, matchId);
      await loadInvites(tab);
      refreshBadges();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDecline = async (matchId) => {
    const confirmDecline = window.confirm("Decline this invite?");
    if (!confirmDecline) return;
    try {
      await cancelInvite(token, matchId, "declined");
      await loadInvites(tab);
      refreshBadges();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancelInvite = async (matchId) => {
    const confirmCancel = window.confirm("Cancel this invite?");
    if (!confirmCancel) return;
    try {
      await cancelInvite(token, matchId, "cancelled");
      await loadInvites(tab);
      refreshBadges();
    } catch (err) {
      alert(err.message);
    }
  };

  const tabLabel = (label, value) => {
    const count = value === "received" ? badgeCounts.invites : badgeCounts.pending;
    return `${label}${count ? ` (${count})` : ""}`;
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/matches")}
              variant="text"
            >
              Back to Matches
            </Button>
          </Stack>
          <Button
            variant="contained"
            startIcon={<GroupAddIcon />}
            onClick={() => setModalOpen(true)}
          >
            Search for match
          </Button>
        </Stack>

        <Paper variant="outlined" sx={{ borderRadius: 2 }}>
          <Tabs
            value={tab}
            onChange={(_, val) => setTab(val)}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            {tabOptions.map((option) => (
              <Tab
                key={option.value}
                value={option.value}
                label={tabLabel(option.label, option.value)}
              />
            ))}
          </Tabs>
          <Divider />
          <Box p={2}>
            {loading ? (
              <Stack alignItems="center" spacing={2} py={3}>
                <CircularProgress />
                <Typography color="text.secondary">Loading invites...</Typography>
              </Stack>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : activeInvites.length ? (
              <Stack spacing={2}>
                {activeInvites.map((invite) => (
                  <InviteCard
                    key={invite.match_id}
                    invite={invite}
                    tab={tab}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    onCancel={handleCancelInvite}
                  />
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">No invites found.</Typography>
            )}
          </Box>
        </Paper>
      </Stack>

      <MatchmakingLobbyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onInviteCreated={() => {
          setTab("sent");
          loadInvites("sent");
          refreshBadges();
        }}
      />
    </Container>
  );
}

export default InvitesScreen;
