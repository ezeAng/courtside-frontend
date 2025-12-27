import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import PlayerChip from "./components/PlayerChip";
import ProfileModal from "./components/ProfileModal";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { searchUsersThunk } from "../../features/connections/connectionsSlice";

const DEBOUNCE_MS = 400;

function SearchUsersScreen() {
  const dispatch = useDispatch();
  const { results, loading } = useSelector((state) => state.connections.search);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query?.trim()) {
        dispatch(searchUsersThunk(query.trim()));
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(handler);
  }, [dispatch, query]);

  const inputDisabled = loading;

  const content = useMemo(() => {
    if (loading) {
      return <LoadingSpinner message="Searching players..." />;
    }

    if (!query) {
      return (
        <EmptyState
          title="Search by username"
          description="Start typing to discover players."
          icon={<SearchIcon />}
        />
      );
    }

    if (!results?.length) {
      return (
        <EmptyState
          title="No players found"
          description="Try a different username."
          icon={<SearchIcon />}
        />
      );
    }

    return (
      <Stack spacing={1.5}>
        {results.map((player) => (
          <PlayerChip
            key={player.auth_id || player.id || player.username}
            player={player}
            onClick={() => setSelected(player)}
          />
        ))}
      </Stack>
    );
  }, [loading, query, results]);

  return (
    <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={800}>
          Search by Username
        </Typography>
        <TextField
          placeholder="Search by username"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={inputDisabled}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color={loading ? "disabled" : "action"} />
              </InputAdornment>
            ),
            endAdornment: query ? (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Clear search"
                  edge="end"
                  onClick={() => setQuery("")}
                  disabled={loading}
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />

        <Box>{content}</Box>
      </Stack>

      <ProfileModal open={Boolean(selected)} onClose={() => setSelected(null)} player={selected} />
    </Container>
  );
}

export default SearchUsersScreen;
