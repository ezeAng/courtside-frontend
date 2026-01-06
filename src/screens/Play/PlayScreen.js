import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import FilterListIcon from "@mui/icons-material/FilterList";
import GroupsIcon from "@mui/icons-material/Groups";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import CompetitionsScreen from "../Competitions/CompetitionsScreen";
import RecordMatchModal from "../Matches/RecordMatchModal";
import {
  createSession,
  fetchSessionDetails,
  fetchSessions,
  joinSession,
  leaveSession,
} from "../../api/sessions";
import { getStoredToken } from "../../services/storage";
import { getPlayerAuthId, getPlayerDisplayName } from "../../utils/matchPlayers";

const PLAY_TAB_STORAGE_KEY = "play-tab-selection";

const getSessionId = (session) => session?.session_id ?? session?.id;
const getSessionDate = (session) => session?.session_date || session?.date;
const getSessionTime = (session) => session?.session_time || session?.time;
const getJoinedCount = (session) =>
  session?.joined_count ?? session?.participants?.length ?? 0;
const getCapacity = (session) => session?.capacity ?? 0;

const getSkillRange = (session) => {
  const min = session?.min_elo ?? session?.skill_range?.min_elo;
  const max = session?.max_elo ?? session?.skill_range?.max_elo;
  if (min === undefined && max === undefined) return null;
  return { min, max };
};
const getFormatLabel = (format) => {
  const value = (format || "").toString().toLowerCase();
  if (value === "doubles") return "Doubles";
  if (value === "mixed") return "Mixed";
  return "Singles";
};

const formatDateTime = (date, time) => {
  if (!date || !time) return "Date & time TBD";
  const dateTime = new Date(`${date}T${time}`);
  const dateLabel = dateTime.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeLabel = dateTime.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${dateLabel} • ${timeLabel}`;
};

const isWithin24Hours = (date, time) => {
  if (!date || !time) return false;
  const start = new Date(`${date}T${time}`);
  const now = new Date();
  const diff = start.getTime() - now.getTime();
  return diff <= 24 * 60 * 60 * 1000 && diff >= 0;
};

const buildLocationLabel = (session) => {
  const courtNumber = session?.court_number ?? session?.location?.court_number;
  const parts = [
    session?.venue_name ?? session?.location?.venue_name,
    session?.hall ?? session?.location?.hall,
    courtNumber ? `Court ${courtNumber}` : null,
  ].filter(Boolean);
  return parts.join(" • ");
};

const SessionCard = ({ session, onOpen, currentUser }) => {
  const theme = useTheme();
  const sessionDate = getSessionDate(session);
  const sessionTime = getSessionTime(session);
  const joinedCount = getJoinedCount(session);
  const capacity = getCapacity(session);
  const isFull = capacity > 0 && joinedCount >= capacity;
  const highlight = !isFull && isWithin24Hours(sessionDate, sessionTime);
  const capacityProgress =
    capacity > 0 ? Math.min(100, (joinedCount / capacity) * 100) : 0;
  const locationLabel = buildLocationLabel(session);
  const currentUserId = currentUser?.auth_id || currentUser?.id;
  const isHost =
    currentUserId &&
    session?.host_auth_id &&
    String(session.host_auth_id) === String(currentUserId);
  const isJoined =
    session?.is_joined ??
    session?.joined_by_me ??
    session?.joined_by_current_user ??
    session?.participants?.some(
      (p) => currentUserId && String(getPlayerAuthId(p)) === String(currentUserId)
    );

  const skillRange = getSkillRange(session);
  const formatLabel = getFormatLabel(session?.format);
  const formatValue = (session?.format || "").toString().toLowerCase();
  const isDoublesFormat = formatValue === "doubles";

  return (
    <Box
      onClick={() => onOpen(session)}
      sx={{
        p: 2,
        borderRadius: 2,
        border: `1px solid ${
          highlight ? theme.palette.primary.main : theme.palette.divider
        }`,
        backgroundColor: isFull ? "action.hover" : "background.paper",
        opacity: isFull ? 0.7 : 1,
        boxShadow: theme.custom?.colors?.shadows?.sm,
        cursor: "pointer",
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack spacing={0.5}>
            <Typography variant="subtitle2" color="text.secondary">
              {formatDateTime(sessionDate, sessionTime)}
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {session?.title || formatLabel}
            </Typography>
            {locationLabel && (
              <Typography variant="body2" color="text.secondary">
                {locationLabel}
              </Typography>
            )}
          </Stack>
          <Stack spacing={1} alignItems="flex-end">
            <Chip
              size="small"
              label={formatLabel}
              color={isDoublesFormat ? "primary" : "default"}
              icon={<GroupsIcon fontSize="small" />}
            />
            <Stack direction="row" spacing={0.5}>
              {isHost && <Chip size="small" color="success" label="Host" />}
              {isJoined && !isHost && (
                <Chip size="small" color="primary" variant="outlined" label="Joined" />
              )}
              {isFull && <Chip size="small" color="default" label="Full" />}
              {highlight && !isFull && (
                <Chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  label="Starts within 24h"
                />
              )}
            </Stack>
          </Stack>
        </Stack>

        <Stack spacing={0.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" fontWeight={600}>
              Capacity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {joinedCount} / {capacity || "—"}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={capacityProgress}
            color={isFull ? "inherit" : "primary"}
            sx={{ height: 8, borderRadius: 999 }}
          />
        </Stack>

        {skillRange && (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Chip
              label={`Elo ${skillRange.min ?? "Any"}–${skillRange.max ?? "Any"}`}
              variant="outlined"
              size="small"
            />
            {session?.host_username && (
              <Typography variant="body2" color="text.secondary">
                Host: {session.host_username}
              </Typography>
            )}
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

const ParticipantItem = ({ player }) => (
  <Stack
    direction="row"
    spacing={1.5}
    alignItems="center"
    sx={{ p: 1, borderRadius: 1, border: "1px solid", borderColor: "divider" }}
  >
    <Avatar>{(player?.username || "P")[0]?.toUpperCase()}</Avatar>
    <Box>
      <Typography fontWeight={600}>{player?.username || "Player"}</Typography>
      <Typography variant="body2" color="text.secondary">
        Elo {player?.elo ?? "N/A"}
      </Typography>
    </Box>
  </Stack>
);

const SessionDetailsModal = ({
  open,
  session,
  loading,
  onClose,
  onJoin,
  onLeave,
  onRecordMatch,
  currentUser,
  actionLoading,
  actionError,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const sessionDate = getSessionDate(session);
  const sessionTime = getSessionTime(session);
  const joinedCount = getJoinedCount(session);
  const capacity = getCapacity(session);
  const skillRange = getSkillRange(session);
  const locationLabel = buildLocationLabel(session);
  const participants = session?.participants || [];
  const currentUserId = currentUser?.auth_id || currentUser?.id;
  const isHost =
    currentUserId &&
    session?.host_auth_id &&
    String(session.host_auth_id) === String(currentUserId);
  const isParticipant = participants.some(
    (p) => currentUserId && String(getPlayerAuthId(p)) === String(currentUserId)
  );
  const isFull = capacity > 0 && joinedCount >= capacity;
  const actionDisabled = isHost || (isFull && !isParticipant) || loading || actionLoading;
  const actionLabel = isHost
    ? "Host"
    : isParticipant
      ? "Leave Session"
      : isFull
        ? "Full"
        : "Join Session";
  const emptySlots = Math.max(capacity - participants.length, 0);
  const formatLabel = getFormatLabel(session?.format);

  if (!session) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      scroll="paper"
      PaperProps={{
        sx: {
          m: isMobile ? 1 : 3,
          width: "min(640px, 100%)",
          maxHeight: isMobile ? "calc(100vh - 24px)" : "85vh",
          borderRadius: isMobile ? 2 : 3,
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <EventAvailableIcon color="primary" />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {session?.title || formatLabel}
        </Typography>
        <Chip
          label={isFull ? "Full" : "Open"}
          color={isFull ? "default" : "success"}
          size="small"
        />
        <IconButton onClick={onClose} edge="end">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Stack spacing={2}>
            <Skeleton height={24} width="60%" />
            <Skeleton height={24} width="40%" />
            <Skeleton variant="rectangular" height={120} />
          </Stack>
        ) : (
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Typography fontWeight={700}>
                {formatDateTime(sessionDate, sessionTime)}
              </Typography>
              {locationLabel && (
                <Typography color="text.secondary">{locationLabel}</Typography>
              )}
            </Stack>

            {session?.description && (
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography>{session.description}</Typography>
              </Stack>
            )}

            <Divider />

            <Stack spacing={1.5}>
              <Typography variant="subtitle2" color="text.secondary">
                Details
              </Typography>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Format</Typography>
                  <Typography fontWeight={600}>{formatLabel}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Capacity</Typography>
                  <Typography fontWeight={600}>
                    {joinedCount} / {capacity || "—"}
                  </Typography>
                </Stack>
                {skillRange && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Elo range</Typography>
                    <Typography fontWeight={600}>
                      Elo {skillRange.min ?? "Any"}–{skillRange.max ?? "Any"}
                    </Typography>
                  </Stack>
                )}
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Host</Typography>
                  <Typography fontWeight={600}>
                    {session?.host_username || "Host"}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>

            <Divider />

            <Stack spacing={1.5}>
              <Typography variant="subtitle2" color="text.secondary">
                Participants
              </Typography>
              <Stack spacing={1}>
                {participants.map((player) => (
                  <ParticipantItem key={player.auth_id || player.username} player={player} />
                ))}
                {Array.from({ length: emptySlots }).map((_, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      border: "1px dashed",
                      borderColor: "divider",
                    }}
                  >
                    <Avatar sx={{ bgcolor: "action.hover", color: "text.secondary" }}>
                      +
                    </Avatar>
                    <Box>
                      <Typography fontWeight={600} color="text.secondary">
                        Open slot
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Waiting for a player
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Stack spacing={1} width="100%">
          {actionError && <Alert severity="error">{actionError}</Alert>}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} width="100%">
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                if (isParticipant) onLeave(session);
                else onJoin(session);
              }}
              disabled={actionDisabled}
            >
              {actionLabel}
            </Button>
            {(isParticipant || isHost) && (
              <Button
                variant="outlined"
                fullWidth
                onClick={() => onRecordMatch(session)}
                startIcon={<MilitaryTechIcon />}
              >
                Record Match
              </Button>
            )}
          </Stack>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

const deriveRecordMatchPrefill = (session, currentUser) => {
  if (!session) return {};
  const participants = session.participants || [];
  const currentUserId = currentUser?.auth_id || currentUser?.id;
  const currentUserEntry =
    participants.find(
      (p) => getPlayerAuthId(p) && currentUserId && String(getPlayerAuthId(p)) === String(currentUserId)
    ) ||
    (currentUser
      ? {
          username: getPlayerDisplayName(currentUser),
          elo: currentUser.elo,
          auth_id: currentUserId,
        }
      : null);

  const others = participants.filter(
    (p) => !currentUserEntry || String(getPlayerAuthId(p)) !== String(getPlayerAuthId(currentUserEntry))
  );

  if (session.format === "singles") {
    const opponent = others[0] || session.host;
    return {
      initialSinglesValues: {
        opponent,
      },
      initialTab: 0,
    };
  }

  const [partner, opponent1, opponent2] = others;
  return {
    initialDoublesValues: {
      partner: partner || null,
      opponent1: opponent1 || null,
      opponent2: opponent2 || null,
    },
    initialTab: 1,
  };
};

const CreateSessionModal = ({ open, onClose, onCreated }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    title: "",
    description: "",
    format: "singles",
    capacity: 4,
    session_date: today,
    session_time: "",
    venue_name: "",
    hall: "",
    court_number: "",
    min_elo: "",
    max_elo: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (open) {
      setForm((prev) => ({ ...prev, session_date: today }));
      setErrors({});
      setApiError("");
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
    if (!form.venue_name) nextErrors.venue_name = "Venue is required";
    if (form.min_elo && form.max_elo && Number(form.min_elo) > Number(form.max_elo)) {
      nextErrors.min_elo = "Min Elo must be <= Max Elo";
      nextErrors.max_elo = "Max Elo must be >= Min Elo";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setApiError("");
    try {
      const token = getStoredToken();
      const payload = {
        ...form,
        capacity: Number(form.capacity),
        min_elo: form.min_elo === "" ? undefined : Number(form.min_elo),
        max_elo: form.max_elo === "" ? undefined : Number(form.max_elo),
        hall: form.hall || undefined,
        court_number: form.court_number || undefined,
        title: form.title || undefined,
        description: form.description || undefined,
      };
      await createSession(payload, token);
      onCreated?.();
      onClose?.();
    } catch (err) {
      setApiError(err.message || "Failed to create session");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullScreen={isMobile} fullWidth scroll="paper">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6">Create Session</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
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
            <MenuItem value="singles">Singles</MenuItem>
            <MenuItem value="doubles">Doubles</MenuItem>
            <MenuItem value="mixed">Mixed</MenuItem>
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
              label="Time"
              value={form.session_time}
              onChange={handleChange("session_time")}
              error={Boolean(errors.session_time)}
              helperText={errors.session_time}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
          <TextField
            required
            label="Venue"
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
          {apiError && (
            <Alert severity="error">{apiError}</Alert>
          )}
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

const SessionsFilterPanel = ({
  open,
  filters,
  onChange,
  onReset,
}) => (
  <Box>
    <Button
      variant="text"
      startIcon={<FilterListIcon />}
      onClick={() => onChange({ toggleOpen: true })}
      sx={{ alignSelf: "flex-start" }}
    >
      {open ? "Hide filters" : "Show filters"}
    </Button>
    <Collapse in={open}>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mt: 1 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              type="date"
              label="From"
              value={filters.dateFrom}
              onChange={(e) => onChange({ dateFrom: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              type="date"
              label="To"
              value={filters.dateTo}
              onChange={(e) => onChange({ dateTo: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
          <TextField
            select
            label="Format"
            value={filters.format}
            onChange={(e) => onChange({ format: e.target.value })}
          >
            <MenuItem value="">Any</MenuItem>
            <MenuItem value="singles">Singles</MenuItem>
            <MenuItem value="doubles">Doubles</MenuItem>
            <MenuItem value="mixed">Mixed</MenuItem>
          </TextField>
          <TextField
            label="Venue"
            placeholder="Search venue"
            value={filters.venue}
            onChange={(e) => onChange({ venue: e.target.value })}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={filters.availableOnly}
                  onChange={(e) => onChange({ availableOnly: e.target.checked })}
                />
              }
              label="Available only"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={filters.hostedByMe}
                  onChange={(e) => onChange({ hostedByMe: e.target.checked })}
                />
              }
              label="Hosted by me"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={filters.joinedByMe}
                  onChange={(e) => onChange({ joinedByMe: e.target.checked })}
                />
              }
              label="Joined by me"
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button variant="text" onClick={onReset}>
              Reset filters
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Collapse>
  </Box>
);

export default function PlayScreen() {
  const today = new Date().toISOString().split("T")[0];
  const [tab, setTab] = useState(
    () => localStorage.getItem(PLAY_TAB_STORAGE_KEY) || "sessions"
  );
  const [sessions, setSessions] = useState([]);
  const [filters, setFilters] = useState({
    dateFrom: today,
    dateTo: "",
    format: "",
    venue: "",
    availableOnly: true,
    hostedByMe: false,
    joinedByMe: false,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState({});
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [sessionActionError, setSessionActionError] = useState("");
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [recordMatchModalOpen, setRecordMatchModalOpen] = useState(false);
  const [recordPrefill, setRecordPrefill] = useState({});
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const currentUser = useSelector((state) => state.user.user);

  useEffect(() => {
    localStorage.setItem(PLAY_TAB_STORAGE_KEY, tab);
  }, [tab]);

  const resetFilters = useCallback(() => {
    setFilters({
      dateFrom: today,
      dateTo: "",
      format: "",
      venue: "",
      availableOnly: true,
      hostedByMe: false,
      joinedByMe: false,
    });
  }, [today]);

  const handleFilterChange = useCallback((changes) => {
    setFilters((prev) => ({ ...prev, ...changes }));
  }, []);

  const extractSessions = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (payload?.sessions) return payload.sessions;
    if (payload?.items) return payload.items;
    return [];
  };

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError("");
    try {
      const token = getStoredToken();
      const queryFilters = {
        date_from: filters.dateFrom,
        date_to: filters.dateTo || undefined,
        format: filters.format || undefined,
        venue: filters.venue || undefined,
        available_only: filters.availableOnly,
        hosted_by_me: filters.hostedByMe,
        joined_by_me: filters.joinedByMe,
      };
      const payload = await fetchSessions(queryFilters, token);
      setSessions(extractSessions(payload));
      setFiltersApplied(payload?.filters_applied || queryFilters);
    } catch (err) {
      setSessionsError(err.message || "Failed to load sessions");
    } finally {
      setSessionsLoading(false);
    }
  }, [filters]);

  const refreshSessionDetails = useCallback(
    async (sessionId) => {
      if (!sessionId) return;
      setDetailsLoading(true);
      try {
        const token = getStoredToken();
        const detail = await fetchSessionDetails(sessionId, token);
        setSessionDetails(detail);
      } catch (err) {
        setSnackbar({
          open: true,
          message: err.message || "Failed to load session details",
          severity: "error",
        });
      } finally {
        setDetailsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (tab !== "sessions") return;
    loadSessions();
  }, [tab, loadSessions]);

  const handleOpenSession = async (session) => {
    const id = getSessionId(session);
    setSessionActionError("");
    setSelectedSessionId(id);
    setSessionDetails(null);
    await refreshSessionDetails(id);
  };

  const handleCloseSessionDetails = () => {
    setSelectedSessionId(null);
    setSessionDetails(null);
    setSessionActionError("");
  };

  const handleSessionError = async (err, sessionId, fallbackMessage = "Something went wrong") => {
    const code = err?.code;
    if (code === "SESSION_CANCELLED") {
      const cancelledMessage = "Session was cancelled";
      setSessionActionError(cancelledMessage);
      setSelectedSessionId(null);
      setSessionDetails(null);
      await loadSessions();
      setSnackbar({
        open: true,
        message: cancelledMessage,
        severity: "warning",
      });
      return;
    }
    if (code === "SESSION_FULL") {
      const fullMessage = "Session is full";
      setSessionActionError(fullMessage);
      setSnackbar({
        open: true,
        message: fullMessage,
        severity: "warning",
      });
      await refreshSessionDetails(sessionId);
      await loadSessions();
      return;
    }
    if (code === "ALREADY_JOINED" || code === "NOT_A_PARTICIPANT") {
      setSessionActionError("");
      await refreshSessionDetails(sessionId);
      await loadSessions();
      return;
    }
    const message = err?.message || fallbackMessage;
    setSessionActionError(message);
    setSnackbar({
      open: true,
      message,
      severity: "error",
    });
  };

  const handleJoinSession = async (session) => {
    const sessionId = getSessionId(session);
    if (!sessionId) return;
    setActionLoading(true);
    setSessionActionError("");
    try {
      const token = getStoredToken();
      await joinSession(sessionId, token);
      await refreshSessionDetails(sessionId);
      await loadSessions();
      setSnackbar({
        open: true,
        message: "Joined session. See you on court!",
        severity: "success",
      });
    } catch (err) {
      await handleSessionError(err, sessionId, "Failed to join session");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveSession = async (session) => {
    const sessionId = getSessionId(session);
    if (!sessionId) return;
    setActionLoading(true);
    setSessionActionError("");
    try {
      const token = getStoredToken();
      await leaveSession(sessionId, token);
      await refreshSessionDetails(sessionId);
      await loadSessions();
      setSnackbar({
        open: true,
        message: "You left the session",
        severity: "info",
      });
    } catch (err) {
      await handleSessionError(err, sessionId, "Failed to leave session");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordMatch = (session) => {
    const prefill = deriveRecordMatchPrefill(session, currentUser);
    setRecordPrefill(prefill);
    setRecordMatchModalOpen(true);
  };

  const handleCreateSuccess = () => {
    setSnackbar({
      open: true,
      message: "Session created successfully",
      severity: "success",
    });
    loadSessions();
  };

  const selectedSessionFromList = useMemo(
    () => sessions.find((s) => getSessionId(s) === selectedSessionId),
    [sessions, selectedSessionId]
  );

  const resolvedSelectedSession = sessionDetails || selectedSessionFromList;
  return (
    <>
      <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
        <Stack spacing={3}>
          <Stack spacing={1} alignItems="center">
            <Typography variant="h5" fontWeight={700}>
              Play
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Discover sessions to join friends, train together, and get ready for competitions.
            </Typography>
          </Stack>

          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            variant="fullWidth"
          >
            <Tab label="Sessions" value="sessions" />
            <Tab label="Tournaments" value="tournaments" />
            <Tab label="Leagues" value="leagues" />
          </Tabs>

          {tab === "sessions" ? (
            <Stack spacing={2}>
              <Button variant="contained" fullWidth onClick={() => setCreateModalOpen(true)}>
                Create Session
              </Button>

              <SessionsFilterPanel
                open={filtersOpen}
                filters={filters}
                onChange={(changes) => {
                  if (changes.toggleOpen) {
                    setFiltersOpen((prev) => !prev);
                  } else {
                    handleFilterChange(changes);
                  }
                }}
                onReset={resetFilters}
              />

              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">
                  Showing sessions from {filtersApplied.date_from || filters.dateFrom || "today"}
                  {filtersApplied.date_to ? ` to ${filtersApplied.date_to}` : ""} •{" "}
                  {filtersApplied.available_only === false ? "Including full sessions" : "Available only"}
                </Typography>
                {sessionsError && <Alert severity="error">{sessionsError}</Alert>}
              </Stack>

              {sessionsLoading ? (
                <Stack spacing={2}>
                  {[...Array(3)].map((_, idx) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Skeleton height={24} width="60%" />
                      <Skeleton height={20} width="40%" />
                      <Skeleton variant="rectangular" height={28} />
                    </Paper>
                  ))}
                </Stack>
              ) : sessions.length ? (
                <Stack spacing={2}>
                  {sessions.map((session) => (
                    <SessionCard
                      key={getSessionId(session)}
                      session={session}
                      onOpen={handleOpenSession}
                      currentUser={currentUser}
                    />
                  ))}
                </Stack>
              ) : (
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  <Stack spacing={1}>
                    <Typography fontWeight={700}>No sessions found</Typography>
                    <Typography color="text.secondary">
                      Try adjusting your filters or create a new session to get players on court.
                    </Typography>
                  </Stack>
                </Paper>
              )}
            </Stack>
          ) : (
            <CompetitionsScreen
              tab={tab === "tournaments" ? "tournaments" : "leagues"}
              allowTabSwitching={false}
            />
          )}
        </Stack>
      </Container>

      <SessionDetailsModal
        open={Boolean(resolvedSelectedSession)}
        session={resolvedSelectedSession}
        loading={detailsLoading}
        onClose={handleCloseSessionDetails}
        onJoin={handleJoinSession}
        onLeave={handleLeaveSession}
        onRecordMatch={(session) => {
          handleRecordMatch(session);
        }}
        currentUser={currentUser}
        actionLoading={actionLoading}
        actionError={sessionActionError}
      />

      <CreateSessionModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleCreateSuccess}
      />

      <RecordMatchModal
        open={recordMatchModalOpen}
        onClose={() => setRecordMatchModalOpen(false)}
        initialSinglesValues={recordPrefill.initialSinglesValues}
        initialDoublesValues={recordPrefill.initialDoublesValues}
        initialTab={recordPrefill.initialTab}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
