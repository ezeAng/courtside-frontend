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

function MatchSuccessModal({ open, onClose, match }) {
  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 22 }, (_, idx) => ({
        id: idx,
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 4 + Math.random() * 2,
        rotation: Math.random() * 180,
        size: 8 + Math.random() * 10,
        color: confettiColors[idx % confettiColors.length],
      })),
    []
  );

  const matchTypeLabel = match?.match_type === "doubles" ? "Doubles match" : "Singles match";
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
        sx: { overflow: "hidden", position: "relative" },
      }}
    >
      <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        {confettiPieces.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{ y: "-20%", rotate: piece.rotation }}
            animate={{ y: "120%", rotate: piece.rotation + 180 }}
            transition={{
              duration: piece.duration,
              delay: piece.delay,
              repeat: Infinity,
              ease: "easeOut",
            }}
            style={{
              position: "absolute",
              left: `${piece.left}%`,
              width: piece.size,
              height: piece.size * 0.6,
              backgroundColor: piece.color,
              borderRadius: 4,
              opacity: 0.95,
            }}
          />
        ))}
      </Box>

      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.25, zIndex: 1, position: "relative" }}>
        <CheckCircleOutlineIcon color="success" fontSize="large" />
        Match recorded!
      </DialogTitle>
      <DialogContent sx={{ zIndex: 1, position: "relative" }}>
        <Stack spacing={2}>
          <Alert
            severity="success"
            icon={<CelebrationIcon fontSize="inherit" />}
            sx={{ borderRadius: 2, backgroundColor: (theme) => theme.palette.success.light }}
          >
            Your match has been saved successfully. Great work!
          </Alert>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={matchTypeLabel} color="primary" variant="outlined" />
            <Chip label={scoreLabel} color="success" variant="outlined" />
            <Chip label={winnerLabel} color="secondary" variant="outlined" />
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle1" fontWeight={700}>
              What happens next
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • The match now appears in your history so you can reference it anytime.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Pending confirmations, if any, will show under Matches so everyone can verify the result.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Feel free to record another match or review today&apos;s stats.
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ zIndex: 1, position: "relative", pb: 2, px: 3 }}>
        <Button variant="contained" onClick={onClose} fullWidth>
          Awesome, thanks!
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MatchSuccessModal;
