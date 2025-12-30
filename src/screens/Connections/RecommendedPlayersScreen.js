import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CircularProgress from "@mui/material/CircularProgress";
import ProfileModal from "./components/ProfileModal";
import PlayersFoundModal from "./components/PlayersFoundModal";
import {
  fetchRecommendedPlayersThunk,
} from "../../features/connections/connectionsSlice";

const defaultFilters = {
  gender: "any",
  mode: "singles",
  region: "any",
};

function RecommendedPlayersScreen() {
  const dispatch = useDispatch();
  const { filters, loading, results } = useSelector(
    (state) => state.connections.recommended
  );

  const [showFilters, setShowFilters] = useState(true);
  const [localFilters, setLocalFilters] = useState(filters || defaultFilters);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLocalFilters(filters || defaultFilters);
  }, [filters]);

  const handleSearch = async () => {
    const result = await dispatch(fetchRecommendedPlayersThunk(localFilters));
    if (fetchRecommendedPlayersThunk.fulfilled.match(result)) {
      setModalOpen(true);
    }
  };

  const handleChange = (field) => (event) => {
    setLocalFilters((prev) => ({ ...prev, [field]: event.target.value }));
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6, pb: 10 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Recommended Players
          </Typography>
          <Typography color="text.secondary">
            Find players that best match your play style.
          </Typography>
        </Box>

        {/* Filters */}
        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CardContent sx={{ p: 4, py: 5 }}>
            <Stack spacing={2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                
              >
                <Typography sx={{margin: 1}} fontWeight={800}>Filters</Typography>
                <IconButton
                  size="small"
                  onClick={() => setShowFilters((prev) => !prev)}
                >
                  {showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Stack>

              {showFilters && (
                <Stack spacing={5}>
                  <FormControl disabled={loading}>
                    <FormLabel sx={{margin: 1}}>Gender</FormLabel>
                    <Select
                      value={localFilters.gender}
                      onChange={handleChange("gender")}
                      size="small"
                    >
                      <MenuItem value="any">Any</MenuItem>
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl disabled={loading}>
                    <FormLabel sx={{margin: 1}}>Mode</FormLabel>
                    <Select
                      value={localFilters.mode}
                      onChange={handleChange("mode")}
                      size="small"
                    >
                      <MenuItem value="singles">Singles</MenuItem>
                      <MenuItem value="doubles">Doubles</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl disabled={loading}>
                    <FormLabel sx={{margin: 1}}>Region</FormLabel>
                    <Select
                      value={localFilters.region}
                      onChange={handleChange("region")}
                      size="small"
                    >
                      <MenuItem value="any">Any</MenuItem>
                      <MenuItem value="N">North</MenuItem>
                      <MenuItem value="NE">Northeast</MenuItem>
                      <MenuItem value="E">East</MenuItem>
                      <MenuItem value="SE">Southeast</MenuItem>
                      <MenuItem value="S">South</MenuItem>
                      <MenuItem value="SW">Southwest</MenuItem>
                      <MenuItem value="W">West</MenuItem>
                      <MenuItem value="NW">Northwest</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Search CTA */}
        <Box
          sx={{
            position: "relative",
            "@keyframes pulse": {
              "0%": { boxShadow: "0 0 0 0 rgba(25,118,210,0.6)" },
              "70%": { boxShadow: "0 0 0 14px rgba(25,118,210,0)" },
              "100%": { boxShadow: "0 0 0 0 rgba(25,118,210,0)" },
            },
          }}
        >
          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            onClick={handleSearch}
            startIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
            sx={{
              height: "7vh",
              py: 2,
              borderRadius: 13,
              fontWeight: 900,
              fontSize: "1rem",
              textTransform: "none",
              animation: loading ? "pulse 1.6s infinite" : "none",
            }}
          >
            {loading ? "Searching for players…" : "Find Recommended Players"}
          </Button>
        </Box>
      </Stack>

      {/* Results modal */}
      <PlayersFoundModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        players={results}
        onSelectPlayer={setSelected}
      />

      {/* Profile modal */}
      <ProfileModal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        player={selected}
      />
    </Container>
  );
}

export default RecommendedPlayersScreen;
