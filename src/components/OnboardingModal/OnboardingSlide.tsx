import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export type OnboardingSlideProps = {
  title: string;
  description: string;
  image: string;
};

function OnboardingSlide({ title, description, image }: OnboardingSlideProps) {
  return (
    <Stack spacing={2.5} alignItems="center" textAlign="center" sx={{ height: "100%" }}>
      <Box
        sx={{
          width: "100%",
          maxWidth: 360,
          height: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 3,
          bgcolor: "background.default",
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src={image}
          alt={title}
          sx={{
            maxHeight: "100%",
            width: "auto",
            objectFit: "contain",
          }}
        />
      </Box>
      <Stack spacing={1} sx={{ maxWidth: 520 }}>
        <Typography variant="h5" fontWeight={700} color="text.primary">
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      </Stack>
    </Stack>
  );
}

export default OnboardingSlide;
