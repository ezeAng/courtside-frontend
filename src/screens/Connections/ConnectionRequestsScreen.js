import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import PlayerChip from "./components/PlayerChip";
import ProfileModal from "./components/ProfileModal";
import {
  acceptConnectionRequestThunk,
  cancelConnectionRequestThunk,
  fetchIncomingRequestsThunk,
  fetchOutgoingRequestsThunk,
} from "../../features/connections/connectionsSlice";

function RequestsTab({ type, items, loading, onAction, actionLabel, actionLoading }) {
  if (loading) {
    return <LoadingSpinner message="Loading requests..." />;
  }

  if (!items?.length) {
    return (
      <EmptyState
        title={type === "incoming" ? "No incoming requests" : "No outgoing requests"}
        description={
          type === "incoming"
            ? "You will see requests from other players here."
            : "You will see your pending requests here."
        }
      />
    );
  }

  return (
    <Stack spacing={1.5}>
      {items.map((player) => (
        <Stack key={player.auth_id || player.id || player.username} direction="row" spacing={1} alignItems="center">
          <PlayerChip player={player} onClick={() => onAction("view", player)} />
          {actionLabel && (
            <Button
              variant={type === "incoming" ? "contained" : "outlined"}
              size="small"
              onClick={() => onAction(type === "incoming" ? "accept" : "cancel", player)}
              disabled={Boolean(actionLoading?.[player.auth_id || player.id])}
              startIcon={
                actionLoading?.[player.auth_id || player.id] ? (
                  <CircularProgress size={16} color="inherit" />
                ) : null
              }
            >
              {actionLabel}
            </Button>
          )}
        </Stack>
      ))}
    </Stack>
  );
}

function ConnectionRequestsScreen() {
  const dispatch = useDispatch();
  const { incoming, outgoing, loading } = useSelector((state) => state.connections.requests);
  const actionLoading = useSelector((state) => state.connections.actionLoading);
  const [tab, setTab] = useState("incoming");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    dispatch(fetchIncomingRequestsThunk());
    dispatch(fetchOutgoingRequestsThunk());
  }, [dispatch]);

  const handleAction = (action, player) => {
    if (action === "view") {
      setSelected(player);
      return;
    }

    const authId = player?.auth_id || player?.id;
    if (!authId) return;

    if (action === "accept") {
      dispatch(acceptConnectionRequestThunk(authId));
    }
    if (action === "cancel") {
      dispatch(cancelConnectionRequestThunk(authId));
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={800}>
          Connection Requests
        </Typography>

        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          variant="fullWidth"
        >
          <Tab label="Incoming" value="incoming" />
          <Tab label="Outgoing" value="outgoing" />
        </Tabs>

        <Box>
          {tab === "incoming" ? (
            <RequestsTab
              type="incoming"
              items={incoming}
              loading={loading}
              onAction={handleAction}
              actionLabel="Accept"
              actionLoading={actionLoading}
            />
          ) : (
            <RequestsTab
              type="outgoing"
              items={outgoing}
              loading={loading}
              onAction={handleAction}
              actionLabel="Cancel"
              actionLoading={actionLoading}
            />
          )}
        </Box>
      </Stack>

      <ProfileModal open={Boolean(selected)} onClose={() => setSelected(null)} player={selected} />
    </Container>
  );
}

export default ConnectionRequestsScreen;
