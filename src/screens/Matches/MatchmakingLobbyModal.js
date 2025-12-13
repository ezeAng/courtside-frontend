import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useSelector } from "react-redux";
import {
  createInvite,
  findMatch,
  leaveQueue,
} from "../../services/invitesApi";

function getDisplayName(player) {
  if (!player) return "Opponent";
  return (
    player.username ||
    player.display_name ||
    player.name ||
    player.user?.username ||
    player.user?.display_name ||
    player.id ||
    "Opponent"
  );
}

function getAuthId(player) {
  if (!player) return undefined;
  return (
    player.auth_id ||
    player.user_id ||
    player.id ||
    player.player_id ||
    player.player_auth_id ||
    player.user?.auth_id
  );
}

function MatchmakingLobbyModal({ open, onClose, onInviteCreated }) {
  const token = useSelector((state) => state.auth.accessToken);
  const currentUser = useSelector((state) => state.user.user);
  const [mode, setMode] = useState("singles");
  const [status, setStatus] = useState("searching");
  const [opponent, setOpponent] = useState(null);
  const intervalRef = useRef(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const userInfo = useMemo(
    () => ({
      auth_id: currentUser?.auth_id,
      username: currentUser?.username || currentUser?.display_name,
    }),
    [currentUser]
  );

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const leaveQueueSafely = async (selectedMode) => {
    try {
      if (token) {
        await leaveQueue(token, selectedMode);
      }
    } catch (err) {
      console.warn("Failed to leave queue", err);
    }
  };

  useEffect(() => {
    if (!open) {
      stopPolling();
      return undefined;
    }

    setStatus("searching");
    setOpponent(null);
    setError(null);

    const poll = async () => {
      try {
        const result = await findMatch(token, mode);
        if (result?.state === "matched") {
          setOpponent(result.opponent || result.match || result); // fallback to capture any shape
          setStatus("matched");
          stopPolling();
        }
      } catch (err) {
        setError(err.message);
        setStatus("error");
        stopPolling();
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 4000);

    return () => {
      stopPolling();
      leaveQueueSafely(mode);
    };
  }, [open, mode, token]);

  const handleClose = async () => {
    stopPolling();
    await leaveQueueSafely(mode);
    onClose?.();
  };

  const handleSendInvite = async () => {
    if (!userInfo.auth_id) {
      setError("Missing current user info");
      return;
    }

    const opponentAuthId = getAuthId(opponent);
    const opponentName = getDisplayName(opponent);

    if (!opponentAuthId) {
      setError("Missing opponent info");
      return;
    }

    const payload = {
      mode,
      players: [
        {
          auth_id: userInfo.auth_id,
          username: userInfo.username || "You",
          team: 1,
        },
        {
          auth_id: opponentAuthId,
          username: opponentName,
          team: 2,
        },
      ],
    };

    try {
      setError(null);
      await createInvite(token, payload);
      setSuccessMessage("Invite sent");
      if (onInviteCreated) {
        onInviteCreated();
      }
      await handleClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const searchingView = (
    <Stack spacing={3} alignItems="center" py={2}>
      <CircularProgress />
      <Typography color="text.secondary">Searching for match...</Typography>
      <Button variant="outlined" color="error" onClick={handleClose}>
        Cancel
      </Button>
    </Stack>
  );

  const matchedView = (
    <Stack spacing={2} py={1}>
      <Typography variant="h6" fontWeight={700}>
        Match found!
      </Typography>
      <Typography>
        Opponent: <strong>{getDisplayName(opponent)}</strong>
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button variant="contained" onClick={handleSendInvite}>
          Send Invite
        </Button>
        <Button variant="outlined" onClick={handleClose}>
          Close
        </Button>
      </Stack>
    </Stack>
  );

  const errorView = (
    <Stack spacing={2} py={2}>
      <Alert severity="error">{error || "Something went wrong"}</Alert>
      <Button variant="outlined" onClick={handleClose}>
        Close
      </Button>
    </Stack>
  );

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ pr: 5 }}>
        Matchmaking Lobby
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, val) => val && setMode(val)}
            fullWidth
            color="primary"
          >
            <ToggleButton value="singles">Singles</ToggleButton>
            <ToggleButton value="doubles">Doubles</ToggleButton>
          </ToggleButtonGroup>

          {status === "matched"
            ? matchedView
            : status === "error"
            ? errorView
            : searchingView}
        </Stack>
      </DialogContent>
      <DialogActions>
        {status !== "matched" && (
          <Button onClick={handleClose} color="error">
            Cancel Search
          </Button>
        )}
      </DialogActions>
      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage("")}
        message={successMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Dialog>
  );
}

export default MatchmakingLobbyModal;
