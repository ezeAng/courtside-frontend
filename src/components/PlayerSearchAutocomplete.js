import { useEffect, useState } from "react";
import {
  Autocomplete,
  Avatar,
  Box,
  CircularProgress,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { useSelector } from "react-redux";
import { searchUsersAutocomplete } from "../services/api";
import { normalizeProfileImage } from "../utils/profileImage";

export default function PlayerSearchAutocomplete({
  value,
  onSelect,
  label = "Search by username",
  placeholder = "Start typing a username",
  excludeAuthId,
  helperText,
  autoFocus = false,
  freeSolo = true,
}) {
  const token = useSelector((state) => state.auth.accessToken);
  const currentUserId = useSelector((state) => state.user.user?.auth_id);

  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setOptions([]);
      setError(null);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await searchUsersAutocomplete(query.trim(), token);
        const results = Array.isArray(data) ? data : [];

        const filtered = results.filter(
          (u) =>
            u?.auth_id !== (excludeAuthId ?? currentUserId)
        );

        const unique = [];
        const seen = new Set();

        filtered.forEach((u) => {
          const key = u.auth_id || u.user_id || u.id || u.username;
          if (!key || seen.has(key)) return;
          seen.add(key);
          unique.push(u);
        });

        setOptions(unique);
      } catch (err) {
        setError(err.message || "Unable to search for players.");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query, token, excludeAuthId, currentUserId]);

  return (
    <>
      <Autocomplete
        freeSolo={freeSolo}
        autoFocus={autoFocus}
        options={options}
        loading={loading}
        value={value}
        inputValue={query}
        onInputChange={(_, val) => {
          setQuery(val);
          setError(null);
        }}
        onChange={(_, val) => onSelect?.(val)}
        getOptionLabel={(option) =>
          typeof option === "string"
            ? option
            : option.username || option.display_name || option.name || ""
        }
        isOptionEqualToValue={(a, b) =>
          a?.auth_id && b?.auth_id ? a.auth_id === b.auth_id : false
        }
        renderOption={(props, option) => {
          const key =
            option.auth_id ||
            option.id ||
            option.username ||
            option.display_name;

          return (
            <li {...props} key={key}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar src={normalizeProfileImage(option.profile_image_url)}>
                  {option.username?.[0]?.toUpperCase() || "U"}
                </Avatar>
                <Box>
                  <Typography fontWeight={700}>
                    {option.username || option.display_name || option.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Elo: {option.elo ?? option.rating ?? "N/A"}
                  </Typography>
                </Box>
              </Stack>
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            helperText={helperText}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading && <CircularProgress size={20} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            fullWidth
          />
        )}
      />

      {error && <Alert severity="error">{error}</Alert>}
    </>
  );
}
