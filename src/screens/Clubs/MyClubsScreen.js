import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { fetchMyClubs } from "../../api/clubs";
import ClubCard from "../../components/ClubCard";

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

const getClubRole = (club) =>
  club?.role || club?.membership_role || club?.membership?.role || "";

function MyClubsScreen() {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.accessToken);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadClubs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await fetchMyClubs(token);
      const list = Array.isArray(payload) ? payload : payload?.clubs || payload?.items || [];
      setClubs(list);
    } catch (err) {
      setError(err.message || "Failed to load your clubs");
      setClubs([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadClubs();
  }, [loadClubs]);

  const clubCards = useMemo(
    () =>
      clubs.map((club) => {
        const clubId = getClubId(club);
        const visibility = getClubVisibility(club);
        const isPrivate = visibility === "private";
        const emblem = getClubEmblem(club);
        const role = getClubRole(club);
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
              role={role}
              onClick={() => clubId && navigate(`/clubs/${clubId}`)}
            />
          </Grid>
        );
      }),
    [clubs, navigate]
  );

  const empty = !loading && clubs.length === 0 && !error;

  return (
    <Container maxWidth="sm" sx={{ pb: 12, pt: 2 }}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/clubs")}
            size="small"
          >
            Back
          </Button>
        </Stack>
        <Typography variant="h5" fontWeight={800}>
          My Clubs
        </Typography>
        {loading && (
          <Stack alignItems="center" sx={{ py: 3 }}>
            <CircularProgress size={28} />
          </Stack>
        )}
        {error && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={loadClubs}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}
        {empty && (
          <Typography variant="body2" color="text.secondary">
            No clubs yet
          </Typography>
        )}
        {!loading && !error && !empty && <Grid container spacing={3}>{clubCards}</Grid>}
      </Stack>
    </Container>
  );
}

export default MyClubsScreen;
