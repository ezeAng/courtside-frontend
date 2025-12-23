import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";

function EmptyState({ title, description, actionLabel, onAction, icon, children }) {
  return (
    <Stack
      spacing={1.5}
      alignItems="center"
      textAlign="center"
      sx={(theme) => ({
        borderRadius: theme.custom?.colors?.radii?.md || theme.shape.borderRadius,
        border: `1px dashed ${theme.palette.divider}`,
        backgroundColor: theme.palette.mode === "dark"
          ? theme.palette.background.default
          : theme.palette.background.paper,
        padding: theme.spacing(3),
      })}
    >
      <Box
        sx={(theme) => ({
          width: 48,
          height: 48,
          borderRadius: "50%",
          backgroundColor: theme.palette.action.hover,
          display: "grid",
          placeItems: "center",
          color: theme.palette.text.secondary,
        })}
      >
        {icon || <InsertEmoticonIcon fontSize="small" />}
      </Box>
      <Stack spacing={0.5} alignItems="center">
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
            {description}
          </Typography>
        )}
        {children}
      </Stack>
      {actionLabel && onAction && (
        <Button variant="contained" size="small" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Stack>
  );
}

export default EmptyState;
