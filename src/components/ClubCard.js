import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LockIcon from "@mui/icons-material/Lock";

function ClubCard({
  name,
  description,
  visibility,
  cadence,
  memberCount,
  emblem,
  isPrivate,
  role,
  onClick,
}) {
  const displayName = name || "Untitled Club";
  const displayDescription = description || "No description yet.";

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 4,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "grey.100",
        bgcolor: "common.white",
        boxShadow: "0 24px 50px -40px rgba(15, 23, 42, 0.45)",
        transition: "transform 160ms ease, box-shadow 160ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 30px 60px -42px rgba(15, 23, 42, 0.55)",
        },
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        {emblem ? (
          <CardMedia
            component="img"
            height="170"
            image={emblem}
            alt={displayName}
            sx={{ objectFit: "cover" }}
          />
        ) : (
          <Box
            sx={{
              height: 170,
              bgcolor: "grey.100",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              No emblem
            </Typography>
          </Box>
        )}
        <CardContent sx={{ px: 3, py: 2.75, width: "100%" }}>
          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="subtitle1" fontWeight={600} noWrap>
                {displayName}
              </Typography>
              {isPrivate && <LockIcon fontSize="small" color="action" />}
            </Stack>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {displayDescription}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {visibility && (
                <Chip
                  label={visibility}
                  size="small"
                  sx={{ borderRadius: 999, bgcolor: "grey.50", fontWeight: 600 }}
                />
              )}
              {cadence && (
                <Chip
                  label={cadence}
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: 999, fontWeight: 600 }}
                />
              )}
              {role && (
                <Chip
                  label={role}
                  size="small"
                  color="primary"
                  sx={{ borderRadius: 999, fontWeight: 600 }}
                />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {memberCount} members
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

ClubCard.propTypes = {
  name: PropTypes.string,
  description: PropTypes.string,
  visibility: PropTypes.string,
  cadence: PropTypes.string,
  memberCount: PropTypes.number,
  emblem: PropTypes.string,
  isPrivate: PropTypes.bool,
  role: PropTypes.string,
  onClick: PropTypes.func,
};

ClubCard.defaultProps = {
  name: "",
  description: "",
  visibility: "",
  cadence: "",
  memberCount: 0,
  emblem: "",
  isPrivate: false,
  role: "",
  onClick: undefined,
};

export default ClubCard;
