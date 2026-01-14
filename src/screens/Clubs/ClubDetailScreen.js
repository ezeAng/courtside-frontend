import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import GroupIcon from "@mui/icons-material/Group";
import AddIcon from "@mui/icons-material/Add";
import {
  approveClubMember,
  createClubSession,
  deleteClubSession,
  fetchClubDetails,
  fetchClubLeague,
  fetchClubRequests,
  fetchClubSessions,
  joinClub,
  leaveClub,
  rejectClubMember,
  updateClub,
  updateClubSession,
} from "../../api/clubs";

const visibilityOptions = [
  { label: "Public", value: "public" },
  { label: "Private", value: "private" },
];

const adminRoles = ["core_admin", "admin"];

const getClubVisibility = (club) => {
  if (club?.visibility) return club.visibility;
  if (club?.is_private !== undefined) return club.is_private ? "private" : "public";
  if (club?.is_public !== undefined) return club.is_public ? "public" : "private";
  return "public";
};

const getClubEmblem = (club) =>
  club?.emblem_url || club?.emblem || club?.logo_url || club?.image_url || "";

const getClubMemberCount = (club) =>
  club?.member_count ?? club?.members_count ?? club?.members?.length ?? 0;

const getClubShortDescription = (club) =>
  club?.short_description || club?.shortDescription || club?.description || "";

const getMembershipInfo = (club) =>
  club?.membership || club?.current_user_membership || club?.membership_info || null;

const getMembershipStatus = (club) =>
  getMembershipInfo(club)?.status ||
  club?.membership_status ||
  club?.current_user_membership_status ||
  null;

const getMembershipRole = (club) =>
  getMembershipInfo(club)?.role || club?.role || club?.current_user_role || null;

const getSessionId = (session) => session?.id || session?.session_id;

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const toDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (num) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
};

const EditClubModal = ({ open, club, onClose, onUpdated }) => {
  const token = useSelector((state) => state.auth.accessToken);
  const [form, setForm] = useState({
    name: "",
    short_description: "",
    description: "",
    cadence: "",
    visibility: "public",
    emblem_url: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (club && open) {
      setForm({
        name: club?.name || "",
        short_description: club?.short_description || club?.shortDescription || "",
        description: club?.description || "",
        cadence: club?.cadence || club?.meeting_cadence || "",
        visibility: getClubVisibility(club),
        emblem_url: getClubEmblem(club),
      });
    }
  }, [club, open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!club) return;
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        short_description: form.short_description,
        description: form.description,
        cadence: form.cadence,
        visibility: form.visibility,
        emblem_url: form.emblem_url,
      };
      await updateClub(club.id || club.club_id, payload, token);
      onUpdated();
    } catch (err) {
      setError(err.message || "Failed to update club");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Club</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Club name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Short description"
            name="short_description"
            value={form.short_description}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={3}
          />
          <TextField
            label="Cadence"
            name="cadence"
            value={form.cadence}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            select
            label="Visibility"
            name="visibility"
            value={form.visibility}
            onChange={handleChange}
            fullWidth
          >
            {visibilityOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Emblem URL"
            name="emblem_url"
            value={form.emblem_url}
            onChange={handleChange}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving..." : "Save changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CreateSessionModal = ({ open, onClose, onCreated }) => {
  const token = useSelector((state) => state.auth.accessToken);
  const [form, setForm] = useState({
    title: "",
    start_time: "",
    end_time: "",
    venue: "",
    capacity: "",
    session_type: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setForm({
        title: "",
        start_time: "",
        end_time: "",
        venue: "",
        capacity: "",
        session_type: "",
      });
      setError("");
      setSubmitting(false);
    }
  }, [open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await onCreated({
        title: form.title,
        start_time: form.start_time,
        end_time: form.end_time,
        venue: form.venue,
        capacity: form.capacity ? Number(form.capacity) : null,
        session_type: form.session_type,
      }, token);
    } catch (err) {
      setError(err.message || "Failed to create session");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Session</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Title" name="title" value={form.title} onChange={handleChange} fullWidth />
          <TextField
            label="Start time"
            name="start_time"
            type="datetime-local"
            value={form.start_time}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End time"
            name="end_time"
            type="datetime-local"
            value={form.end_time}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField label="Venue" name="venue" value={form.venue} onChange={handleChange} fullWidth />
          <TextField
            label="Capacity"
            name="capacity"
            type="number"
            value={form.capacity}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Session type"
            name="session_type"
            value={form.session_type}
            onChange={handleChange}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const EditSessionModal = ({ open, session, onClose, onUpdated }) => {
  const token = useSelector((state) => state.auth.accessToken);
  const [form, setForm] = useState({
    title: "",
    start_time: "",
    end_time: "",
    venue: "",
    capacity: "",
    session_type: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session && open) {
      setForm({
        title: session?.title || "",
        start_time: toDateTimeLocal(session?.start_time || session?.starts_at),
        end_time: toDateTimeLocal(session?.end_time || session?.ends_at),
        venue: session?.venue || "",
        capacity: session?.capacity || "",
        session_type: session?.session_type || "",
      });
    }
  }, [open, session]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!session) return;
    setSubmitting(true);
    setError("");
    try {
      await onUpdated(
        getSessionId(session),
        {
          title: form.title,
          start_time: form.start_time,
          end_time: form.end_time,
          venue: form.venue,
          capacity: form.capacity ? Number(form.capacity) : null,
          session_type: form.session_type,
        },
        token
      );
    } catch (err) {
      setError(err.message || "Failed to update session");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Session</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Title" name="title" value={form.title} onChange={handleChange} fullWidth />
          <TextField
            label="Start time"
            name="start_time"
            type="datetime-local"
            value={form.start_time}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End time"
            name="end_time"
            type="datetime-local"
            value={form.end_time}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField label="Venue" name="venue" value={form.venue} onChange={handleChange} fullWidth />
          <TextField
            label="Capacity"
            name="capacity"
            type="number"
            value={form.capacity}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Session type"
            name="session_type"
            value={form.session_type}
            onChange={handleChange}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving..." : "Save changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function ClubDetailScreen() {
  const { club_id: clubId } = useParams();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.accessToken);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinStatus, setJoinStatus] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [createSessionOpen, setCreateSessionOpen] = useState(false);
  const [editSession, setEditSession] = useState(null);
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState("");
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState("");
  const [league, setLeague] = useState([]);
  const [leagueLoading, setLeagueLoading] = useState(false);
  const [leagueError, setLeagueError] = useState("");

  const loadClub = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    setError("");
    try {
      const payload = await fetchClubDetails(clubId, token);
      const detail = payload?.club || payload;
      setClub(detail);
    } catch (err) {
      setError(err.message || "Failed to load club");
    } finally {
      setLoading(false);
    }
  }, [clubId, token]);

  const loadRequests = useCallback(async () => {
    if (!clubId) return;
    setRequestsLoading(true);
    setRequestsError("");
    try {
      const payload = await fetchClubRequests(clubId, token);
      const items = Array.isArray(payload) ? payload : payload?.requests || payload?.items || [];
      setRequests(items);
    } catch (err) {
      setRequestsError(err.message || "Failed to load requests");
      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  }, [clubId, token]);

  const loadSessions = useCallback(async () => {
    if (!clubId) return;
    setSessionsLoading(true);
    setSessionsError("");
    try {
      const payload = await fetchClubSessions(clubId, token);
      const items = Array.isArray(payload) ? payload : payload?.sessions || payload?.items || [];
      setSessions(items);
    } catch (err) {
      setSessionsError(err.message || "Failed to load sessions");
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, [clubId, token]);

  const loadLeague = useCallback(async () => {
    if (!clubId) return;
    setLeagueLoading(true);
    setLeagueError("");
    try {
      const payload = await fetchClubLeague(clubId, token);
      const items = Array.isArray(payload) ? payload : payload?.leaderboard || payload?.items || [];
      setLeague(items);
    } catch (err) {
      setLeagueError(err.message || "Failed to load league");
      setLeague([]);
    } finally {
      setLeagueLoading(false);
    }
  }, [clubId, token]);

  useEffect(() => {
    loadClub();
  }, [loadClub]);

  useEffect(() => {
    if (tab === "requests") {
      loadRequests();
    }
    if (tab === "sessions") {
      loadSessions();
    }
    if (tab === "league") {
      loadLeague();
    }
  }, [tab, loadRequests, loadSessions, loadLeague]);

  const membershipStatus = getMembershipStatus(club);
  const membershipRole = getMembershipRole(club);
  const isMember = membershipStatus === "active";
  const isPending =
    ["requested", "pending"].includes(membershipStatus) || joinStatus === "requested";
  const isAdmin = membershipRole ? adminRoles.includes(membershipRole) : false;
  const visibility = getClubVisibility(club);
  const isPrivate = visibility === "private";

  const handleJoin = async () => {
    if (!clubId) return;
    setJoinLoading(true);
    setJoinError("");
    try {
      const response = await joinClub(clubId, token);
      const status = response?.status || response?.membership_status || response?.result?.status;
      setJoinStatus(status || "");
      if (status === "joined" || status === "active") {
        await loadClub();
      }
    } catch (err) {
      setJoinError(err.message || "Failed to join club");
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!clubId) return;
    setJoinLoading(true);
    setJoinError("");
    try {
      await leaveClub(clubId, token);
      await loadClub();
    } catch (err) {
      setJoinError(err.message || "Failed to leave club");
    } finally {
      setJoinLoading(false);
    }
  };

  const handleRequestAction = useCallback(
    async (request, action) => {
      const requestUser = request?.user || request?.member || request?.profile || request;
      const userId = requestUser?.id || request?.user_id || request?.member_id;
      if (!userId || !clubId) return;
      setRequestsError("");
      try {
        if (action === "approve") {
          await approveClubMember(clubId, userId, token);
        } else {
          await rejectClubMember(clubId, userId, token);
        }
        setRequests((prev) =>
          prev.filter((item) => {
            const itemUser = item?.user || item?.member || item?.profile || item;
            const itemId = itemUser?.id || item?.user_id || item?.member_id;
            return itemId !== userId;
          })
        );
      } catch (err) {
        setRequestsError(err.message || "Failed to update request");
      }
    },
    [clubId, token]
  );

  const handleCreateSession = async (payload, authToken) => {
    await createClubSession(clubId, payload, authToken);
    setCreateSessionOpen(false);
    await loadSessions();
  };

  const handleUpdateSession = async (sessionId, payload, authToken) => {
    await updateClubSession(sessionId, payload, authToken);
    setEditSession(null);
    await loadSessions();
  };

  const handleDeleteSession = useCallback(
    async (sessionId) => {
      setSessionsError("");
      try {
        await deleteClubSession(sessionId, token);
        await loadSessions();
      } catch (err) {
        setSessionsError(err.message || "Failed to cancel session");
      }
    },
    [loadSessions, token]
  );

  const sessionCards = useMemo(
    () =>
      sessions.map((session) => {
        const sessionId = getSessionId(session);
        return (
          <Card key={sessionId} variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {session?.title || "Untitled Session"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDateTime(session?.start_time || session?.starts_at)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {session?.venue || "Venue TBD"}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {session?.capacity !== undefined && (
                    <Chip label={`Capacity: ${session.capacity}`} size="small" />
                  )}
                  {session?.session_type && <Chip label={session.session_type} size="small" />}
                </Stack>
                {isAdmin && (
                  <Stack direction="row" spacing={1}>
                    <Button size="small" startIcon={<EditIcon />} onClick={() => setEditSession(session)}>
                      Edit
                    </Button>
                    <Button size="small" color="error" onClick={() => handleDeleteSession(sessionId)}>
                      Cancel
                    </Button>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        );
      }),
    [handleDeleteSession, isAdmin, sessions]
  );

  const leagueRows = useMemo(
    () =>
      league.map((entry, index) => {
        const rank = entry?.rank ?? entry?.position ?? index + 1;
        const name = entry?.player_name || entry?.name || entry?.user?.name || "Player";
        const elo = entry?.elo ?? entry?.rating ?? "";
        return (
          <ListItem key={`${name}-${rank}`} divider>
            <ListItemText
              primary={`#${rank} ${name}`}
              secondary={elo !== "" ? `Elo: ${elo}` : null}
            />
          </ListItem>
        );
      }),
    [league]
  );

  const requestsRows = useMemo(
    () =>
      requests.map((request) => {
        const user = request?.user || request?.member || request?.profile || request;
        const name =
          user?.name ||
          user?.full_name ||
          user?.display_name ||
          user?.username ||
          "Pending member";
        const subtitle = user?.email || user?.username || "";
        return (
          <ListItem
            key={user?.id || request?.user_id || request?.member_id || name}
            divider
            secondaryAction={
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="outlined" onClick={() => handleRequestAction(request, "reject")}>
                  Reject
                </Button>
                <Button size="small" variant="contained" onClick={() => handleRequestAction(request, "approve")}>
                  Approve
                </Button>
              </Stack>
            }
          >
            <ListItemAvatar>
              <Avatar src={user?.avatar_url || user?.profile_image_url || ""}>
                {name?.charAt(0)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={name} secondary={subtitle} />
          </ListItem>
        );
      }),
    [handleRequestAction, requests]
  );

  const tabs = useMemo(() => {
    const baseTabs = [
      { value: "overview", label: "Overview" },
      { value: "sessions", label: "Sessions" },
      { value: "league", label: "League" },
    ];
    if (isAdmin) {
      baseTabs.push({ value: "requests", label: "Requests" });
    }
    return baseTabs;
  }, [isAdmin]);

  return (
    <Container maxWidth="sm" sx={{ pb: 12, pt: 2 }}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/clubs")}
            size="small"
          >
            Back
          </Button>
        </Stack>
        {loading && (
          <Stack alignItems="center" sx={{ py: 4 }}>
            <CircularProgress size={28} />
          </Stack>
        )}
        {error && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={loadClub}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}
        {!loading && !error && club && (
          <Stack spacing={2}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      src={getClubEmblem(club)}
                      sx={{ width: 64, height: 64, bgcolor: "grey.200" }}
                      variant="rounded"
                    >
                      {club?.name?.charAt(0) || "C"}
                    </Avatar>
                    <Stack spacing={0.5} flex={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="h6" fontWeight={700}>
                          {club?.name || "Club"}
                        </Typography>
                        {isPrivate && <LockIcon fontSize="small" color="action" />}
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {getClubShortDescription(club)}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip label={visibility} size="small" />
                        {club?.cadence && <Chip label={club.cadence} size="small" />}
                        <Chip label={`${getClubMemberCount(club)} members`} size="small" />
                        {membershipRole && <Chip label={membershipRole} size="small" color="primary" />}
                      </Stack>
                    </Stack>
                  </Stack>
                  {joinError && <Alert severity="error">{joinError}</Alert>}
                  {!isMember && !isPending && (
                    <Button
                      variant="contained"
                      onClick={handleJoin}
                      disabled={joinLoading || isPending}
                    >
                      {isPrivate ? "Request to Join" : "Join Club"}
                    </Button>
                  )}
                  {isPending && (
                    <Button variant="outlined" disabled>
                      Pending approval
                    </Button>
                  )}
                  {isMember && (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Button variant="outlined" color="error" onClick={handleLeave} disabled={joinLoading}>
                        Leave Club
                      </Button>
                      {isAdmin && (
                        <>
                          <Button startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
                            Edit Club
                          </Button>
                          <Button startIcon={<GroupIcon />} onClick={() => setTab("requests")}
                            variant="outlined"
                          >
                            Manage Members
                          </Button>
                          <Button startIcon={<AddIcon />} onClick={() => setCreateSessionOpen(true)}
                            variant="contained"
                          >
                            Create Session
                          </Button>
                        </>
                      )}
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {isMember && (
              <Tabs value={tab} onChange={(event, value) => setTab(value)}>
                {tabs.map((item) => (
                  <Tab key={item.value} label={item.label} value={item.value} />
                ))}
              </Tabs>
            )}

            <Divider />

            {tab === "overview" && (
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={700}>
                  About
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {club?.description || "No description yet."}
                </Typography>
              </Stack>
            )}

            {tab === "sessions" && (
              <Stack spacing={2}>
                {sessionsLoading && (
                  <Stack alignItems="center" sx={{ py: 3 }}>
                    <CircularProgress size={28} />
                  </Stack>
                )}
                {sessionsError && (
                  <Alert
                    severity="error"
                    action={
                      <Button color="inherit" size="small" onClick={loadSessions}>
                        Retry
                      </Button>
                    }
                  >
                    {sessionsError}
                  </Alert>
                )}
                {!sessionsLoading && !sessionsError && sessions.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No sessions yet
                  </Typography>
                )}
                {!sessionsLoading && !sessionsError && sessions.length > 0 && (
                  <Stack spacing={2}>{sessionCards}</Stack>
                )}
              </Stack>
            )}

            {tab === "league" && (
              <Stack spacing={2}>
                {leagueLoading && (
                  <Stack alignItems="center" sx={{ py: 3 }}>
                    <CircularProgress size={28} />
                  </Stack>
                )}
                {leagueError && (
                  <Alert
                    severity="error"
                    action={
                      <Button color="inherit" size="small" onClick={loadLeague}>
                        Retry
                      </Button>
                    }
                  >
                    {leagueError}
                  </Alert>
                )}
                {!leagueLoading && !leagueError && league.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No league standings yet
                  </Typography>
                )}
                {!leagueLoading && !leagueError && league.length > 0 && (
                  <List disablePadding>{leagueRows}</List>
                )}
              </Stack>
            )}

            {tab === "requests" && isAdmin && (
              <Stack spacing={2}>
                {requestsLoading && (
                  <Stack alignItems="center" sx={{ py: 3 }}>
                    <CircularProgress size={28} />
                  </Stack>
                )}
                {requestsError && (
                  <Alert
                    severity="error"
                    action={
                      <Button color="inherit" size="small" onClick={loadRequests}>
                        Retry
                      </Button>
                    }
                  >
                    {requestsError}
                  </Alert>
                )}
                {!requestsLoading && !requestsError && requests.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No pending requests
                  </Typography>
                )}
                {!requestsLoading && !requestsError && requests.length > 0 && (
                  <List disablePadding>{requestsRows}</List>
                )}
              </Stack>
            )}
          </Stack>
        )}
      </Stack>
      <EditClubModal
        open={editOpen}
        club={club}
        onClose={() => setEditOpen(false)}
        onUpdated={async () => {
          setEditOpen(false);
          await loadClub();
        }}
      />
      <CreateSessionModal
        open={createSessionOpen}
        onClose={() => setCreateSessionOpen(false)}
        onCreated={handleCreateSession}
      />
      <EditSessionModal
        open={Boolean(editSession)}
        session={editSession}
        onClose={() => setEditSession(null)}
        onUpdated={handleUpdateSession}
      />
    </Container>
  );
}

export default ClubDetailScreen;
