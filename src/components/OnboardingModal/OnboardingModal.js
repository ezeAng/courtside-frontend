import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Modal from "@mui/material/Modal";
import Slide from "@mui/material/Slide";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import OnboardingSlide from "./OnboardingSlide";
import { onboardingSlides } from "./onboardingContent";

function OnboardingModal({ open, onDismiss }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  const slideCount = useMemo(() => onboardingSlides.length, []);

  useEffect(() => {
    if (open) {
      setActiveIndex(0);
    }
  }, [open]);

  const handleSkip = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => {
      if (prev < slideCount - 1) {
        return prev + 1;
      }
      onDismiss();
      return prev;
    });
  }, [onDismiss, slideCount]);

  const handlePrevious = useCallback(() => {
    setActiveIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleTouchStart = useCallback((event) => {
    setTouchStartX(event.changedTouches[0]?.clientX ?? null);
  }, []);

  const handleTouchEnd = useCallback(
    (event) => {
      if (touchStartX === null) return;
      const deltaX = event.changedTouches[0]?.clientX - touchStartX;
      const swipeThreshold = 48;
      if (deltaX < -swipeThreshold) {
        handleNext();
      } else if (deltaX > swipeThreshold) {
        handlePrevious();
      }
      setTouchStartX(null);
    },
    [handleNext, handlePrevious, touchStartX]
  );

  return (
    <Modal
      open={open}
      onClose={handleSkip}
      closeAfterTransition
      keepMounted
      slotProps={{
        backdrop: {
          sx: { backgroundColor: "rgba(0, 0, 0, 0.4)" },
          timeout: 250,
        },
      }}
      aria-labelledby="onboarding-modal-title"
      aria-describedby="onboarding-modal-description"
    >
      <Slide direction="up" in={open} mountOnEnter unmountOnExit timeout={320}>
        <Box
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: { xs: "78vh", sm: "74vh" },
            bgcolor: "background.paper",
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3,
            boxShadow: "0px -8px 32px rgba(0,0,0,0.18)",
            p: { xs: 3, sm: 4 },
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="start">
            <Stack spacing={0.5}>
              <Typography variant="overline" color="text.secondary" letterSpacing={0.8}>
                Before you start
              </Typography>
              <Typography id="onboarding-modal-title" variant="h5" fontWeight={700} color="text.primary">
                See how Courtside keeps score
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Button onClick={handleSkip} color="inherit" size="small">
                Skip
              </Button>
              <IconButton aria-label="Close" onClick={handleSkip} size="small">
                <CloseRoundedIcon />
              </IconButton>
            </Stack>
          </Stack>

          <Box id="onboarding-modal-description" sx={{ flexGrow: 1, overflow: "hidden" }}>
            <OnboardingSlide {...onboardingSlides[activeIndex]} />
          </Box>

          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
            <Button
              onClick={handlePrevious}
              color="inherit"
              startIcon={<ArrowBackIosNewRoundedIcon fontSize="small" />}
              disabled={activeIndex === 0}
            >
              Back
            </Button>

            <Stack direction="row" alignItems="center" gap={2} sx={{ flexGrow: 1, justifyContent: "center" }}>
              {onboardingSlides.map((slide, index) => (
                <Box
                  key={slide.key}
                  sx={{
                    height: 10,
                    minWidth: 10,
                    borderRadius: 999,
                    bgcolor: index === activeIndex ? "primary.main" : "grey.300",
                    width: index === activeIndex ? 28 : 10,
                    transition: "all 200ms ease",
                  }}
                />
              ))}
            </Stack>

            <Button
              variant="contained"
              endIcon={<ArrowForwardIosRoundedIcon fontSize="small" />}
              onClick={handleNext}
            >
              {activeIndex === slideCount - 1 ? "Start" : "Next"}
            </Button>
          </Stack>
        </Box>
      </Slide>
    </Modal>
  );
}

export default OnboardingModal;
