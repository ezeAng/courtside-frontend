import { useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CelebrationIcon from "@mui/icons-material/Celebration";
import { motion } from "framer-motion";

const confettiColors = ["#66bb6a", "#42a5f5", "#ffa726", "#ef5350", "#ab47bc"];

function MatchSuccessModal({ open, onClose, match, onAddVideo }) {
  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 30 }, (_, idx) => ({
        id: `${open}-${idx}`,
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 2.8 + Math.random() * 1.6,
        rotation: Math.random() * 180,
        size: 8 + Math.random() * 12,
        color: confettiColors[idx % confettiColors.length],
      })),
    [open]
  );

  const matchTypeLabel =
    match?.match_type === "doubles" ? "Doubles match" : "Singles match";
  const scoreLabel = match?.score ? `Score: ${match.score}` : "Score submitted";
  const winnerLabel =
    match?.winner_team === "draw"
      ? "Recorded as a draw"
      : match?.winner_team === "A"
      ? "Winner: Team A"
      : match?.winner_team === "B"
      ? "Winner: Team B"
      : "Result logged";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          overflow: "hidden",
          position: "relative",
        },
      }}
    >
      {/* 🎉 CONFETTI LAYER */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          overflow: "hidden",
        }}
      >
        {confettiPieces.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{ y: "-30%", rotate: piece.rotation, opacity: 0 }}
            animate={{
              y: "130%",
              rotate: piece.rotation + 180,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: piece.duration,
              delay: piece.delay,
              ease: "easeOut",
            }}
            style={{
              position: "absolute",
              left: `${piece.left}%`,
              width: piece.size,
              height: piece.size * 0.6,
              backgroundColor: piece.color,
              borderRadius: 4,
            }}
          />
        ))}
      </Box>

      {/* CONTENT */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          position: "relative",
          zIndex: 2,
          px: 4,
          pt: 3,
        }}
      >
        <CheckCircleOutlineIcon color="success" fontSize="large" />
        Match recorded!
      </DialogTitle>

      <DialogContent
        sx={{
          position: "relative",
          zIndex: 2,
          px: 4,
          pt: 2,
          pb: 4,
          backgroundColor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(2px)",
        }}
      >
        <Stack spacing={3} alignItems="center">
          <Box
            sx={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              backgroundColor: (theme) => theme.palette.success.light,
              color: (theme) => theme.palette.success.dark,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: 4,
            }}
          >
            <CheckCircleOutlineIcon sx={{ fontSize: 84 }} />
          </Box>

          <Alert
            severity="success"
            icon={<CelebrationIcon fontSize="inherit" />}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              width: "100%",
              backgroundColor: (theme) => theme.palette.success.light,
            }}
          >
            Your match has been saved successfully. Great work!
          </Alert>

          <Stack direction="row" spacing={1.25} flexWrap="wrap" justifyContent="center">
            <Chip label={matchTypeLabel} variant="outlined" />
            <Chip label={scoreLabel} color="success" variant="outlined" />
            <Chip label={winnerLabel} color="secondary" variant="outlined" />
          </Stack>

          <Divider flexItem sx={{ my: 1 }} />

          <Stack spacing={1.25} width="100%">
            <Typography variant="subtitle1" fontWeight={700}>
              What happens next
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • The match now appears in your history.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Any pending confirmations will show under Matches.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • You can record another match or review today’s stats.
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          position: "relative",
          zIndex: 2,
          px: 4,
          pb: 3,
          pt: 1,
          flexDirection: "column",
          gap: 1,
        }}
      >
        {onAddVideo && (
          <Button onClick={onAddVideo} fullWidth>
            Add match video
          </Button>
        )}
        <Button variant="contained" onClick={onClose} fullWidth size="large">
          Awesome, thanks!
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MatchSuccessModal;
