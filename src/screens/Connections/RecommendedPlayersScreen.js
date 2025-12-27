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
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ProfileModal from "./components/ProfileModal";
import PlayersFoundModal from "./components/PlayersFoundModal";
import CircularProgress from "@mui/material/CircularProgress";
import {
  fetchRecommendedPlayersThunk,
} from "../../features/connections/connectionsSlice";

const defaultFilters = {
  gender: "any",
  mode: "singles",
  region: "",
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
    <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={800}>
          Recommended Players
        </Typography>

        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography fontWeight={700}>Filters</Typography>
              <IconButton onClick={() => setShowFilters((prev) => !prev)}>
                {showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Stack>

            {showFilters && (
              <Stack spacing={2} mt={2}>
                <FormControl disabled={loading}>
                  <FormLabel>Gender</FormLabel>
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
                  <FormLabel>Mode</FormLabel>
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
                  <FormLabel>Region</FormLabel>
                  <TextField
                    placeholder="Optional"
                    value={localFilters.region}
                    onChange={handleChange("region")}
                    size="small"
                  />
                </FormControl>
              </Stack>
            )}
          </CardContent>
        </Card>

        <Button
          variant="contained"
          size="large"
          disabled={loading}
          onClick={handleSearch}
          sx={{ py: 1.5, borderRadius: 2, textTransform: "none", fontWeight: 800 }}
          startIcon={loading ? <CircularProgress color="inherit" size={18} /> : null}
        >
          {loading ? "Finding players..." : "Find Players"}
        </Button>
      </Stack>

      <PlayersFoundModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        players={results}
        onSelectPlayer={setSelected}
      />

      <ProfileModal open={Boolean(selected)} onClose={() => setSelected(null)} player={selected} />
    </Container>
  );
}

export default RecommendedPlayersScreen;
