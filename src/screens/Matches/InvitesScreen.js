import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
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
import { getUserProfile, searchUsers } from "../../services/api";
import MatchmakingLobbyModalSuggestions from "./MatchmakingLobbyModalSuggestions";
import { normalizeProfileImage } from "../../utils/profileImage";

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

function ProfilePreviewModal({
  open,
  onClose,
  profile,
  loading,
  error,
  onInvite,
  inviteError,
  isInviting,
}) {
  const profileDetails = profile?.profile || profile;
  const stats = profile?.stats || profile?.statistics || profileDetails?.stats || profileDetails;

  const wins =
    stats?.wins ?? stats?.record?.wins ?? stats?.wins_count ?? stats?.winsCount ?? null;
  const losses =
    stats?.losses ??
    stats?.record?.losses ??
    stats?.losses_count ??
    stats?.lossesCount ??
    null;
  const matchesPlayed =
    stats?.matches_played ?? stats?.matches ?? stats?.total_matches ?? stats?.games ?? null;
  const calculatedMatches =
    matchesPlayed ?? (wins !== null && losses !== null ? wins + losses : null);
  const winRate =
    stats?.win_rate ??
    (wins !== null && losses !== null && wins + losses > 0
      ? Math.round((wins / (wins + losses)) * 100)
      : null);
  const elo = stats?.elo ?? stats?.rating ?? stats?.current_elo ?? profileDetails?.elo ?? null;

  const username =
    profileDetails?.username ||
    profileDetails?.display_name ||
    profileDetails?.name ||
    profileDetails?.email ||
    "User";

  const avatarSrc = normalizeProfileImage(profileDetails?.profile_image_url);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Player Profile</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Stack alignItems="center" spacing={2} py={2}>
            <CircularProgress />
            <Typography color="text.secondary">Loading profile...</Typography>
          </Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : profileDetails ? (
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={avatarSrc} sx={{ width: 64, height: 64 }}>
                {username?.slice(0, 1)?.toUpperCase() || "U"}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={800} gutterBottom>
                  {username}
                </Typography>
                <Typography color="text.secondary">
                  {profileDetails?.email || profileDetails?.bio || "Courtside player"}
                </Typography>
              </Box>
            </Stack>

            <Grid container spacing={1}>
              <Grid item xs={6} sm={3}>
                <Chip
                  label={`Elo: ${elo ?? "—"}`}
                  color="primary"
                  variant="outlined"
                  sx={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Chip
                  label={`Record: ${wins ?? "—"}W-${losses ?? "—"}L`}
                  variant="outlined"
                  sx={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Chip
                  label={`Win rate: ${winRate !== null ? `${winRate}%` : "—"}`}
                  variant="outlined"
                  sx={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Chip
                  label={`Matches: ${calculatedMatches ?? "—"}`}
                  variant="outlined"
                  sx={{ width: "100%" }}
                />
              </Grid>
            </Grid>

            {inviteError && <Alert severity="error">{inviteError}</Alert>}
          </Stack>
        ) : (
          <Typography color="text.secondary">Select a player to see their profile.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={<PersonAddAlt1Icon />}
          onClick={() => onInvite?.(profileDetails)}
          disabled={!profileDetails || isInviting}
        >
          {isInviting ? <CircularProgress size={20} color="inherit" /> : "Invite to game"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function InvitePlayerModal({ open, onClose, onInviteCreated }) {
  const token = useSelector((state) => state.auth.accessToken);
  const currentUser = useSelector((state) => state.user.user);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [inviteError, setInviteError] = useState(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSuggestions([]);
      setSearchError(null);
      setSelectedUser(null);
      setProfileData(null);
      setProfileModalOpen(false);
      setProfileLoading(false);
      setProfileError(null);
      setInviteError(null);
      setIsSending(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!query.trim()) {
      setSuggestions([]);
      setSearchError(null);
      return;
    }

    const handler = setTimeout(async () => {
      setLoadingSuggestions(true);
      setSearchError(null);
      try {
        const data = await searchUsers(query.trim(), token);
        const filteredResults = (data || []).filter((user) => user?.auth_id !== currentUser?.auth_id);
        const uniqueResults = [];
        const seen = new Set();

        filteredResults.forEach((user) => {
          const key = user.auth_id || user.user_id || user.id || user.username;
          if (!key || seen.has(key)) return;
          seen.add(key);
          uniqueResults.push(user);
        });

        setSuggestions(uniqueResults);
      } catch (err) {
        setSearchError(err.message || "Unable to search for users.");
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query, token, currentUser?.auth_id, open]);

  const fetchFullProfile = async (user) => {
    const username =
      user?.username || user?.display_name || user?.name || query.trim() || "";

    if (!username) {
      throw new Error("Please provide a username to search.");
    }

    try {
      const response = await getUserProfile(username, token);
      return response?.profile || response?.user || response;
    } catch (err) {
      const fallbackResults = await searchUsers(username, token);
      const bestMatch = (fallbackResults || []).find(
        (entry) =>
          entry.username === username ||
          entry.display_name === username ||
          entry.name === username
      );

      if (bestMatch) return bestMatch;
      if (fallbackResults?.length) return fallbackResults[0];
      throw err;
    }
  };

  const handleSendInvite = async (userOverride) => {
    const targetUser = userOverride || profileData || selectedUser;
    if (!targetUser || !token) return;
    const opponentAuthId =
      targetUser.auth_id || targetUser.user_id || targetUser.id || targetUser.profile_id;
    if (!opponentAuthId) {
      setInviteError("Unable to send invite to this user");
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
            targetUser.username ||
            targetUser.display_name ||
            targetUser.name ||
            "Player",
          team: 2,
        },
      ],
    };

    try {
      setIsSending(true);
      setInviteError(null);
      await createInvite(token, payload);
      onInviteCreated?.();
      setProfileModalOpen(false);
      onClose?.();
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleOptionSelect = async (_event, value) => {
    setSelectedUser(value);
    if (!value) return;
    setProfileModalOpen(true);
    setProfileLoading(true);
    setProfileError(null);
    setInviteError(null);
    try {
      const profile = await fetchFullProfile(value);
      setProfileData(profile);
    } catch (err) {
      setProfileError(err.message || "Unable to load player profile.");
      setProfileData(value);
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Invite a Player</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Autocomplete
              freeSolo
              options={suggestions}
              loading={loadingSuggestions}
              inputValue={query}
              value={selectedUser}
              onChange={handleOptionSelect}
              onInputChange={(_, value) => {
                setQuery(value);
                setSearchError(null);
              }}
              getOptionLabel={(option) =>
                typeof option === "string"
                  ? option
                  : option.username || option.display_name || option.name || ""
              }
              isOptionEqualToValue={(option, value) => {
                if (!option || !value) return false;
                if (option.auth_id && value.auth_id) return option.auth_id === value.auth_id;
                return (
                  option.username === value.username ||
                  option.display_name === value.display_name ||
                  option.name === value.name
                );
              }}
              renderOption={(props, option) => {
                const optionData =
                  typeof option === "string"
                    ? { username: option }
                    : option || {};
                const optionKey =
                  optionData.auth_id ||
                  optionData.id ||
                  optionData.username ||
                  optionData.display_name ||
                  optionData.name ||
                  option;

                return (
                  <li {...props} key={optionKey}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={normalizeProfileImage(optionData.profile_image_url)}>
                        {optionData.username?.slice(0, 1)?.toUpperCase() || "U"}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={700}>
                          {optionData.username || optionData.display_name || optionData.name || "User"}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          Elo: {optionData.elo ?? optionData.rating ?? "N/A"}
                        </Typography>
                      </Box>
                    </Stack>
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search by username"
                  placeholder="Start typing a username"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingSuggestions ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  helperText="Select a player from the suggestions to view their profile."
                  fullWidth
                />
              )}
            />

            {searchError && <Alert severity="error">{searchError}</Alert>}
            {!suggestions.length && query.trim() && !loadingSuggestions && !searchError && (
              <Alert severity="info">No players match that username yet. Try another search.</Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <ProfilePreviewModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        profile={profileData}
        loading={profileLoading}
        error={profileError}
        onInvite={handleSendInvite}
        inviteError={inviteError}
        isInviting={isSending}
      />
    </>
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
