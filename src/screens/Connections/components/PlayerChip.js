import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { normalizeProfileImage } from "../../../utils/profileImage";

function PlayerChip({ player, onClick, endAdornment }) {
  if (!player) return null;

  const avatarSrc = normalizeProfileImage(player.profile_image_url);
  const label = player.username || player.display_name || "Player";
  const elo = player.overall_elo || player.elo;

  return (
    <Chip
      onClick={onClick}
      clickable
      avatar={<Avatar src={avatarSrc} alt={label} />}
      label={
        <Box display="flex" alignItems="center" gap={1}>
          <Box>
            <strong>{label}</strong>
            {elo ? (
              <Box component="span" ml={1} color="text.secondary">
                Elo {elo}
              </Box>
            ) : null}
          </Box>
          {endAdornment || <ChevronRightIcon fontSize="small" />}
        </Box>
      }
      sx={{
        justifyContent: "space-between",
        width: "100%",
        borderRadius: 2,
        py: 1.5,
        px: 1,
        fontWeight: 600,
      }}
    />
  );
}

export default PlayerChip;
