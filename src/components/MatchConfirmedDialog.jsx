import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import { motion } from "framer-motion";
import PlayerProfileChip from "./PlayerProfileChip";

function formatDelta(oldElo, newElo) {
  if (oldElo === undefined || newElo === undefined) return "";
  const delta = newElo - oldElo;
  return delta > 0 ? `+${delta}` : `${delta}`;
}

const listContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const listItem = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

export default function MatchConfirmedDialog({
  open,
  onClose,
  confirmFeedback,
}) {
  if (!confirmFeedback) return null;

  const {
    discipline,
    upset,
    updated_elos,
    elo_change_side_a,
    elo_change_side_b,
    ranks,
  } = confirmFeedback;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Match Confirmed</DialogTitle>

      <DialogContent dividers sx={{py: 4}}>
        <Stack spacing={3}>
          {/* UPSET INFO (neutral, emoji-based) */}
          {upset && (
            <Box
              sx={{
                px: 4,
                py: 4,
                borderRadius: 2,
                backgroundColor: "rgba(0,0,0,0.04)",
              }}
            >
              <Typography variant="subtitle2" fontWeight={700}>
                {upset.is_upset ? "😮 Upset!" : "📊 Match insight"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Winner avg ELO {upset.winner_avg_elo} vs Opponent avg ELO{" "}
                {upset.opponent_avg_elo} (gap {upset.elo_gap})
              </Typography>
            </Box>
          )}

          {/* ELO UPDATES */}
          {(updated_elos?.sideA?.length > 0 ||
            updated_elos?.sideB?.length > 0) && (
            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight={700}>
                ELO Updates
              </Typography>

              <motion.div
                variants={listContainer}
                initial="hidden"
                animate="visible"
              >
                {[...(updated_elos?.sideA || []), ...(updated_elos?.sideB || [])]
                  .map((p, idx) => {
                    const delta = p.new_elo - p.old_elo;
                    const deltaColor =
                      delta > 0
                        ? "success.main"
                        : delta < 0
                        ? "error.main"
                        : "text.secondary";

                    return (
                      <motion.div
                        key={`${p.auth_id}-${idx}`}
                        variants={listItem}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                        >
                          <PlayerProfileChip
                            player={{ username: p.username }}
                            chipProps={{ variant: "outlined", size: "small" }}
                          />
                          <Typography variant="body2">
                            {p.old_elo} → {p.new_elo}
                          </Typography>
                          <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.15 }}
                          >
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              sx={{ color: deltaColor }}
                            >
                              ({formatDelta(p.old_elo, p.new_elo)})
                            </Typography>
                          </motion.span>
                        </Stack>
                      </motion.div>
                    );
                  })}
              </motion.div>
            </Stack>
          )}

          {/* TEAM DELTAS (DOUBLES) */}
          {discipline === "doubles" && (
            <Stack spacing={0.5}>
              <Typography variant="subtitle1" fontWeight={700}>
                Team ELO Changes
              </Typography>
              <Typography variant="body2">
                Team A: {elo_change_side_a ?? 0}
              </Typography>
              <Typography variant="body2">
                Team B: {elo_change_side_b ?? 0}
              </Typography>
            </Stack>
          )}

          {/* RANK CHANGES */}
          {Array.isArray(ranks) && ranks.length > 0 && (
            <Stack spacing={1}>
              <Typography variant="subtitle1" fontWeight={700}>
                Rank Changes
              </Typography>

              <motion.div
                variants={listContainer}
                initial="hidden"
                animate="visible"
              >
                {ranks.map((r, idx) => {
                  const movement = r.rankChange ?? 0;
                  const emoji =
                    movement > 0 ? "⬆️" : movement < 0 ? "⬇️" : "➖";
                  const yOffset = movement > 0 ? -6 : movement < 0 ? 6 : 0;

                  return (
                    <motion.div
                      key={`${r.playerId}-${idx}`}
                      variants={listItem}
                      initial={{ opacity: 0, y: yOffset }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                      >
                        <PlayerProfileChip
                          player={{ username: r.username }}
                          chipProps={{ variant: "outlined", size: "small" }}
                        />
                        <Typography variant="body2">
                          {emoji} {r.previousRank} → {r.newRank}
                        </Typography>
                      </Stack>
                    </motion.div>
                  );
                })}
              </motion.div>
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Dismiss</Button>
      </DialogActions>
    </Dialog>
  );
}
