import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

function ClubCard({
  image,
  name,
  description,
  chips,
  variant,
  actionLabel,
  onClick,
}) {
  const displayName = name || "Untitled Club";
  const displayDescription = description?.trim() || "";
  const displayChips = Array.isArray(chips) ? chips.filter(Boolean).slice(0, 4) : [];
  const showAction = variant === "discovery" && actionLabel;

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 2.5,
        overflow: "hidden",
        bgcolor: "common.white",
        boxShadow: "0 12px 36px rgba(15, 23, 42, 0.08)",
        transition: "transform 120ms ease, box-shadow 120ms ease",
        "@media (hover: hover)": {
          "&:hover": {
            boxShadow: "0 16px 40px rgba(15, 23, 42, 0.12)",
          },
        },
        "&:active": {
          transform: "scale(0.985)",
          boxShadow: "0 10px 28px rgba(15, 23, 42, 0.08)",
        },
      }}
    >
      <CardActionArea
        onClick={onClick}
        disableRipple
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          bgcolor: "transparent",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 10",
            bgcolor: "grey.100",
            borderTopLeftRadius: 2.5,
            borderTopRightRadius: 2.5,
            overflow: "hidden",
          }}
        >
          {image ? (
            <Box
              component="img"
              src={image}
              alt={displayName}
              sx={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, rgba(148, 163, 184, 0.2), rgba(226, 232, 240, 0.9))",
              }}
            />
          )}
        </Box>
        <CardContent sx={{ px: 2.75, py: 2.5, width: "100%" }}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              {displayName}
            </Typography>
            {displayDescription ? (
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
            ) : null}
            {(displayChips.length > 0 || showAction) && (
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
                sx={{ flexWrap: "wrap", gap: 1 }}
              >
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, flex: 1 }}>
                  {displayChips.map((chip) => (
                    <Chip
                      key={chip}
                      label={chip}
                      size="small"
                      sx={{
                        borderRadius: 999,
                        bgcolor: "grey.100",
                        color: "text.primary",
                        fontWeight: 500,
                        fontSize: "0.72rem",
                        height: 24,
                      }}
                    />
                  ))}
                </Box>
                {showAction && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600, textTransform: "none" }}
                  >
                    {actionLabel}
                  </Typography>
                )}
              </Stack>
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

ClubCard.propTypes = {
  image: PropTypes.string,
  name: PropTypes.string,
  description: PropTypes.string,
  chips: PropTypes.arrayOf(PropTypes.string),
  variant: PropTypes.oneOf(["my_clubs", "discovery"]),
  actionLabel: PropTypes.string,
  onClick: PropTypes.func,
};

ClubCard.defaultProps = {
  image: "",
  name: "",
  description: "",
  chips: [],
  variant: "discovery",
  actionLabel: "",
  onClick: undefined,
};

export default ClubCard;
