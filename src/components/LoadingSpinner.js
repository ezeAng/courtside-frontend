import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

/**
 * Small, reusable loading indicator that defaults to a green spinner.
 * The component supports swapping the visual loader for a future animation or GIF
 * by providing a custom image source.
 */
function LoadingSpinner({
  message,
  size = 28,
  inline = false,
  imageSrc,
  loaderProps,
}) {
  const loader = imageSrc ? (
    <Box
      component="img"
      src={imageSrc}
      alt="Loading"
      sx={{
        width: size,
        height: size,
        objectFit: "contain",
      }}
    />
  ) : (
    <CircularProgress size={size} color="success" thickness={5} {...loaderProps} />
  );

  return (
    <Stack
      direction={inline ? "row" : "column"}
      alignItems="center"
      justifyContent={inline ? "flex-start" : "center"}
      spacing={1}
      sx={{ width: "100%" }}
    >
      {loader}
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Stack>
  );
}

export default LoadingSpinner;
