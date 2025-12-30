import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { normalizeProfileImage } from "../../../utils/profileImage";

function PlayerChip({ player, onClick, endAdornment, sx }) {
  if (!player) return null;

  const avatarSrc = normalizeProfileImage(player.profile_image_url);
  const label = player.username || "Player";
  const elo = player.overall_elo || player.elo;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        px: 4,
        py: 4,
        borderRadius: 2,
        cursor: onClick ? "pointer" : "default",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        transition: "background-color 0.15s ease, box-shadow 0.15s ease",
        "&:hover": onClick
          ? {
              bgcolor: "action.hover",
            }
          : undefined,
        ...sx,
      }}
    >
      {/* Avatar */}
      <Avatar
        src={avatarSrc}
        alt={label}
        sx={{
          width: 56,
          height: 56,
          mr: 2,
          fontSize: 20,
        }}
      />

      {/* Name + Elo */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minWidth: 0,
          px:6,
        }}
      >
        {/* Username */}
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            noWrap
          >
            {label}
          </Typography>
        </Box>

        {/* Elo */}
        {elo && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ ml: 2, whiteSpace: "nowrap" }}
          >
            Elo {elo}
          </Typography>
        )}
      </Box>

      {/* End adornment */}
      <Box sx={{ ml: 2, color: "text.secondary", display: "flex" }}>
        {endAdornment || <ChevronRightIcon />}
      </Box>
    </Box>
  );
}

export default PlayerChip;
