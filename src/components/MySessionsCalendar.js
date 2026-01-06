import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LensIcon from "@mui/icons-material/Lens";
import {
  fetchMySessions,
  fetchSessionDetails,
  joinSession,
  leaveSession,
} from "../api/sessions";
import {
  buildLocationLabel,
  formatDateKey,
  getFormatLabel,
  getSessionDate,
  getSessionId,
  getSessionTime,
  isSessionPast,
  normalizeSessionDetail,
} from "../utils/sessionUtils";
import SessionDetailsModal from "./SessionDetailsModal";
import { getStoredToken } from "../services/storage";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatMonthKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const getMonthRange = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    start: formatDateKey(start),
    end: formatDateKey(end),
  };
};

const extractSessions = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload?.sessions) return payload.sessions;
  if (payload?.items) return payload.items;
  return [];
};

const formatDayLabel = (dateString) => {
  if (!dateString) return "";
  const parsed = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const formatTimeLabel = (date, time) => {
  if (!date || !time) return "Time TBD";
  const parsed = new Date(`${date}T${time}`);
  if (Number.isNaN(parsed.getTime())) return "Time TBD";
  return parsed.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const DaySessionItem = ({ session, onOpen }) => {
  const sessionDate = getSessionDate(session);
  const sessionTime = getSessionTime(session);
  const isPast = isSessionPast(session);
  const title = session?.title || getFormatLabel(session?.format);
  const location = buildLocationLabel(session);

  return (
    <Paper
      variant="outlined"
      onClick={() => onOpen(session)}
      sx={{
        p: 1.5,
        borderRadius: 2,
        cursor: "pointer",
        opacity: isPast ? 0.6 : 1,
        bgcolor: "background.paper",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 3,
        },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <LensIcon
          fontSize="small"
          color={isPast ? "disabled" : "primary"}
          sx={{ flexShrink: 0 }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            {formatTimeLabel(sessionDate, sessionTime)}
          </Typography>
          <Typography>{title}</Typography>
          {location && (
            <Typography variant="body2" color="text.secondary">
              {location}
            </Typography>
          )}
          {isPast && (
            <Chip
              label="Completed"
              size="small"
              sx={{ mt: 0.75 }}
              variant="outlined"
              color="default"
            />
          )}
        </Box>
      </Stack>
    </Paper>
  );
};

export default function MySessionsCalendar({ token, currentUser }) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [monthSessions, setMonthSessions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const authToken = token || getStoredToken();
  const currentMonthKey = formatMonthKey(currentMonth);
  const sessionsForMonth = monthSessions[currentMonthKey] || [];
  const hasMonthData = monthSessions[currentMonthKey] !== undefined;

  const loadSessionsForMonth = useCallback(
    async (monthDate, { force } = {}) => {
      const monthKey = formatMonthKey(monthDate);
      if (!force && monthSessions[monthKey]) return;
      const { start, end } = getMonthRange(monthDate);
      setLoading(true);
      setError("");
      try {
        const payload = await fetchMySessions(start, end, authToken);
        const items = extractSessions(payload);
        setMonthSessions((prev) => ({ ...prev, [monthKey]: items }));
      } catch (err) {
        setError(err.message || "Failed to load sessions");
      } finally {
        setLoading(false);
      }
    },
    [authToken, monthSessions]
  );

  const refreshCurrentMonth = useCallback(
    () => loadSessionsForMonth(currentMonth, { force: true }),
    [currentMonth, loadSessionsForMonth]
  );

  useEffect(() => {
    loadSessionsForMonth(currentMonth);
  }, [currentMonth, loadSessionsForMonth]);

  const calendarMap = useMemo(() => {
    const map = {};
    sessionsForMonth.forEach((session) => {
      const dateKey = getSessionDate(session);
      if (!dateKey) return;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(session);
    });
    return map;
  }, [sessionsForMonth]);

  const selectedDaySessions = selectedDateKey ? calendarMap[selectedDateKey] || [] : [];

  const sessionDetailsSource = useMemo(
    () =>
      sessionsForMonth.find((session) => getSessionId(session) === selectedSessionId) ||
      selectedDaySessions.find((session) => getSessionId(session) === selectedSessionId),
    [sessionsForMonth, selectedDaySessions, selectedSessionId]
  );

  const resolvedSessionDetails = sessionDetails || sessionDetailsSource;

  const refreshSessionDetails = useCallback(
    async (sessionId) => {
      if (!sessionId) return;
      setDetailsLoading(true);
      try {
        const payload = await fetchSessionDetails(sessionId, authToken);
        setSessionDetails(normalizeSessionDetail(payload));
      } catch (err) {
        setActionError(err.message || "Failed to load session");
      } finally {
        setDetailsLoading(false);
      }
    },
    [authToken]
  );

  const handleDayClick = (dateKey) => {
    if (!calendarMap[dateKey]?.length) return;
    setSelectedDateKey(dateKey);
  };

  const handleOpenSession = async (session) => {
    const sessionId = getSessionId(session);
    if (!sessionId) return;
    setSelectedSessionId(sessionId);
    setSessionDetails(null);
    setActionError("");
    await refreshSessionDetails(sessionId);
  };

  const handleCloseSessionDetails = () => {
    setSelectedSessionId(null);
    setSessionDetails(null);
    setActionError("");
  };

  const handleJoinSession = async (session) => {
    const sessionId = getSessionId(session);
    if (!sessionId) return;
    setActionLoading(true);
    setActionError("");
    try {
      await joinSession(sessionId, authToken);
      await refreshSessionDetails(sessionId);
      await refreshCurrentMonth();
    } catch (err) {
      setActionError(err.message || "Failed to join session");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveSession = async (session) => {
    const sessionId = getSessionId(session);
    if (!sessionId) return;
    setActionLoading(true);
    setActionError("");
    try {
      await leaveSession(sessionId, authToken);
      await refreshSessionDetails(sessionId);
      await refreshCurrentMonth();
    } catch (err) {
      setActionError(err.message || "Failed to leave session");
    } finally {
      setActionLoading(false);
    }
  };

  const buildDayCells = () => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const daysInMonth = endOfMonth.getDate();
    const leadingBlanks = startOfMonth.getDay();

    const cells = [];
    for (let i = 0; i < leadingBlanks; i += 1) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    }
    return cells;
  };

  const dayCells = buildDayCells();
  const monthLabel = currentMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const goToMonth = (delta) => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const hasSessionsThisMonth = sessionsForMonth.length > 0;
  const isInitialLoading = loading && !hasMonthData;

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h6" fontWeight={800}>
            My Sessions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your upcoming and past games
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton aria-label="Previous month" onClick={() => goToMonth(-1)}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="subtitle1" fontWeight={700}>
            {monthLabel}
          </Typography>
          <IconButton aria-label="Next month" onClick={() => goToMonth(1)}>
            <ChevronRightIcon />
          </IconButton>
        </Stack>
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2,
          p: 2,
          bgcolor: "background.paper",
          boxShadow: "none",
        }}
      >
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between">
            {weekdays.map((day) => (
              <Typography
                key={day}
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{ width: "14.28%", textAlign: "center" }}
              >
                {day}
              </Typography>
            ))}
          </Stack>

          {isInitialLoading ? (
            <Stack spacing={1}>
              {[...Array(5)].map((_, idx) => (
                <Skeleton
                  key={idx}
                  variant="rectangular"
                  height={48}
                  sx={{ borderRadius: 1.5 }}
                />
              ))}
            </Stack>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 1,
              }}
            >
              {dayCells.map((date, idx) => {
                if (!date) {
                  return <Box key={`blank-${idx}`} />;
                }
                const dateKey = formatDateKey(date);
                const sessionsForDay = calendarMap[dateKey] || [];
                const hasSessions = sessionsForDay.length > 0;
                const hasUpcomingSession = sessionsForDay.some(
                  (session) => !isSessionPast(session)
                );
                const indicatorColor = hasUpcomingSession ? "primary.main" : "text.disabled";
                const isToday = formatDateKey(new Date()) === dateKey;

                return (
                  <Box
                    key={dateKey}
                    onClick={() => handleDayClick(dateKey)}
                    sx={{
                      p: 1.25,
                      borderRadius: 1.5,
                      minHeight: 80,
                      border: "1px solid",
                      borderColor: isToday ? "primary.light" : "divider",
                      bgcolor: hasSessions ? "action.hover" : "transparent",
                      cursor: hasSessions ? "pointer" : "default",
                      transition: "all 0.15s ease",
                      "&:hover": hasSessions
                        ? {
                            boxShadow: 1,
                            bgcolor: "action.selected",
                          }
                        : undefined,
                    }}
                  >
                    <Stack spacing={1} alignItems="center">
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        color={hasSessions ? "text.primary" : "text.secondary"}
                      >
                        {date.getDate()}
                      </Typography>
                      {hasSessions && (
                        <LensIcon
                          fontSize="small"
                          sx={{ color: indicatorColor, opacity: hasUpcomingSession ? 1 : 0.65 }}
                        />
                      )}
                    </Stack>
                  </Box>
                );
              })}
            </Box>
          )}
        </Stack>
      </Paper>

      {!hasSessionsThisMonth && !isInitialLoading && (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          No sessions this month
        </Typography>
      )}

      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}

      <Dialog
        open={Boolean(selectedDaySessions.length)}
        onClose={() => setSelectedDateKey("")}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{formatDayLabel(selectedDateKey)}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            {selectedDaySessions.map((session) => (
              <DaySessionItem
                key={getSessionId(session)}
                session={session}
                onOpen={handleOpenSession}
              />
            ))}
          </Stack>
        </DialogContent>
      </Dialog>

      <SessionDetailsModal
        open={Boolean(resolvedSessionDetails)}
        session={resolvedSessionDetails}
        loading={detailsLoading}
        onClose={handleCloseSessionDetails}
        onJoin={handleJoinSession}
        onLeave={handleLeaveSession}
        onRecordMatch={() => {}}
        currentUser={currentUser}
        actionLoading={actionLoading}
        actionError={actionError}
        adminLoading={false}
      />
    </Stack>
  );
}
