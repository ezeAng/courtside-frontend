import { useEffect, useState, useCallback } from "react";
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
import PlayerCardModal from "../../../components/PlayerCardModal";

const getId = (player) => player?.auth_id || player?.id || player?.user_id;

function ProfileModal({ open, onClose, player }) {
  const dispatch = useDispatch();
  const authUserId = useSelector((state) => state.user.user?.auth_id);
  const { statusMap, actionLoading } = useSelector((state) => state.connections);

  const [showCard, setShowCard] = useState(false);

  const playerId = getId(player);
  const status = playerId ? statusMap[playerId] : null;
  const isOwn = playerId && playerId === authUserId;
  const loading = playerId ? actionLoading[playerId] : false;

  // Ensure connection state is loaded when opening modal
  useEffect(() => {
    if (open && playerId && !status) {
      dispatch(fetchIncomingRequestsThunk());
      dispatch(fetchOutgoingRequestsThunk());
      dispatch(fetchConnectionsThunk());
    }
  }, [dispatch, open, playerId, status]);

  // Fetch contact only when connected
  useEffect(() => {
    if (open && status === "connected" && playerId) {
      dispatch(fetchContactThunk(playerId));
    }
  }, [dispatch, open, playerId, status]);

  // Reset local state on close
  useEffect(() => {
    if (!open) setShowCard(false);
  }, [open]);

  const handleConnect = useCallback(() => {
    if (!playerId) return;
    dispatch(sendConnectionRequestThunk(playerId));
  }, [dispatch, playerId]);

  const handleCancel = useCallback(() => {
    if (!playerId) return;
    dispatch(cancelConnectionRequestThunk(playerId));
  }, [dispatch, playerId]);

  const handleAccept = useCallback(() => {
    if (!playerId) return;
    dispatch(acceptConnectionRequestThunk(playerId));
  }, [dispatch, playerId]);

  if (!player) return null;

  let actionArea = null;

  if (!isOwn) {
    switch (status) {
      case "connected":
        actionArea = (
          <Chip label="Connected" color="success" variant="outlined" />
        );
        break;

      case "outgoing_request":
        actionArea = (
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
        break;

      case "incoming_request":
        actionArea = (
          <Button
            variant="contained"
            onClick={handleAccept}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? "Accepting..." : "Accept Request"}
          </Button>
        );
        break;

      default:
        actionArea = (
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
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>{player.username || "Player"}</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <ProfileAvatar user={player} size={90} editable={false} />

            <Typography variant="h6" fontWeight={700}>
              {player.username}
            </Typography>

            <Typography color="text.secondary">
              {player.region || "Unknown region"}
            </Typography>

            {player.bio && (
              <Typography variant="body2" color="text.secondary">
                {player.bio}
              </Typography>
            )}

            {actionArea}

            {playerId && (
              <Button variant="outlined" onClick={() => setShowCard(true)}>
                See player card
              </Button>
            )}

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

      {showCard && playerId && (
        <PlayerCardModal
          targetAuthId={playerId}
          onClose={() => setShowCard(false)}
        />
      )}
    </>
  );
}

export default ProfileModal;
