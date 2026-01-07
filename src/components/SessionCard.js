import { Box, Chip, LinearProgress, Stack, Typography, useTheme } from "@mui/material";
import PropTypes from "prop-types";
import {
  buildLocationLabel,
  formatDateTime,
  getCapacity,
  getFormatLabel,
  getHostAuthId,
  getJoinedCount,
  getSessionDate,
  getSessionTime,
  getSkillRange,
  isWithin24Hours,
} from "../utils/sessionUtils";
import { getPlayerAuthId } from "../utils/matchPlayers";

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
              <Typography fontWeight={700} noWrap>
                {session?.title || formatLabel}
              </Typography>
              {locationLabel && (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {locationLabel}
                </Typography>
              )}
            </Stack>
            <Chip
              label={isFull ? "Full" : isJoined ? "Joined" : isHost ? "Host" : "Open"}
              color={isFull ? "default" : isJoined ? "success" : "primary"}
              size="small"
              variant={isFull ? "outlined" : "filled"}
            />
          </Stack>
          {capacity > 0 && (
            <Stack spacing={0.5}>
              <LinearProgress variant="determinate" value={capacityProgress} />
              <Typography variant="caption" color="text.secondary">
                {joinedCount} / {capacity} slots filled
              </Typography>
            </Stack>
          )}
        </Stack>
      ) : (
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack spacing={0.25}>
              <Typography variant="overline" color="text.secondary">
                {formatDateTime(sessionDate, sessionTime)}
              </Typography>
              <Typography variant="h6" fontWeight={700} noWrap>
                {session?.title || formatLabel}
              </Typography>
              {locationLabel && (
                <Typography variant="body2" color="text.secondary" noWrap>
                  {locationLabel}
                </Typography>
              )}
            </Stack>
            <Stack alignItems="flex-end" spacing={0.5}>
              <Chip
                label={isFull ? "Full" : isJoined ? "Joined" : isHost ? "Host" : "Open"}
                color={isFull ? "default" : isJoined ? "success" : "primary"}
                size="small"
                variant={isFull ? "outlined" : "filled"}
              />
              {highlight && (
                <Chip label="Upcoming" color="warning" size="small" variant="outlined" />
              )}
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip
              label={formatLabel}
              size="small"
              color={isDoublesFormat ? "info" : "secondary"}
            />
            {skillRange && (
              <Chip
                label={`Elo ${skillRange.min ?? "Any"}–${skillRange.max ?? "Any"}`}
                size="small"
                variant="outlined"
              />
            )}
            {suggestionLabel && (
              <Chip label={suggestionLabel} size="small" variant="outlined" />
            )}
          </Stack>

          {capacity > 0 && (
            <Stack spacing={0.5}>
              <LinearProgress
                variant="determinate"
                value={capacityProgress}
                color={isFull ? "inherit" : "primary"}
              />
              <Typography variant="caption" color="text.secondary">
                {joinedCount} / {capacity} spots filled
              </Typography>
            </Stack>
          )}
        </Stack>
      )}
    </Box>
  );
};

SessionCard.propTypes = {
  session: PropTypes.object.isRequired,
  onOpen: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  variant: PropTypes.oneOf(["full", "compact"]),
};

export default SessionCard;
