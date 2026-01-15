import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import SearchIcon from "@mui/icons-material/Search";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { createClub, fetchClubs, searchClubs } from "../../api/clubs";
import ClubCard from "../../components/ClubCard";

const visibilityOptions = [
  { label: "Public", value: "public" },
  { label: "Private", value: "private" },
];

const getClubId = (club) => club?.id || club?.club_id;

const getClubVisibility = (club) => {
  if (club?.visibility) return club.visibility;
  if (club?.is_private !== undefined) return club.is_private ? "private" : "public";
  if (club?.is_public !== undefined) return club.is_public ? "public" : "private";
  return "public";
};

const getClubEmblem = (club) =>
  club?.emblem_url || club?.emblem || club?.logo_url || club?.image_url || "";

const getClubMemberCount = (club) =>
  club?.member_count ?? club?.members_count ?? club?.members?.length ?? 0;

const getClubShortDescription = (club) =>
  club?.short_description || club?.shortDescription || club?.description || "";

const getClubCadence = (club) => club?.cadence || club?.meeting_cadence || "";

const CreateClubModal = ({ open, onClose, onCreated }) => {
  const token = useSelector((state) => state.auth.accessToken);
  const [form, setForm] = useState({
    name: "",
    description: "",
    playing_cadence: "",
    visibility: "public",
    max_members: "",
    usual_venues: "",
    contact_info: "",
  });
  const [emblemFile, setEmblemFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setForm({
        name: "",
        description: "",
        playing_cadence: "",
        visibility: "public",
        max_members: "",
        usual_venues: "",
        contact_info: "",
      });
      setEmblemFile(null);
      setError("");
      setSubmitting(false);
    }
  }, [open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const maxMembersValue =
        form.max_members === "" ? null : Number.isNaN(Number(form.max_members))
          ? null
          : Number(form.max_members);
      const payload = {
        p_name: form.name,
        p_description: form.description,
        p_visibility: form.visibility,
        p_max_members: maxMembersValue,
        p_playing_cadence: form.playing_cadence,
        p_usual_venues: form.usual_venues,
        p_contact_info: form.contact_info,
        file: emblemFile,
      };
      const response = await createClub(payload, token);
      const clubId = response?.id || response?.club_id || response?.club?.id;
      if (clubId) {
        onCreated(clubId);
      } else {
        onClose();
      }
    } catch (err) {
      setError(err.message || "Failed to create club");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Club</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Club name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            autoFocus
          />
          <TextField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={3}
          />
          <TextField
            label="Playing cadence"
            name="playing_cadence"
            value={form.playing_cadence}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            select
            label="Visibility"
            name="visibility"
            value={form.visibility}
            onChange={handleChange}
            fullWidth
          >
            {visibilityOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <Stack spacing={1}>
            <Button variant="outlined" component="label">
              Upload emblem image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setEmblemFile(file);
                }}
              />
            </Button>
            <Typography variant="caption" color="text.secondary">
              {emblemFile ? `Selected: ${emblemFile.name}` : "Optional PNG/JPG emblem."}
            </Typography>
          </Stack>
          <TextField
            label="Max members"
            name="max_members"
            value={form.max_members}
            onChange={handleChange}
            fullWidth
            type="number"
            inputProps={{ min: 1 }}
          />
          <TextField
            label="Usual venues"
            name="usual_venues"
            value={form.usual_venues}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Contact info"
            name="contact_info"
            value={form.contact_info}
            onChange={handleChange}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Creating..." : "Create Club"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function ClubsScreen() {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.accessToken);
  const user = useSelector((state) => state.user.user);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const canCreateClub =
    user?.membership_tier === "pro" && user?.is_premium === true;

  const loadClubs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await fetchClubs(token);
      const list = Array.isArray(payload) ? payload : payload?.clubs || payload?.items || [];
      setClubs(list);
    } catch (err) {
      setError(err.message || "Failed to load clubs");
      setClubs([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const runSearch = useCallback(
    async (query) => {
      if (!query) {
        setSearchResults([]);
        setSearchError("");
        setSearchLoading(false);
        return;
      }
      setSearchLoading(true);
      setSearchError("");
      try {
        const payload = await searchClubs(query, token);
        const list = Array.isArray(payload) ? payload : payload?.clubs || payload?.items || [];
        setSearchResults(list);
      } catch (err) {
        setSearchError(err.message || "Failed to search clubs");
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    loadClubs();
  }, [loadClubs]);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setSearchError("");
      return;
    }
    const timeout = setTimeout(() => {
      runSearch(trimmed);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchQuery, runSearch]);

  const clubCards = useMemo(() => {
    const list = searchQuery.trim() ? searchResults : clubs;
    return list.map((club) => {
      const clubId = getClubId(club);
      const visibility = getClubVisibility(club);
      const isPrivate = visibility === "private";
      const emblem = getClubEmblem(club);
      return (
        <Grid size={{ xs: 12, sm: 6 }} key={clubId || club.name}>
          <ClubCard
            name={club.name}
            description={getClubShortDescription(club)}
            visibility={visibility}
            cadence={getClubCadence(club)}
            memberCount={getClubMemberCount(club)}
            emblem={emblem}
            isPrivate={isPrivate}
            onClick={() => clubId && navigate(`/clubs/${clubId}`)}
          />
        </Grid>
      );
    });
  }, [clubs, navigate, searchQuery, searchResults]);

  const listLoading = searchQuery.trim() ? searchLoading : loading;
  const listError = searchQuery.trim() ? searchError : error;
  const listEmpty = searchQuery.trim()
    ? !searchLoading && searchResults.length === 0 && !searchError
    : !loading && clubs.length === 0 && !error;

  return (
    <Container maxWidth="sm" sx={{ pb: 12, pt: 2 }}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight={800}>
            Club
          </Typography>
          <Button size="small" onClick={() => navigate("/clubs/my")}>
            My Clubs
          </Button>
        </Stack>

        <Card
          sx={{
            borderRadius: 3,
            color: "common.white",
            background:
              "linear-gradient(135deg, rgba(16,106,82,0.98) 0%, rgba(46,156,122,0.94) 55%, rgba(98,196,154,0.92) 100%)",
            boxShadow: "0px 18px 32px -20px rgba(16, 106, 82, 0.7)",
            minHeight: 220,
          }}
        >
          <CardContent sx={{ px: 4, py: 4.5, height: "100%" }}>
            <Stack
              spacing={2.5}
              sx={{ height: "100%" }}
              justifyContent="center"
              alignItems="flex-start"
            >
              <Stack spacing={2} sx={{ textAlign: "left" }}>
                <Typography variant="h6" fontWeight={700}>
                  Create your own Courtside club
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Start a badminton community and schedule matches with players nearby.
                </Typography>
              </Stack>
              {canCreateClub && (
                <Button
                  variant="contained"
                  color="inherit"
                  sx={{
                    alignSelf: "flex-start",
                    bgcolor: "common.white",
                    color: "success.dark",
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    fontSize: "0.95rem",
                    borderRadius: 999,
                    "&:hover": {
                      bgcolor: "grey.100",
                    },
                  }}
                  onClick={() => setCreateOpen(true)}
                >
                  Create a Club
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <EmojiEventsIcon />
            <Typography variant="h6" fontWeight={700}>
              {searchQuery.trim() ? "Search Results" : "Popular Clubs Near You"}
            </Typography>
          </Stack>
          <TextField
            placeholder="Search clubs near you"
            size="small"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                runSearch(searchQuery.trim());
              }
            }}
          />
          <Divider />
          {listLoading && (
            <Stack alignItems="center" sx={{ py: 3 }}>
              <CircularProgress size={28} />
            </Stack>
          )}
          {listError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={loadClubs}>
                  Retry
                </Button>
              }
            >
              {listError}
            </Alert>
          )}
          {listEmpty && (
            <Typography variant="body2" color="text.secondary">
              No clubs yet
            </Typography>
          )}
          {!listLoading && !listError && !listEmpty && (
            <Grid container spacing={3}>
              {clubCards}
            </Grid>
          )}
        </Stack>
      </Stack>
      <CreateClubModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(clubId) => {
          setCreateOpen(false);
          navigate(`/clubs/${clubId}`);
        }}
      />
    </Container>
  );
}

export default ClubsScreen;
