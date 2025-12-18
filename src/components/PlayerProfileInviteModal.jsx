import React from "react";
import {
  Alert,
  Avatar,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { normalizeProfileImage } from "../utils/profileImage";

function extractStats(profile) {
  if (!profile) return {};
  const profileDetails = profile.profile || profile;
  const stats = profile.stats || profile.statistics || profileDetails.stats || profileDetails;

  const wins = stats?.wins ?? stats?.record?.wins ?? stats?.wins_count ?? stats?.winsCount ?? null;
  const losses =
    stats?.losses ?? stats?.record?.losses ?? stats?.losses_count ?? stats?.lossesCount ?? null;
  const matchesPlayed =
    stats?.matches_played ?? stats?.matches ?? stats?.total_matches ?? stats?.games ?? null;
  const calculatedMatches = matchesPlayed ?? (wins !== null && losses !== null ? wins + losses : null);
  const winRate =
    stats?.win_rate ??
    (wins !== null && losses !== null && wins + losses > 0
      ? Math.round((wins / (wins + losses)) * 100)
      : null);
  const elo = stats?.elo ?? stats?.rating ?? stats?.current_elo ?? profileDetails?.elo ?? null;

  return {
    profileDetails,
    wins,
    losses,
    matches: calculatedMatches,
    winRate,
    elo,
  };
}

export default function PlayerProfileInviteModal({
  open,
  onClose,
  profile,
  loading,
  error,
  onInvite,
  inviteError,
  isInviting,
}) {
  const { profileDetails, wins, losses, matches, winRate, elo } = extractStats(profile);

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
              <BoxDisplay
                username={username}
                subtitle={profileDetails?.email || profileDetails?.bio || "Courtside player"}
              />
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
                  label={`Matches: ${matches ?? "—"}`}
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

function BoxDisplay({ username, subtitle }) {
  return (
    <Stack>
      <Typography variant="h6" fontWeight={800} gutterBottom>
        {username}
      </Typography>
      <Typography color="text.secondary">{subtitle}</Typography>
    </Stack>
  );
}
