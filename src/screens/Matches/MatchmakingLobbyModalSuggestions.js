import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import SendIcon from "@mui/icons-material/Send";
import { useSelector } from "react-redux";
import { createInvite, findMatchSuggestions } from "../../services/invitesApi";
import {
  buildInvitePlayers,
  formatTeamNames,
  getPlayerAuthId,
  getPlayerDisplayName,
  normalizeMatchPlayers,
} from "../../utils/matchPlayers";
import LoadingSpinner from "../../components/LoadingSpinner";

const formatCriteria = (criteria) => {
  if (!criteria) return null;
  const rangeText = criteria.range === "any" ? "Range: any" : `Range: ±${criteria.range}`;
  return `Target Elo: ${criteria.target_elo}${criteria.range !== undefined ? `, ${rangeText}` : ""}`;
};

function MatchmakingLobbyModalSuggestions({
  open,
  onClose,
  token: propToken,
  onInviteSent,
  defaultMode = "singles",
}) {
  const reduxToken = useSelector((state) => state.auth.accessToken);
  const token = propToken || reduxToken;

  const currentUser = useSelector((state) => state.user.user);
  const [mode, setMode] = useState(defaultMode);
  const [status, setStatus] = useState("idle");
  const [recommendations, setRecommendations] = useState([]);
  const [criteria, setCriteria] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const currentUserInfo = useMemo(
    () => ({
      auth_id: currentUser?.auth_id,
      username: currentUser?.username || currentUser?.display_name || "You",
    }),
    [currentUser]
  );

  const loadSuggestions = useCallback(
    async (selectedMode) => {
      if (!token) {
        setStatus("error");
        setErrorMessage("You need to be logged in to search for matches.");
        return;
      }
      setStatus("loading");
      setErrorMessage(null);
      try {
        const response = await findMatchSuggestions(token, selectedMode);
        if (response?.state === "suggested") {
          setRecommendations((response.recommendations || []).slice(0, 5));
          setCriteria(response.criteria || null);
          setSelectedIndex(0);
          setStatus("suggested");
        } else if (response?.state === "no_suggestions") {
          setRecommendations([]);
          setCriteria(null);
          setStatus("no_suggestions");
        } else if (response?.error) {
          setStatus("error");
          setErrorMessage(response.error || "Unable to load suggestions");
        } else {
          setStatus("no_suggestions");
        }
      } catch (err) {
        setStatus("error");
        setErrorMessage(err.message || "Unable to load suggestions");
      }
    },
    [token]
  );

  useEffect(() => {
    if (open) {
      setMode(defaultMode);
      loadSuggestions(defaultMode);
    }
  }, [open, loadSuggestions, defaultMode]);

  const handleModeChange = (_, val) => {
    if (!val) return;
    setMode(val);
    loadSuggestions(val);
  };

  const selectedRecommendation = recommendations[selectedIndex];
  const selectedTeams = useMemo(
    () => normalizeMatchPlayers(selectedRecommendation || {}),
    [selectedRecommendation]
  );
  const doublesInvitePlayers = useMemo(
    () => buildInvitePlayers(selectedTeams.teamA, selectedTeams.teamB, currentUserInfo),
    [selectedTeams.teamA, selectedTeams.teamB, currentUserInfo]
  );

  const handleRefresh = () => loadSuggestions(mode);

  const handleNext = () => {
    if (!recommendations.length) return;
    setSelectedIndex((prev) => (prev + 1) % recommendations.length);
  };

  const handleSendInvite = async () => {
    if (!currentUserInfo.auth_id) {
      setErrorMessage("You need to be logged in to send invites.");
      return;
    }

    if (!selectedRecommendation) return;

    const payload =
      mode === "doubles"
        ? (() => {
            if (doublesInvitePlayers.length < 4) {
              setErrorMessage("Unable to send invite. Doubles invites require four players.");
              return null;
            }

            return { mode: "doubles", players: doublesInvitePlayers };
          })()
        : (() => {
            const opponentAuthId =
              getPlayerAuthId(selectedRecommendation) || selectedRecommendation.id;
            const opponentName =
              getPlayerDisplayName(selectedRecommendation) || "Player";

            if (!opponentAuthId) {
              setErrorMessage("Unable to send invite to this player.");
              return null;
            }

            return {
              mode,
              players: [
                {
                  auth_id: currentUserInfo.auth_id,
                  username: currentUserInfo.username,
                  team: "A",
                },
                {
                  auth_id: opponentAuthId,
                  username: opponentName,
                  team: "B",
                },
              ],
            };
          })();

    if (!payload) return;

    try {
      setIsSending(true);
      setErrorMessage(null);
      await createInvite(token, payload);
      onInviteSent?.();
      onClose?.();
    } catch (err) {
      setErrorMessage(err.message || "Failed to send invite.");
    } finally {
      setIsSending(false);
    }
  };

  const renderRecommendations = () => (
    <Stack spacing={2} mt={1}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2" color="text.secondary">
          Recommended for you{criteria ? ` — ${formatCriteria(criteria)}` : ""}
        </Typography>
        <Button
          size="small"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={status === "loading"}
        >
          Refresh
        </Button>
      </Stack>
      <Stack spacing={1}>
        {recommendations.map((rec, idx) => {
          const isSelected = idx === selectedIndex;
          const { teamA, teamB } = normalizeMatchPlayers(rec);
          const isDoubles = mode === "doubles";
          return (
            <Card
              key={rec.auth_id || rec.username || rec.match_id || idx}
              variant={isSelected ? "outlined" : "elevation"}
              sx={{
                borderColor: isSelected ? "primary.main" : undefined,
              }}
            >
              <CardActionArea onClick={() => setSelectedIndex(idx)}>
                <CardContent>
                  {isDoubles ? (
                    <Stack spacing={0.5}>
                      <Typography fontWeight={700}>Team A</Typography>
                      <Typography color="text.secondary">
                        {formatTeamNames(teamA, currentUserInfo.auth_id) || "Pending players"}
                      </Typography>
                      <Typography fontWeight={700} mt={1}>
                        Team B
                      </Typography>
                      <Typography color="text.secondary">
                        {formatTeamNames(teamB, currentUserInfo.auth_id) || "Pending players"}
                      </Typography>
                    </Stack>
                  ) : (
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={rec.profile_image_url} alt={rec.username || "Player"} />
                      <Box flex={1}>
                        <Typography fontWeight={700}>{rec.username || "Player"}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Elo: {rec.elo ?? "N/A"} · Gap: ±{rec.elo_gap}
                        </Typography>
                      </Box>
                    </Stack>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Stack>
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          startIcon={<NavigateNextIcon />}
          onClick={handleNext}
          disabled={recommendations.length <= 1}
          fullWidth
        >
          Next
        </Button>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={handleSendInvite}
          disabled={
            !selectedRecommendation ||
            (mode === "doubles" &&
              doublesInvitePlayers.length < 4) ||
            isSending
          }
          fullWidth
        >
          Send Invite
        </Button>
      </Stack>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
    </Stack>
  );

  const renderNoSuggestions = () => (
    <Stack spacing={2} alignItems="center" py={2}>
      <Typography variant="h6">No players available right now</Typography>
      <Typography color="text.secondary" align="center">
        Try again in a bit to see new recommendations.
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button variant="contained" onClick={handleRefresh}>
          Try again
        </Button>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </Stack>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
    </Stack>
  );

  const renderError = () => (
    <Stack spacing={2} alignItems="center" py={2}>
      <Alert severity="error" sx={{ width: "100%" }}>
        {errorMessage || "Something went wrong"}
      </Alert>
      <Stack direction="row" spacing={1}>
        <Button variant="contained" onClick={handleRefresh}>
          Try again
        </Button>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </Stack>
    </Stack>
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pr: 6 }}>
        Match Suggestions
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 16, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <ToggleButtonGroup
            value={mode}
            exclusive
            fullWidth
            onChange={handleModeChange}
            color="primary"
          >
            <ToggleButton value="singles">Singles</ToggleButton>
            <ToggleButton value="doubles">Doubles</ToggleButton>
          </ToggleButtonGroup>
          <Divider />
          {status === "loading" && (
            <LoadingSpinner message="Finding players near your Elo..." />
          )}
          {status === "suggested" && renderRecommendations()}
          {status === "no_suggestions" && renderNoSuggestions()}
          {status === "error" && renderError()}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleRefresh} startIcon={<RefreshIcon />} disabled={status === "loading"}>
          Refresh suggestions
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MatchmakingLobbyModalSuggestions;
