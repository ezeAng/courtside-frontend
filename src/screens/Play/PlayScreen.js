import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  Alert,
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
import FilterListIcon from "@mui/icons-material/FilterList";
import GroupsIcon from "@mui/icons-material/Groups";
import CompetitionsScreen from "../Competitions/CompetitionsScreen";
import SessionDetailsModal from "../../components/SessionDetailsModal";
import RecordMatchModal from "../Matches/RecordMatchModal";
import {
  createSession,
  deleteSession,
  fetchSessionDetails,
  fetchSessions,
  fetchSuggestedSessions,
  joinSession,
  leaveSession,
  updateSession,
} from "../../api/sessions";
import { getStoredToken } from "../../services/storage";
import {
  buildLocationLabel,
  deriveRecordMatchPrefill,
  formatDateTime,
  getCapacity,
  getFormatLabel,
  getHostAuthId,
  getJoinedCount,
  getSessionDate,
  getSessionId,
  getSessionTime,
  getSkillRange,
  isWithin24Hours,
  normalizeSessionDetail,
} from "../../utils/sessionUtils";
import { getPlayerAuthId } from "../../utils/matchPlayers";

const PLAY_TAB_STORAGE_KEY = "play-tab-selection";

const SessionCard = ({ session, onOpen, currentUser, variant = "full" }) => {
  const theme = useTheme();
  const sessionDate = getSessionDate(session);
  const sessionTime = getSessionTime(session);
  const joinedCount = getJoinedCount(session);
  const capacity = getCapacity(session);
  const isFull = capacity > 0 && joinedCount >= capacity;
  const highlight = !isFull && isWithin24Hours(sessionDate, sessionTime);
  const isCompact = variant === "compact";
  const capacityProgress =
    capacity > 0 ? Math.min(100, (joinedCount / capacity) * 100) : 0;
  const locationLabel = buildLocationLabel(session);
  const currentUserId = currentUser?.auth_id || currentUser?.id;
  const hostAuthId = getHostAuthId(session);
  const isHost = currentUserId && hostAuthId && String(hostAuthId) === String(currentUserId);
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
  const suggestionLabel =
    session?.suggestion_label ||
    session?.suggestion_reason ||
    session?.suggested_reason ||
    "";

  return (
    <Box
      onClick={() => onOpen(session)}
      sx={{
        p: isCompact ? 2 : 3,
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
      {isCompact ? (
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack spacing={0.25}>
              <Typography variant="subtitle2" color="text.secondary">
                {formatDateTime(sessionDate, sessionTime)}
              </Typography>
              {locationLabel && (
                <Typography variant="body2" color="text.secondary">
                  {locationLabel}
                </Typography>
              )}
            </Stack>
            <Chip
              size="small"
              label={formatLabel}
              color={isDoublesFormat ? "primary" : "default"}
              icon={<GroupsIcon fontSize="small" />}
            />
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Capacity
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {joinedCount} / {capacity || "—"}
            </Typography>
          </Stack>
          {suggestionLabel && (
            <Typography variant="caption" color="text.secondary">
              {suggestionLabel}
            </Typography>
          )}
        </Stack>
      ) : (
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
      )}
    </Box>
  );
};

const CreateSessionModal = ({ open, onClose, onCreated }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const today = new Date().toISOString().split("T")[0];
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
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (open) {
      setForm((prev) => ({
        ...prev,
        format: prev.format || "any",
        session_date: today,
        session_end_time: "",
      }));
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
        session_end_time: form.session_end_time,
        is_public: Boolean(form.is_public),
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
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6">Create Session</Typography>
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
          <FormControlLabel
            control={
              <Switch
                checked={form.is_public}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, is_public: e.target.checked }))
                }
              />
            }
            label="Public session"
          />
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

const EditSessionModal = ({ open, session, onClose, onUpdated }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [form, setForm] = useState({
    title: "",
    description: "",
    format: "any",
    capacity: "",
    session_date: "",
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
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (open && session) {
      const skillRange = getSkillRange(session);
      setForm({
        title: session?.title || "",
        description: session?.description || "",
        format: session?.format || "any",
        capacity: session?.capacity ?? getCapacity(session) ?? "",
        session_date: getSessionDate(session) || "",
        session_time: getSessionTime(session) || "",
        session_end_time: session?.session_end_time || "",
        venue_name: session?.venue_name ?? session?.location?.venue_name ?? "",
        hall: session?.hall ?? session?.location?.hall ?? "",
        court_number: session?.court_number ?? session?.location?.court_number ?? "",
        min_elo: skillRange?.min ?? "",
        max_elo: skillRange?.max ?? "",
        is_public: session?.is_public ?? true,
      });
      setErrors({});
      setApiError("");
    }
  }, [open, session]);

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
    if (form.min_elo && form.max_elo && Number(form.min_elo) > Number(form.max_elo)) {
      nextErrors.min_elo = "Min Elo must be <= Max Elo";
      nextErrors.max_elo = "Max Elo must be >= Min Elo";
    }
    if (form.session_time && form.session_end_time) {
      const start = new Date(`${form.session_date || getSessionDate(session)}T${form.session_time}`);
      const end = new Date(
        `${form.session_date || getSessionDate(session)}T${form.session_end_time}`
      );
      if (end <= start) {
        nextErrors.session_end_time = "End time must be after start time";
      }
    }
    if (!form.venue_name) nextErrors.venue_name = "Venue is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!session) return;
    if (!validate()) return;
    setSubmitting(true);
    setApiError("");
    try {
      const token = getStoredToken();
      const payload = {
        title: form.title || undefined,
        description: form.description || null,
        format: form.format,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        session_date: form.session_date || undefined,
        session_time: form.session_time || undefined,
        session_end_time: form.session_end_time || undefined,
        venue_name: form.venue_name || undefined,
        hall: form.hall === "" ? null : form.hall,
        court_number: form.court_number === "" ? null : form.court_number,
        min_elo: form.min_elo === "" ? null : Number(form.min_elo),
        max_elo: form.max_elo === "" ? null : Number(form.max_elo),
        is_public: Boolean(form.is_public),
      };
      await updateSession(getSessionId(session), payload, token);
      onUpdated?.();
      onClose?.();
    } catch (err) {
      setApiError(err.message || "Failed to update session");
    } finally {
      setSubmitting(false);
    }
  };

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
          m: isMobile ? 2 : 3,
          width: isMobile ? "calc(100% - 32px)" : "min(640px, 100%)",
          maxHeight: isMobile ? "calc(100vh - 64px)" : "85vh",
          borderRadius: isMobile ? 2 : 3,
        },
      }}
    >
      <DialogTitle
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <Typography variant="h6">Edit Session</Typography>
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
          />
          <TextField
            label="Description"
            placeholder="Share any notes or preferences"
            value={form.description}
            onChange={handleChange("description")}
            fullWidth
            multiline
            minRows={2}
            maxRows={4}
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
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
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
            <TextField
              type="time"
              label="End time (optional)"
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
            label="Venue"
            value={form.venue_name}
            onChange={handleChange("venue_name")}
            error={Boolean(errors.venue_name)}
            helperText={errors.venue_name}
            fullWidth
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
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
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
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
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, is_public: e.target.checked }))
                }
              />
            }
            label="Public session"
          />
          {apiError && <Alert severity="error">{apiError}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Stack direction="row" spacing={1.5} width="100%">
          <Button variant="outlined" fullWidth onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save changes"}
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
  const [suggestedSessions, setSuggestedSessions] = useState([]);
  const [suggestedLoading, setSuggestedLoading] = useState(false);
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
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [recordMatchModalOpen, setRecordMatchModalOpen] = useState(false);
  const [recordPrefill, setRecordPrefill] = useState({});
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const sessionsListRef = useRef(null);
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

  const extractSessions = useCallback((payload) => {
    if (Array.isArray(payload)) return payload;
    if (payload?.sessions) return payload.sessions;
    if (payload?.items) return payload.items;
    return [];
  }, []);

  const loadSuggestedSessions = useCallback(async () => {
    setSuggestedLoading(true);
    try {
      const token = getStoredToken();
      const payload = await fetchSuggestedSessions({ limit: 5 }, token);
      setSuggestedSessions(extractSessions(payload));
    } catch (err) {
      setSuggestedSessions([]);
    } finally {
      setSuggestedLoading(false);
    }
  }, [extractSessions]);

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
  }, [extractSessions, filters]);

  const refreshSessionDetails = useCallback(
    async (sessionId) => {
      if (!sessionId) return;
      setDetailsLoading(true);
      try {
        const token = getStoredToken();
        const detail = await fetchSessionDetails(sessionId, token);
        setSessionDetails(normalizeSessionDetail(detail));
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

  useEffect(() => {
    if (tab !== "sessions") return;
    loadSuggestedSessions();
  }, [tab, loadSuggestedSessions]);

  const handleOpenSession = async (session) => {
    const id = getSessionId(session);
    setSessionActionError("");
    setAdminActionLoading(false);
    setSelectedSessionId(id);
    setSessionDetails(null);
    await refreshSessionDetails(id);
  };

  const handleCloseSessionDetails = () => {
    setSelectedSessionId(null);
    setSessionDetails(null);
    setSessionActionError("");
    setEditModalOpen(false);
    setAdminActionLoading(false);
  };

  const handleSessionError = async (err, sessionId, fallbackMessage = "Something went wrong") => {
    const code = err?.code;
    if (code === "SESSION_CANCELLED") {
      const cancelledMessage = "Session was cancelled";
      setSessionActionError(cancelledMessage);
      setSelectedSessionId(null);
      setSessionDetails(null);
      await loadSessions();
      await loadSuggestedSessions();
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
      await loadSuggestedSessions();
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
      await loadSuggestedSessions();
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

  const handleDeleteSession = async (session) => {
    const sessionId = getSessionId(session);
    if (!sessionId) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this session? All participants will be removed."
    );
    if (!confirmed) return;
    setAdminActionLoading(true);
    setSessionActionError("");
    try {
      const token = getStoredToken();
      await deleteSession(sessionId, token);
      setSelectedSessionId(null);
      setSessionDetails(null);
      await loadSessions();
      await loadSuggestedSessions();
      setSnackbar({
        open: true,
        message: "Session deleted",
        severity: "success",
      });
    } catch (err) {
      await handleSessionError(err, sessionId, "Failed to delete session");
    } finally {
      setAdminActionLoading(false);
    }
  };

  const handleRecordMatch = (session) => {
    const prefill = deriveRecordMatchPrefill(session, currentUser);
    setRecordPrefill(prefill);
    setRecordMatchModalOpen(true);
  };

  const handleCreateSuccess = async () => {
    setSnackbar({
      open: true,
      message: "Session created successfully",
      severity: "success",
    });
    await loadSessions();
    await loadSuggestedSessions();
  };

  const handleEditSuccess = async () => {
    setEditModalOpen(false);
    if (selectedSessionId) {
      await refreshSessionDetails(selectedSessionId);
    }
    await loadSessions();
    await loadSuggestedSessions();
    setSnackbar({
      open: true,
      message: "Session updated",
      severity: "success",
    });
  };

  const handleOpenEditModal = () => {
    setSessionActionError("");
    setEditModalOpen(true);
  };

  const selectedSessionFromList = useMemo(
    () => sessions.find((s) => getSessionId(s) === selectedSessionId),
    [sessions, selectedSessionId]
  );

  const resolvedSelectedSession = sessionDetails || selectedSessionFromList;
  const showSuggestedSection = suggestedLoading || suggestedSessions.length > 0;
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

              {showSuggestedSection && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          Suggested for You
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Sessions that match your level and availability
                        </Typography>
                      </Stack>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() =>
                          sessionsListRef.current?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          })
                        }
                      >
                        See all
                      </Button>
                    </Stack>
                    {suggestedLoading ? (
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{ overflowX: "auto", pb: 1 }}
                      >
                        {[...Array(3)].map((_, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              minWidth: 220,
                              flex: "0 0 auto",
                              height: 92,
                              borderRadius: 2,
                              bgcolor: "action.hover",
                            }}
                          />
                        ))}
                      </Stack>
                    ) : (
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{ overflowX: "auto", pb: 1 }}
                      >
                        {suggestedSessions.map((session) => (
                          <Box key={getSessionId(session)} sx={{ minWidth: 220, flex: "0 0 auto" }}>
                            <SessionCard
                              session={session}
                              onOpen={handleOpenSession}
                              currentUser={currentUser}
                              variant="compact"
                            />
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Paper>
              )}

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

              <Stack spacing={0.5} ref={sessionsListRef}>
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
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteSession}
        adminLoading={adminActionLoading}
      />

      <EditSessionModal
        open={editModalOpen}
        session={resolvedSelectedSession}
        onClose={() => setEditModalOpen(false)}
        onUpdated={handleEditSuccess}
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
