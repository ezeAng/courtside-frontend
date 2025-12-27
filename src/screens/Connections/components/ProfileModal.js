import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import ProfileAvatar from "../../../components/ProfileAvatar";
import {
  acceptConnectionRequestThunk,
  cancelConnectionRequestThunk,
  fetchContactThunk,
  fetchConnectionsThunk,
  fetchIncomingRequestsThunk,
  fetchOutgoingRequestsThunk,
  sendConnectionRequestThunk,
} from "../../../features/connections/connectionsSlice";
import ContactSection from "./ContactSection";

const getId = (player) => player?.auth_id || player?.id || player?.user_id;

function ProfileModal({ open, onClose, player }) {
  const dispatch = useDispatch();
  const authUserId = useSelector((state) => state.user.user?.auth_id);
  const { statusMap, actionLoading } = useSelector((state) => state.connections);

  const playerId = getId(player);
  const status = playerId ? statusMap[playerId] : null;
  const isOwn = playerId && playerId === authUserId;
  const loading = playerId ? actionLoading[playerId] : false;

  useEffect(() => {
    if (open && playerId && !statusMap[playerId]) {
      dispatch(fetchIncomingRequestsThunk());
      dispatch(fetchOutgoingRequestsThunk());
      dispatch(fetchConnectionsThunk());
    }
  }, [dispatch, open, playerId, statusMap, statusMap?.[playerId]]);

  useEffect(() => {
    if (open && status === "connected" && playerId) {
      dispatch(fetchContactThunk(playerId));
    }
  }, [dispatch, open, playerId, status]);

  const handleConnect = () => {
    if (!playerId) return;
    dispatch(sendConnectionRequestThunk(playerId));
  };

  const handleCancel = () => {
    if (!playerId) return;
    dispatch(cancelConnectionRequestThunk(playerId));
  };

  const handleAccept = () => {
    if (!playerId) return;
    dispatch(acceptConnectionRequestThunk(playerId));
  };

  const actionArea = useMemo(() => {
    if (isOwn) return null;

    switch (status) {
      case "connected":
        return (
          <Chip label="Connected" color="success" variant="outlined" />
        );
      case "outgoing_request":
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label="Request Sent" color="info" />
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : null}
            >
              {loading ? "Cancelling..." : "Cancel Request"}
            </Button>
          </Stack>
        );
      case "incoming_request":
        return (
          <Button
            variant="contained"
            onClick={handleAccept}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? "Accepting..." : "Accept Request"}
          </Button>
        );
      default:
        return (
          <Button
            variant="contained"
            onClick={handleConnect}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? "Sending..." : "Connect"}
          </Button>
        );
    }
  }, [handleAccept, handleCancel, handleConnect, isOwn, loading, status]);

  if (!player) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{player.username || "Player"}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} alignItems="center" textAlign="center">
          <ProfileAvatar user={player} size={90} editable={false} />
          <Typography variant="h6" fontWeight={700}>
            {player.username}
          </Typography>
          <Typography color="text.secondary">{player.region || "Unknown region"}</Typography>
          {player.bio && (
            <Typography variant="body2" color="text.secondary">
              {player.bio}
            </Typography>
          )}

          {actionArea}

          {status === "connected" && (
            <ContactSection playerId={playerId} />
          )}

          <Divider flexItem sx={{ width: "100%" }} />

          <Stack spacing={1} width="100%">
            <Typography variant="subtitle1" fontWeight={700}>
              Stats
            </Typography>
            <Stack direction="row" justifyContent="space-between">
              <Box textAlign="left">
                <Typography fontWeight={700}>Singles Elo</Typography>
                <Typography color="text.secondary">
                  {player.singles_elo ?? player.singlesElo ?? "N/A"}
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography>Matches</Typography>
                <Typography color="text.secondary">
                  {player.singles_matches ?? player.singlesMatches ?? "-"}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Box textAlign="left">
                <Typography fontWeight={700}>Doubles Elo</Typography>
                <Typography color="text.secondary">
                  {player.doubles_elo ?? player.doublesElo ?? "N/A"}
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography>Matches</Typography>
                <Typography color="text.secondary">
                  {player.doubles_matches ?? player.doublesMatches ?? "-"}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProfileModal;
