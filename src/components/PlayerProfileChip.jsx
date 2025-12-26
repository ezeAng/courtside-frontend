import { useMemo } from "react";
import { Chip } from "@mui/material";

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

  const label = useMemo(
    () => getDisplayName(normalizedPlayer) || "Player",
    [normalizedPlayer]
  );

  const { sx, label: chipLabel, size, ...restChipProps } = chipProps;
  const combinedSx = mergeSx(
    { cursor: "default", fontWeight: 400 },
    sx
  );

  return (
    <Chip
      {...restChipProps}
      label={chipLabel || label}
      size={size || "medium"}
      sx={combinedSx}
    />
  );
}
