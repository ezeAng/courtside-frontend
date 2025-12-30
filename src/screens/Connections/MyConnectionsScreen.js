import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import PlayerChip from "./components/PlayerChip";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import ProfileModal from "./components/ProfileModal";
import { fetchConnectionsThunk } from "../../features/connections/connectionsSlice";

function MyConnectionsScreen() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.connections.connections);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    dispatch(fetchConnectionsThunk());
  }, [dispatch]);

  return (
    <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={800}>
          My Connections
        </Typography>

        {loading ? (
          <LoadingSpinner message="Loading connections..." />
        ) : items?.length ? (
          <Stack spacing={1.5}>
            {items.map((player) => (
              <PlayerChip
                key={player?.user.auth_id || player?.user.id || player?.user.username}
                player={player?.user}
                onClick={() => setSelected(player?.user)}
                endAdornment={<Chip size="small" label="Connected" color="success" />}
              />
            ))}
          </Stack>
        ) : (
          <EmptyState
            title="No connections yet"
            description="Connect with players to see them here."
          />
        )}
      </Stack>

      <ProfileModal open={Boolean(selected)} onClose={() => setSelected(null)} player={selected} />
    </Container>
  );
}

export default MyConnectionsScreen;
