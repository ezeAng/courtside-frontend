import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";

function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  children,
  actions,
}) {
  return (
    <Stack
      spacing={2}
      alignItems="center"
      textAlign="center"
      sx={(theme) => ({
        borderRadius: "5%",
        border: `1px dashed ${theme.palette.divider}`,
        backgroundColor: theme.palette.mode === "dark"
          ? theme.palette.background.default
          : theme.palette.background.paper,
        padding: theme.spacing(3),
      })}
    >
      <Box
        sx={(theme) => ({
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
      {(actionLabel && onAction) || actions ? (
        actions ? (
          actions
        ) : (
          <Button variant="contained" size="small" onClick={onAction}>
            {actionLabel}
          </Button>
        )
      ) : null}
    </Stack>
  );
}

export default EmptyState;
