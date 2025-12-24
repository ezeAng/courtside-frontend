import { useMemo, useState } from "react";
import { Chip } from "@mui/material";
import { useSelector } from "react-redux";
import PlayerProfileInviteModal from "./PlayerProfileInviteModal";
import { getUserProfile, searchUsersAutocomplete } from "../services/api";
import { createInvite } from "../services/invitesApi";

const getDisplayName = (player) => {
  if (!player) return "";

  const names = [
    player.username,
    player.display_name,
    player.name,
    player.player_name,
    player.player_username,
    player.email,
  ];

  return names.find(Boolean) || "";
};

const getAuthId = (player) =>
  player?.auth_id ||
  player?.user_id ||
  player?.id ||
  player?.profile_id ||
  player?.player_auth_id ||
  player?.player_id;

const mergeSx = (base, override) => {
  if (!override) return base;
  if (Array.isArray(override)) return [base, ...override];
  return [base, override];
};

export default function PlayerProfileChip({ player, chipProps = {} }) {
  const normalizedPlayer = useMemo(
    () => (typeof player === "string" ? { username: player } : player || {}),
    [player]
  );
  const token = useSelector((state) => state.auth.accessToken);
  const currentUser = useSelector((state) => state.user.user);

  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inviteError, setInviteError] = useState(null);
  const [isInviting, setIsInviting] = useState(false);

  const label = useMemo(
    () => getDisplayName(normalizedPlayer) || "Player",
    [normalizedPlayer]
  );

  const fetchProfile = async (usernameToFetch) => {
    if (!usernameToFetch) return normalizedPlayer;

    try {
      const response = await getUserProfile(usernameToFetch, token);
      return response?.profile || response?.user || response;
    } catch (err) {
      const fallbackResults = await searchUsersAutocomplete(usernameToFetch, token).catch(
        () => []
      );
      const normalizedFallback = Array.isArray(fallbackResults)
        ? fallbackResults
        : [];

      if (normalizedFallback.length) {
        const bestMatch = normalizedFallback.find(
          (entry) =>
            entry.username === usernameToFetch ||
            entry.display_name === usernameToFetch ||
            entry.name === usernameToFetch
        );

        return bestMatch || normalizedFallback[0];
      }

      throw err;
    }
  };

  const handleOpen = async (event) => {
    event?.stopPropagation?.();
    setOpen(true);
    setInviteError(null);

    if (profile && getDisplayName(profile)) {
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const profileData = await fetchProfile(label);
      setProfile(profileData || normalizedPlayer);
    } catch (err) {
      setProfile((prev) => prev || normalizedPlayer);
      setError(err.message || "Unable to load player profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setInviteError(null);
  };

  const handleInvite = async () => {
    const opponent = profile || normalizedPlayer;
    const opponentAuthId = getAuthId(opponent);

    if (!token) {
      setInviteError("You need to be logged in to send invites.");
      return;
    }

    if (!currentUser?.auth_id || !opponentAuthId) {
      setInviteError("Unable to send invite to this user.");
      return;
    }

    const payload = {
      mode: "singles",
      players: [
        {
          auth_id: currentUser.auth_id,
          username: getDisplayName(currentUser) || "You",
          team: "A",
        },
        {
          auth_id: opponentAuthId,
          username: getDisplayName(opponent) || label,
          team: "B",
        },
      ],
    };

    try {
      setIsInviting(true);
      setInviteError(null);
      await createInvite(token, payload, currentUser);
      setOpen(false);
    } catch (err) {
      setInviteError(err.message || "Unable to send invite.");
    } finally {
      setIsInviting(false);
    }
  };

  const { sx, label: chipLabel, size, ...restChipProps } = chipProps;
  const combinedSx = mergeSx(
    { cursor: "pointer", fontWeight: 700 },
    sx
  );

  return (
    <>
      <Chip
        {...restChipProps}
        clickable
        label={chipLabel || label}
        onClick={handleOpen}
        size={size || "small"}
        sx={combinedSx}
      />
      <PlayerProfileInviteModal
        open={open}
        onClose={handleClose}
        profile={profile}
        loading={loading}
        error={error}
        onInvite={handleInvite}
        inviteError={inviteError}
        isInviting={isInviting}
      />
    </>
  );
}
