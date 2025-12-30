import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import GroupIcon from "@mui/icons-material/Group";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import PlayerChip from "./components/PlayerChip";
import ProfileModal from "./components/ProfileModal";
import {
  acceptConnectionRequestThunk,
  cancelConnectionRequestThunk,
  fetchConnectionsThunk,
  fetchIncomingRequestsThunk,
  fetchOutgoingRequestsThunk,
} from "../../features/connections/connectionsSlice";

const getId = (p) => p?.auth_id || p?.id || p?.user_id || p?.user?.auth_id;

function RequestsTab({
  type,
  items,
  loading,
  onAction,
  actionLabel,
  actionLoading,
}) {
  if (loading) {
    return <LoadingSpinner message="Loading requests..." />;
  }

  if (!items.length) {
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
      {items.map((player) => {
        const id = getId(player);
        return (
          <Stack key={id} direction="row" spacing={1} alignItems="center">
            <PlayerChip player={player} onClick={() => onAction("view", player)} />
            {actionLabel && (
              <Button
                variant={type === "incoming" ? "contained" : "outlined"}
                size="small"
                onClick={() =>
                  onAction(type === "incoming" ? "accept" : "cancel", player)
                }
                disabled={Boolean(actionLoading?.[id])}
                startIcon={
                  actionLoading?.[id] ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : null
                }
              >
                {actionLabel}
              </Button>
            )}
          </Stack>
        );
      })}
    </Stack>
  );
}

function ConnectionsHomeScreen({ defaultTab = "all" }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: connections, loading: connectionsLoading } = useSelector(
    (state) => state.connections.connections
  );

  const { incoming, outgoing, loading: requestsLoading } = useSelector((state) => {
    const req = state.connections.requests || {};

    return {
      incoming: Array.isArray(req.incoming) ? req.incoming : [],
      outgoing: Array.isArray(req.outgoing) ? req.outgoing : [],
      loading: Boolean(req.loading),
    };
  });

  const actionLoading = useSelector((state) => state.connections.actionLoading);
  const requestIds = useSelector((state) => state.connections.requestIds);

  const [tab, setTab] = useState(defaultTab);
  const [requestTab, setRequestTab] = useState("incoming");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    if (!connections.length) {
      dispatch(fetchConnectionsThunk());
    }
  }, [connections.length, dispatch]);

  useEffect(() => {
    if (tab === "requests") {
      if (!incoming.length) dispatch(fetchIncomingRequestsThunk());
      if (!outgoing.length) dispatch(fetchOutgoingRequestsThunk());
    }
  }, [dispatch, incoming.length, outgoing.length, tab]);

  const handleAction = useCallback(
    (action, player) => {
      if (action === "view") {
        setSelected(player);
        return;
      }

      const authId = getId(player);
      if (!authId) return;
      const requestId =
        player?.request_id ||
        (action === "accept"
          ? requestIds?.incoming?.[authId]
          : requestIds?.outgoing?.[authId]);
      if (!requestId) return;

      if (action === "accept") {
        dispatch(
          acceptConnectionRequestThunk({
            authId,
            requestId,
          })
        );
      }
      if (action === "cancel") {
        dispatch(
          cancelConnectionRequestThunk({
            authId,
            requestId,
          })
        );
      }
    },
    [dispatch, requestIds]
  );

  const connectionsContent = useMemo(() => {
    if (connectionsLoading) {
      return <LoadingSpinner message="Loading connections..." />;
    }

    if (!connections?.length) {
      return (
        <EmptyState
          title="No connections yet"
          description="Connect with players to see them here."
        />
      );
    }

    return (
      <Stack spacing={1.5} sx={{ py: 2 }}>
        {connections.map((player) => (
          <PlayerChip
            key={getId(player.user) || player?.user?.username}
            player={player?.user}
            onClick={() => setSelected(player?.user)}
            endAdornment={<Chip size="large" label="Connected" color="success" />}
          />
        ))}
      </Stack>
    );
  }, [connections, connectionsLoading]);

  const requestsContent = useMemo(() => {
    return (
      <Stack spacing={2}>
        <Tabs
          value={requestTab}
          onChange={(_, value) => setRequestTab(value)}
          variant="fullWidth"
        >
          <Tab label="Incoming" value="incoming" />
          <Tab label="Outgoing" value="outgoing" />
        </Tabs>

        <Box>
          {requestTab === "incoming" ? (
            <RequestsTab
              type="incoming"
              items={incoming}
              loading={requestsLoading}
              onAction={handleAction}
              actionLabel="Accept"
              actionLoading={actionLoading}
            />
          ) : (
            <RequestsTab
              type="outgoing"
              items={outgoing}
              loading={requestsLoading}
              onAction={handleAction}
              actionLabel="Cancel"
              actionLoading={actionLoading}
            />
          )}
        </Box>
      </Stack>
    );
  }, [actionLoading, handleAction, incoming, outgoing, requestTab, requestsLoading]);

  const groupsContent = (
    <EmptyState
      title="Groups coming soon"
      description="Organize your connections into groups to schedule matches faster."
      icon={<GroupIcon />}
    />
  );

  const connectionCount = connections?.length || 0;

  return (
    <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Connections
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {connectionCount} {connectionCount === 1 ? "connection" : "connections"}
            </Typography>
          </Box>
          <Button variant="outlined" onClick={() => navigate("/connections/find")}>
            + Add more
          </Button>
        </Stack>

        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          variant="fullWidth"
        >
          <Tab label="All connections" value="all" />
          <Tab label="Groups" value="groups" />
          <Tab label="Requests" value="requests" />
        </Tabs>

        <Box>
          {tab === "all" && connectionsContent}
          {tab === "groups" && groupsContent}
          {tab === "requests" && requestsContent}
        </Box>
      </Stack>

      <ProfileModal open={Boolean(selected)} onClose={() => setSelected(null)} player={selected} />
    </Container>
  );
}

export default ConnectionsHomeScreen;
