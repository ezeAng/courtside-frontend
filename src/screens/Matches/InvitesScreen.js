import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  acceptInvite,
  cancelInvite,
  fetchBadgeCounts,
  fetchInvites,
  createInvite,
} from "../../services/invitesApi";
import { searchUsers } from "../../services/api";
import MatchmakingLobbyModalSuggestions from "./MatchmakingLobbyModalSuggestions";

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

function InvitePlayerModal({ open, onClose, onInviteCreated }) {
  const token = useSelector((state) => state.auth.accessToken);
  const currentUser = useSelector((state) => state.user.user);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setError(null);
      setSelectedUser(null);
      setIsSending(false);
    }
  }, [open]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchUsers(query.trim(), token);
      const filteredResults = (data || []).filter(
        (user) => user?.auth_id !== currentUser?.auth_id
      );
      setResults(filteredResults);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async () => {
    if (!selectedUser || !token) return;
    const opponentAuthId =
      selectedUser.auth_id || selectedUser.user_id || selectedUser.id;
    if (!opponentAuthId) {
      setError("Unable to send invite to this user");
      return;
    }

    const payload = {
      mode: "singles",
      players: [
        {
          auth_id: currentUser?.auth_id,
          username: currentUser?.username || currentUser?.display_name || "You",
          team: 1,
        },
        {
          auth_id: opponentAuthId,
          username:
            selectedUser.username ||
            selectedUser.display_name ||
            selectedUser.name ||
            "Player",
          team: 2,
        },
      ],
    };

    try {
      setIsSending(true);
      setError(null);
      await createInvite(token, payload);
      onInviteCreated?.();
      onClose?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Invite a Player</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            label="Search by username"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            fullWidth
          />
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading || !query.trim()}
            >
              {loading ? <CircularProgress size={20} /> : "Search"}
            </Button>
            <Button variant="text" onClick={() => setQuery("")}>Clear</Button>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          {results.length === 0 && !loading ? (
            <Typography color="text.secondary" variant="body2">
              Search for a username to invite.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {results.map((user) => {
                const isSelected = selectedUser?.auth_id === user.auth_id;
                return (
                  <Paper
                    key={user.auth_id || user.id}
                    variant={isSelected ? "outlined" : "elevation"}
                    sx={{
                      p: 1.5,
                      borderColor: isSelected ? "primary.main" : undefined,
                      cursor: "pointer",
                    }}
                    onClick={() => setSelectedUser(user)}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack>
                        <Typography fontWeight={600}>
                          {user.username || user.display_name || user.name || "User"}
                        </Typography>
                        {user.email && (
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        )}
                      </Stack>
                      {isSelected && (
                        <Typography color="primary" fontWeight={700}>
                          Selected
                        </Typography>
                      )}
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<PersonAddAlt1Icon />}
          onClick={handleSendInvite}
          disabled={!selectedUser || isSending}
        >
          {isSending ? <CircularProgress size={20} color="inherit" /> : "Send Invite"}
        </Button>
      </DialogActions>
    </Dialog>
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
  const [suggestionsModalOpen, setSuggestionsModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

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
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<PersonAddAlt1Icon />}
              onClick={() => setInviteModalOpen(true)}
            >
              Invite player
            </Button>
            <Button
              variant="contained"
              startIcon={<GroupAddIcon />}
              onClick={() => setSuggestionsModalOpen(true)}
            >
              Search for match
            </Button>
          </Stack>
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

      <MatchmakingLobbyModalSuggestions
        open={suggestionsModalOpen}
        onClose={() => setSuggestionsModalOpen(false)}
        onInviteSent={() => {
          setTab("sent");
          loadInvites("sent");
          refreshBadges();
        }}
      />
      <InvitePlayerModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
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
