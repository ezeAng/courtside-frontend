import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import PropTypes from "prop-types";
import {
  buildLocationLabel,
  formatDateTime,
  getCapacity,
  getFormatLabel,
  getHostAuthId,
  getJoinedCount,
  getSkillRange,
} from "../utils/sessionUtils";
import { getPlayerAuthId } from "../utils/matchPlayers";

export const ParticipantItem = ({ player }) => (
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
        Elo {player?.overall_elo ?? player?.elo ?? "N/A"}
      </Typography>
    </Box>
  </Stack>
);

ParticipantItem.propTypes = {
  player: PropTypes.object,
};

const SessionDetailsModal = ({
  open,
  session,
  loading,
  onClose,
  onJoin,
  onLeave,
  onRecordMatch,
  onEdit,
  onDelete,
  currentUser,
  actionLoading,
  actionError,
  adminLoading,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const sessionDate = session ? session.session_date || session.date : "";
  const sessionTime = session ? session.session_time || session.time : "";
  const joinedCount = getJoinedCount(session);
  const capacity = getCapacity(session);
  const skillRange = getSkillRange(session);
  const locationLabel = buildLocationLabel(session);
  const participants = session?.participants || [];
  const currentUserId = currentUser?.auth_id || currentUser?.id;
  const hostAuthId = getHostAuthId(session);
  const isHost = currentUserId && hostAuthId && String(hostAuthId) === String(currentUserId);
  const isParticipant = participants.some(
    (p) => currentUserId && String(getPlayerAuthId(p)) === String(currentUserId)
  );
  const isFull = capacity > 0 && joinedCount >= capacity;
  const hostActionsDisabled = loading || actionLoading || adminLoading;
  const actionDisabled = isHost || (isFull && !isParticipant) || hostActionsDisabled;
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
          {isHost && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} width="100%">
              <Button
                variant="outlined"
                fullWidth
                startIcon={<EditIcon />}
                onClick={() => onEdit?.(session)}
                disabled={hostActionsDisabled}
              >
                Edit session
              </Button>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                startIcon={<DeleteOutlineIcon />}
                onClick={() => onDelete?.(session)}
                disabled={hostActionsDisabled}
              >
                Delete session
              </Button>
            </Stack>
          )}
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

SessionDetailsModal.propTypes = {
  open: PropTypes.bool,
  session: PropTypes.object,
  loading: PropTypes.bool,
  onClose: PropTypes.func,
  onJoin: PropTypes.func,
  onLeave: PropTypes.func,
  onRecordMatch: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  currentUser: PropTypes.object,
  actionLoading: PropTypes.bool,
  actionError: PropTypes.string,
  adminLoading: PropTypes.bool,
};

export default SessionDetailsModal;
