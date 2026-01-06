import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GroupsIcon from "@mui/icons-material/Groups";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import CompetitionsScreen from "../Competitions/CompetitionsScreen";
import RecordMatchModal from "../Matches/RecordMatchModal";
import { mockSessions } from "./mockSessions";
import { getPlayerAuthId, getPlayerDisplayName } from "../../utils/matchPlayers";

const PLAY_TAB_STORAGE_KEY = "play-tab-selection";

const formatDateTime = (date, time) => {
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
  const start = new Date(`${date}T${time}`);
  const now = new Date();
  const diff = start.getTime() - now.getTime();
  return diff <= 24 * 60 * 60 * 1000 && diff >= 0;
};

const SessionCard = ({ session, onOpen }) => {
  const theme = useTheme();
  const isFull = session.joined_count >= session.capacity;
  const highlight = !isFull && isWithin24Hours(session.date, session.time);
  const capacityProgress = Math.min(
    100,
    (session.joined_count / session.capacity) * 100
  );

  const locationLabel = `${session.location.venue_name} • ${session.location.hall} • Court ${session.location.court_number}`;

  return (
    <Box
      onClick={() => onOpen(session)}
      sx={{
        p: 2,
        borderRadius: 2,
        border: `1px solid ${
          highlight
            ? theme.palette.primary.main
            : theme.palette.divider
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
              {formatDateTime(session.date, session.time)}
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {session.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {locationLabel}
            </Typography>
          </Stack>
          <Stack spacing={1} alignItems="flex-end">
            <Chip
              size="small"
              label={session.format === "singles" ? "Singles" : "Doubles"}
              color={session.format === "doubles" ? "primary" : "default"}
              icon={<GroupsIcon fontSize="small" />}
            />
            {isFull && (
              <Chip size="small" color="default" label="Full" />
            )}
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

        <Stack spacing={0.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" fontWeight={600}>
              Capacity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {session.joined_count} / {session.capacity}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={capacityProgress}
            color={isFull ? "inherit" : "primary"}
            sx={{ height: 8, borderRadius: 999 }}
          />
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Chip
            label={`Elo ${session.skill_range.min_elo}–${session.skill_range.max_elo}`}
            variant="outlined"
            size="small"
          />
          <Typography variant="body2" color="text.secondary">
            Host: {session.host.username} • Elo {session.host.elo}
          </Typography>
        </Stack>
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
  onClose,
  onJoin,
  onRecordMatch,
  alreadyJoined,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!session) return null;

  const isFull = session.joined_count >= session.capacity;
  const locationLabel = `${session.location.venue_name} • ${session.location.hall} • Court ${session.location.court_number}`;
  const participants = session.participants || [];
  const emptySlots = Math.max(session.capacity - participants.length, 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen={isMobile}
      scroll="paper"
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <EventAvailableIcon color="primary" />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {session.title || (session.format === "doubles" ? "Doubles" : "Singles")}
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
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography fontWeight={700}>
              {formatDateTime(session.date, session.time)}
            </Typography>
            <Typography color="text.secondary">{locationLabel}</Typography>
          </Stack>

          <Divider />

          <Stack spacing={1.5}>
            <Typography variant="subtitle2" color="text.secondary">
              Details
            </Typography>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Format</Typography>
                <Typography fontWeight={600}>
                  {session.format === "doubles" ? "Doubles" : "Singles"}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Capacity</Typography>
                <Typography fontWeight={600}>
                  {session.joined_count} / {session.capacity}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Skill range</Typography>
                <Typography fontWeight={600}>
                  Elo {session.skill_range.min_elo}–{session.skill_range.max_elo}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Host</Typography>
                <Typography fontWeight={600}>
                  {session.host.username} • Elo {session.host.elo}
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
                      Invite a teammate
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          width="100%"
        >
          <Button
            variant="outlined"
            fullWidth
            onClick={() => onJoin(session)}
            disabled={isFull || alreadyJoined}
          >
            {alreadyJoined ? "Joined" : isFull ? "Session Full" : "Join Session"}
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={() => onRecordMatch(session)}
            startIcon={<MilitaryTechIcon />}
          >
            Record Match
          </Button>
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
    participants.find((p) => getPlayerAuthId(p) && currentUserId && String(getPlayerAuthId(p)) === String(currentUserId)) ||
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

  // doubles mapping
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

function SessionsTab({
  sessions,
  onOpenSession,
  onCreateSession,
}) {
  return (
    <Stack spacing={2}>
      <Button variant="contained" fullWidth onClick={onCreateSession}>
        Create Session
      </Button>
      <Stack spacing={2}>
        {sessions.map((session) => (
          <SessionCard key={session.session_id} session={session} onOpen={onOpenSession} />
        ))}
      </Stack>
    </Stack>
  );
}

export default function PlayScreen() {
  const [tab, setTab] = useState(() => localStorage.getItem(PLAY_TAB_STORAGE_KEY) || "sessions");
  const [sessions, setSessions] = useState(mockSessions);
  const [selectedSession, setSelectedSession] = useState(null);
  const [recordMatchModalOpen, setRecordMatchModalOpen] = useState(false);
  const [recordPrefill, setRecordPrefill] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const currentUser = useSelector((state) => state.user.user);

  useEffect(() => {
    localStorage.setItem(PLAY_TAB_STORAGE_KEY, tab);
  }, [tab]);

  const handleOpenSession = (session) => {
    setSelectedSession(session);
  };

  const handleJoinSession = (session) => {
    if (!session) return;

    const sessionState = sessions.find((s) => s.session_id === session.session_id);
    if (!sessionState) return;

    if (sessionState.joined_count >= sessionState.capacity) {
      setSnackbar({
        open: true,
        message: "This session is already full.",
        severity: "warning",
      });
      return;
    }

    const currentUserId = currentUser?.auth_id || currentUser?.id;
    const alreadyJoinedInState = sessionState.participants?.some(
      (p) => currentUserId && String(getPlayerAuthId(p)) === String(currentUserId)
    );

    if (alreadyJoinedInState) {
      setSnackbar({
        open: true,
        message: "You have already joined this session.",
        severity: "info",
      });
      return;
    }

    setSessions((prev) =>
      prev.map((item) => {
        if (item.session_id !== session.session_id) return item;
        if (item.joined_count >= item.capacity) return item;

        const newParticipant = currentUser
          ? {
              username: getPlayerDisplayName(currentUser),
              elo: currentUser?.elo ?? currentUser?.rating ?? "N/A",
              auth_id: currentUserId,
            }
          : { username: "You", elo: "N/A", auth_id: "temp" };

        return {
          ...item,
          joined_count: Math.min(item.capacity, item.joined_count + 1),
          participants: [...(item.participants || []), newParticipant],
        };
      })
    );

    setSnackbar({
      open: true,
      message: "Joined session. See you on court!",
      severity: "success",
    });
  };

  const handleRecordMatch = (session) => {
    const prefill = deriveRecordMatchPrefill(session, currentUser);
    setRecordPrefill(prefill);
    setRecordMatchModalOpen(true);
  };

  const handleCreateSession = () => {
    setSnackbar({
      open: true,
      message: "Creating sessions is coming soon.",
      severity: "info",
    });
  };

  const resolvedSelectedSession = useMemo(
    () => sessions.find((s) => s.session_id === selectedSession?.session_id) || selectedSession,
    [selectedSession, sessions]
  );

  const alreadyJoined = useMemo(() => {
    if (!resolvedSelectedSession || !currentUser) return false;
    const currentUserId = currentUser?.auth_id || currentUser?.id;
    return resolvedSelectedSession.participants?.some(
      (p) => String(getPlayerAuthId(p)) === String(currentUserId)
    );
  }, [resolvedSelectedSession, currentUser]);

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
            <SessionsTab
              sessions={sessions}
              onOpenSession={handleOpenSession}
              onJoin={handleJoinSession}
              onCreateSession={handleCreateSession}
            />
          ) : (
            <CompetitionsScreen tab={tab === "tournaments" ? "tournaments" : "leagues"} allowTabSwitching={false} />
          )}
        </Stack>
      </Container>

      <SessionDetailsModal
        open={Boolean(resolvedSelectedSession)}
        session={resolvedSelectedSession}
        onClose={() => setSelectedSession(null)}
        onJoin={handleJoinSession}
        onRecordMatch={(session) => {
          handleRecordMatch(session);
        }}
        alreadyJoined={alreadyJoined}
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
