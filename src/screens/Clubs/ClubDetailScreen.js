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
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import GroupIcon from "@mui/icons-material/Group";
import AddIcon from "@mui/icons-material/Add";
import {
  approveClubMember,
  createClubSession,
  deleteClubSession,
  deleteClub,
  fetchClubDetails,
  fetchClubLeague,
  fetchClubRequests,
  fetchClubSessions,
  joinClub,
  leaveClub,
  removeClubMember,
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

const getClubOwnerId = (club) =>
  club?.owner_id || club?.owner?.auth_id || club?.created_by || club?.created_by_id || null;

const getSessionId = (session) => session?.id || session?.session_id;

const getClubMembers = (club) =>
  club?.members ||
  club?.member_list ||
  club?.club_members ||
  club?.users ||
  club?.players ||
  [];

const getMemberStatus = (member) =>
  member?.status || member?.membership_status || member?.member_status || "";

const getMemberRole = (member) =>
  member?.role || member?.membership_role || member?.member_role || "";

const getMemberUser = (member) =>
  member?.user || member?.users || member?.profile || member?.member || member;

const getMemberUserId = (member) => {
  const user = getMemberUser(member);
  return (
    member?.user_id ||
    member?.member_id ||
    user?.auth_id ||
    user?.id ||
    member?.auth_id ||
    member?.id ||
    null
  );
};

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

const CreateSessionModal = ({ open, onClose, onCreated, clubId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const today = new Date().toISOString().split("T")[0];
  const token = useSelector((state) => state.auth.accessToken);
  const [form, setForm] = useState({
    title: "",
    description: "",
    format: "any",
    capacity: 4,
    session_date: today,
    session_time: "",
    session_end_time: "",
    venue_name: "",
    hall: "",
    court_number: "",
    min_elo: "",
    max_elo: "",
    is_public: true,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm((prev) => ({
        ...prev,
        format: prev.format || "any",
        session_date: today,
        session_end_time: "",
      }));
      setErrors({});
      setError("");
    }
  }, [open, today]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.format) nextErrors.format = "Format is required";
    if (!form.capacity || Number(form.capacity) <= 0) {
      nextErrors.capacity = "Capacity must be greater than 0";
    }
    if (!form.session_date) nextErrors.session_date = "Date is required";
    if (!form.session_time) nextErrors.session_time = "Time is required";
    if (!form.session_end_time) nextErrors.session_end_time = "End time is required";
    if (!form.venue_name) nextErrors.venue_name = "Venue is required";
    if (form.min_elo && form.max_elo && Number(form.min_elo) > Number(form.max_elo)) {
      nextErrors.min_elo = "Min Elo must be <= Max Elo";
      nextErrors.max_elo = "Max Elo must be >= Min Elo";
    }
    if (form.session_time && form.session_end_time) {
      const start = new Date(`${form.session_date || today}T${form.session_time}`);
      const end = new Date(`${form.session_date || today}T${form.session_end_time}`);
      if (end <= start) {
        nextErrors.session_end_time = "End time must be after start time";
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setError("");
    try {
      await onCreated({
        ...form,
        capacity: Number(form.capacity),
        min_elo: form.min_elo === "" ? undefined : Number(form.min_elo),
        max_elo: form.max_elo === "" ? undefined : Number(form.max_elo),
        hall: form.hall || undefined,
        court_number: form.court_number || undefined,
        title: form.title || undefined,
        description: form.description || undefined,
        session_end_time: form.session_end_time,
        is_public: Boolean(form.is_public),
        source: "club_created",
        session_type: "club",
        club_id: clubId || null,
      }, token);
    } catch (err) {
      setError(err.message || "Failed to create session");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      scroll="paper"
      PaperProps={{
        sx: {
          m: isMobile ? 2 : 3,
          width: isMobile ? "calc(100% - 32px)" : "min(640px, 100%)",
          maxHeight: isMobile ? "calc(100vh - 64px)" : "85vh",
          borderRadius: isMobile ? 2 : 3,
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <Typography variant="h6" component="h2">
          Create Club Session
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            label="Title"
            placeholder="Friendly rally"
            value={form.title}
            onChange={handleChange("title")}
            fullWidth
            autoFocus
          />
          <TextField
            label="Description"
            placeholder="Share any notes or preferences"
            value={form.description}
            onChange={handleChange("description")}
            fullWidth
            multiline
            minRows={3}
          />
          <TextField
            select
            required
            label="Format"
            value={form.format}
            onChange={handleChange("format")}
            error={Boolean(errors.format)}
            helperText={errors.format}
          >
            <MenuItem value="any">Any</MenuItem>
            <MenuItem value="singles">Singles</MenuItem>
            <MenuItem value="doubles">Doubles</MenuItem>
            <MenuItem value="mixed">Mixed</MenuItem>
            <MenuItem value="open">Open</MenuItem>
          </TextField>
          <TextField
            required
            type="number"
            label="Capacity"
            value={form.capacity}
            onChange={handleChange("capacity")}
            error={Boolean(errors.capacity)}
            helperText={errors.capacity}
            inputProps={{ min: 1 }}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              required
              type="date"
              label="Date"
              value={form.session_date}
              onChange={handleChange("session_date")}
              error={Boolean(errors.session_date)}
              helperText={errors.session_date}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              required
              type="time"
              label="Start time"
              value={form.session_time}
              onChange={handleChange("session_time")}
              error={Boolean(errors.session_time)}
              helperText={errors.session_time}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              required
              type="time"
              label="End time"
              value={form.session_end_time}
              onChange={handleChange("session_end_time")}
              error={Boolean(errors.session_end_time)}
              helperText={errors.session_end_time}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
          <TextField
            required
            label="Venue name"
            value={form.venue_name}
            onChange={handleChange("venue_name")}
            error={Boolean(errors.venue_name)}
            helperText={errors.venue_name}
            fullWidth
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Hall (optional)"
              value={form.hall}
              onChange={handleChange("hall")}
              fullWidth
            />
            <TextField
              label="Court number (optional)"
              value={form.court_number}
              onChange={handleChange("court_number")}
              fullWidth
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              type="number"
              label="Min Elo (optional)"
              value={form.min_elo}
              onChange={handleChange("min_elo")}
              error={Boolean(errors.min_elo)}
              helperText={errors.min_elo}
              fullWidth
            />
            <TextField
              type="number"
              label="Max Elo (optional)"
              value={form.max_elo}
              onChange={handleChange("max_elo")}
              error={Boolean(errors.max_elo)}
              helperText={errors.max_elo}
              fullWidth
            />
          </Stack>
          <FormControlLabel
            control={
              <Switch
                checked={form.is_public}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, is_public: event.target.checked }))
                }
              />
            }
            label="Public session"
          />
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} width="100%">
          <Button variant="outlined" fullWidth onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create Session"}
          </Button>
        </Stack>
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
  const currentUser = useSelector((state) => state.user.user);
  const [club, setClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinStatus, setJoinStatus] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [createSessionOpen, setCreateSessionOpen] = useState(false);
  const [editSession, setEditSession] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState("");
  const [membersError, setMembersError] = useState("");
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [memberRemoveLoading, setMemberRemoveLoading] = useState(false);
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
    const list = getClubMembers(club);
    setMembers(Array.isArray(list) ? list : []);
  }, [club]);

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

  const activeMembers = useMemo(
    () =>
      members.filter((member) => {
        const status = getMemberStatus(member);
        return !status || status === "active";
      }),
    [members]
  );

  const membershipStatus = getMembershipStatus(club);
  const membershipRole = getMembershipRole(club);
  const currentAuthId = currentUser?.auth_id || currentUser?.id || null;
  const ownerId = getClubOwnerId(club);
  const isOwner = Boolean(currentAuthId && ownerId && currentAuthId === ownerId);
  const isMember = membershipStatus === "active";
  const isPending =
    ["requested", "pending"].includes(membershipStatus) || joinStatus === "requested";
  const isAdmin =
    (membershipRole ? adminRoles.includes(membershipRole) : false) ||
    club?.is_admin === true ||
    club?.is_owner === true ||
    isOwner;
  const displayRole = membershipRole || (isOwner ? "owner" : null);
  const fallbackAdminMember = useMemo(() => {
    if (!isAdmin || activeMembers.length > 0) return null;
    const fallbackUser =
      currentUser ||
      club?.owner ||
      club?.owner_user ||
      club?.created_by ||
      club?.created_by_user ||
      null;
    if (!fallbackUser) return null;
    return {
      user: fallbackUser,
      role: "owner",
      membership_role: "owner",
      status: "active",
    };
  }, [activeMembers.length, club, currentUser, isAdmin]);
  const displayMembers = useMemo(() => {
    if (activeMembers.length > 0) return activeMembers;
    if (fallbackAdminMember) return [fallbackAdminMember];
    return activeMembers;
  }, [activeMembers, fallbackAdminMember]);
  const memberCount = Math.max(getClubMemberCount(club), displayMembers.length);
  const membersUnavailable = displayMembers.length === 0 && getClubMemberCount(club) > 0;
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

  const handleRemoveMember = useCallback(
    async (member) => {
      const userId = getMemberUserId(member);
      if (!userId || !clubId) return;
      setMembersError("");
      setMemberRemoveLoading(true);
      try {
        await removeClubMember(clubId, userId, token);
        setMembers((prev) => prev.filter((item) => getMemberUserId(item) !== userId));
      } catch (err) {
        setMembersError(err.message || "Failed to remove member");
      } finally {
        setMemberRemoveLoading(false);
        setMemberToRemove(null);
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

  const handleDeleteClub = async () => {
    if (!clubId) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await deleteClub(clubId, token);
      setDeleteOpen(false);
      navigate("/clubs");
    } catch (err) {
      setDeleteError(err.message || "Failed to delete club");
    } finally {
      setDeleteLoading(false);
    }
  };

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

  const memberRows = useMemo(
    () =>
      displayMembers.map((member) => {
        const user = getMemberUser(member);
        const name =
          user?.name ||
          user?.full_name ||
          user?.display_name ||
          user?.username ||
          "Member";
        const subtitle = user?.region || user?.username || "";
        const role = getMemberRole(member);
        const memberAuthId = user?.auth_id || user?.id || null;
        const isCoreAdmin = role === "core_admin";
        const isSelf = Boolean(currentAuthId && memberAuthId && currentAuthId === memberAuthId);
        return (
          <ListItem
            key={getMemberUserId(member) || name}
            divider
            secondaryAction={
              <Button
                size="small"
                color="error"
                onClick={() => setMemberToRemove(member)}
                disabled={isCoreAdmin || isSelf}
              >
                Remove
              </Button>
            }
          >
            <ListItemAvatar>
              <Avatar src={user?.avatar_url || user?.profile_image_url || ""}>
                {name?.charAt(0)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Typography variant="body1" fontWeight={600}>
                    {name}
                  </Typography>
                  {role && <Chip label={role} size="small" color="primary" />}
                </Stack>
              }
              secondary={
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  {subtitle && (
                    <Typography variant="body2" color="text.secondary">
                      {subtitle}
                    </Typography>
                  )}
                  {user?.overall_elo !== undefined && (
                    <Typography variant="caption" color="text.secondary">
                      Elo: {user.overall_elo}
                    </Typography>
                  )}
                </Stack>
              }
              primaryTypographyProps={{ component: "div" }}
              secondaryTypographyProps={{ component: "div" }}
            />
          </ListItem>
        );
      }),
    [currentAuthId, displayMembers]
  );

  const tabs = useMemo(() => {
    const baseTabs = [
      { value: "overview", label: "Overview" },
      { value: "sessions", label: "Sessions" },
      { value: "league", label: "League" },
    ];
    if (isAdmin) {
      baseTabs.push({ value: "requests", label: "Requests" });
      baseTabs.push({ value: "members", label: "Members" });
      baseTabs.push({ value: "admin", label: "Admin" });
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
                        <Chip label={`${memberCount} members`} size="small" />
                        {displayRole && <Chip label={displayRole} size="small" color="primary" />}
                      </Stack>
                    </Stack>
                  </Stack>
                  {joinError && <Alert severity="error">{joinError}</Alert>}
                  {!isMember && !isPending && !isAdmin && (
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
                          <Button
                            startIcon={<GroupIcon />}
                            onClick={() => setTab("members")}
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

            {(isMember || isAdmin) && (
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
                  <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Stack spacing={2}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          No sessions yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Create the first session to kick off your club schedule.
                        </Typography>
                        {isAdmin && (
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setCreateSessionOpen(true)}
                          >
                            Create session
                          </Button>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
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

            {tab === "members" && isAdmin && (
              <Stack spacing={2}>
                {membersError && <Alert severity="error">{membersError}</Alert>}
                {membersUnavailable && (
                  <Typography variant="body2" color="text.secondary">
                    Members list unavailable
                  </Typography>
                )}
                {!membersUnavailable && displayMembers.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No members to show
                  </Typography>
                )}
                {!membersUnavailable && displayMembers.length > 0 && (
                  <List disablePadding>{memberRows}</List>
                )}
              </Stack>
            )}

            {tab === "admin" && isAdmin && (
              <Stack spacing={2}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Club administration
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Edit club details or permanently delete the club.
                      </Typography>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                        <Button startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
                          Edit Club
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => {
                            setDeleteError("");
                            setDeleteOpen(true);
                          }}
                        >
                          Delete Club
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
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
        clubId={clubId}
      />
      <EditSessionModal
        open={Boolean(editSession)}
        session={editSession}
        onClose={() => setEditSession(null)}
        onUpdated={handleUpdateSession}
      />
      <Dialog open={Boolean(memberToRemove)} onClose={() => setMemberToRemove(null)}>
        <DialogTitle>Remove member</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This will remove the member from the club.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMemberToRemove(null)} disabled={memberRemoveLoading}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => memberToRemove && handleRemoveMember(memberToRemove)}
            disabled={memberRemoveLoading}
          >
            {memberRemoveLoading ? "Removing..." : "Remove"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete club</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              This action permanently deletes the club and its details.
            </Typography>
            {deleteError && <Alert severity="error">{deleteError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteClub}
            disabled={deleteLoading}
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ClubDetailScreen;
