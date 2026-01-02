import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  Box,
  Grid,
  Divider,
} from "@mui/material";
import { motion, easeInOut } from "framer-motion";
import NumberFlow from "@number-flow/react";
import PlayerProfileChip from "./PlayerProfileChip";
import { useEffect, useMemo, useState } from "react";

const POSITIVE_COLOR = "#39ff14";
const NEGATIVE_COLOR = "#ff5f3d";

export default function MatchConfirmedDialog({
  open,
  onClose,
  confirmFeedback,
  currentAuthId,
}) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (open) {
      setAnimate(false);
      const t = setTimeout(() => setAnimate(true), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  const allPlayers = useMemo(() => {
    if (!confirmFeedback?.updated_elos) return [];
    return [
      ...(confirmFeedback.updated_elos.sideA || []),
      ...(confirmFeedback.updated_elos.sideB || []),
    ];
  }, [confirmFeedback]);

  const me = useMemo(
    () => allPlayers.find((p) => p.auth_id === currentAuthId),
    [allPlayers, currentAuthId]
  );

  const others = useMemo(
    () => allPlayers.filter((p) => p.auth_id !== currentAuthId),
    [allPlayers, currentAuthId]
  );

  const myRank = useMemo(
    () =>
      confirmFeedback?.ranks?.find(
        (r) => r.playerId === currentAuthId
      ),
    [confirmFeedback, currentAuthId]
  );

  if (!confirmFeedback || !me) return null;

  const eloDelta = me.new_elo - me.old_elo;
  const eloColor =
    eloDelta > 0
      ? POSITIVE_COLOR
      : eloDelta < 0
      ? NEGATIVE_COLOR
      : "text.secondary";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Match Confirmed</DialogTitle>

      <DialogContent dividers sx={{ py: 4 }}>
        <Stack spacing={4}>
          {/* ===================== YOU (CENTER STAGE) ===================== */}
          <Box
            sx={{
              textAlign: "center",
              px: 3,
              py: 4,
              borderRadius: 3,
              backgroundColor: "rgba(0,0,0,0.04)",
            }}
          >
            <PlayerProfileChip
              player={{ username: me.username }}
              chipProps={{ size: "medium" }}
            />

            {/* LABEL */}
            <Typography
              variant="caption"
              sx={{ mt: 1, display: "block", fontWeight: 700 }}
            >
              ELO CHANGE
            </Typography>

            {/* BIG DELTA */}
            <motion.div
              animate={{ scale: animate ? [1, 1.08, 1] : 1 }}
              transition={{ duration: 1.2, ease: easeInOut }}
            >
              <Typography
                sx={{
                  fontSize: 64,
                  fontWeight: 900,
                  color: eloColor,
                  lineHeight: 1,
                }}
              >
                <NumberFlow
                  value={animate ? eloDelta : 0}
                  prefix={eloDelta > 0 ? "+" : ""}
                />
              </Typography>
            </motion.div>

            {/* SUPPORTING STATS */}
            <Stack
              direction="row"
              justifyContent="center"
              spacing={4}
              sx={{ mt: 2 }}
            >
              <Stack>
                <Typography variant="caption" fontWeight={700}>
                  ELO
                </Typography>
                <Typography sx={{ fontSize: 28, fontWeight: 700 }}>
                  <NumberFlow
                    value={animate ? me.new_elo : me.old_elo}
                  />
                </Typography>
              </Stack>

              {myRank && (
                <Stack>
                  <Typography variant="caption" fontWeight={700}>
                    RANK
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 22,
                      fontWeight: 700,
                      color:
                        myRank.rankChange > 0
                          ? POSITIVE_COLOR
                          : myRank.rankChange < 0
                          ? NEGATIVE_COLOR
                          : "text.secondary",
                    }}
                  >
                    <NumberFlow
                      value={
                        animate
                          ? myRank.newRank
                          : myRank.previousRank
                      }
                    />
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>

          {/* ===================== OTHERS ===================== */}
          {others.length > 0 && (
            <>
              <Divider />

              <Stack spacing={2}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Other players
                </Typography>

                <Grid container spacing={2}>
                  {others.map((p) => {
                    const delta = p.new_elo - p.old_elo;
                    const color =
                      delta > 0
                        ? POSITIVE_COLOR
                        : delta < 0
                        ? NEGATIVE_COLOR
                        : "text.secondary";

                    return (
                      <Grid item xs={12} key={p.auth_id}>
                        <Box
                          sx={{
                            px: 2,
                            py: 1.5,
                            borderRadius: 2,
                            backgroundColor: "rgba(0,0,0,0.03)",
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                          >
                            {/* NAME */}
                            <Box sx={{ width: 120 }}>
                              <PlayerProfileChip
                                player={{ username: p.username }}
                                chipProps={{ size: "small" }}
                              />
                            </Box>

                            {/* DELTA */}
                            <Box sx={{ width: 80, textAlign: "right" }}>
                              <Typography
                                variant="caption"
                                fontWeight={700}
                              >
                                Δ ELO
                              </Typography>
                              <Typography
                                sx={{ fontWeight: 800, color }}
                              >
                                <NumberFlow
                                  value={animate ? delta : 0}
                                  prefix={delta > 0 ? "+" : ""}
                                />
                              </Typography>
                            </Box>

                            {/* ELO */}
                            <Box sx={{ width: 80, textAlign: "right" }}>
                              <Typography
                                variant="caption"
                                fontWeight={700}
                              >
                                ELO
                              </Typography>
                              <Typography sx={{ fontWeight: 700 }}>
                                <NumberFlow
                                  value={
                                    animate ? p.new_elo : p.old_elo
                                  }
                                />
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Stack>
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Dismiss</Button>
      </DialogActions>
    </Dialog>
  );
}
