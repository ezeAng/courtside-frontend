import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getH2H, getHomeStats, getRecentActivity } from "../../services/api";
import { fetchCurrentUser } from "../../features/user/userSlice";
import { AVATARS } from "../../constants/avatars";
import EloStockChart from "../../components/home/EloStockChart";

function HomeScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const token = useSelector((state) => state.auth.accessToken);
  const [recentMatches, setRecentMatches] = useState([]);
  const [rivals, setRivals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [recent, rivalsData, statsData] = await Promise.all([
          getRecentActivity(token),
          getH2H(token),
          getHomeStats(token),
        ]);
        setRecentMatches(recent?.matches || []);
        setRivals(rivalsData?.rivals || []);
        setStats(statsData?.stats || null);
      } catch (err) {
        setError(err.message || "Failed to load activity");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      load();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser(token));
    }
  }, [dispatch, token]);

  const tier = useMemo(() => {
    if (user?.elo === undefined || user?.elo === null) {
      return null;
    }

    if (user.elo < 800) return { label: "Wood", color: "default" };
    if (user.elo < 1000) return { label: "Bronze", color: "warning" };
    if (user.elo < 1200) return { label: "Silver", color: "info" };
    if (user.elo < 1400) return { label: "Gold", color: "warning" };
    if (user.elo < 1600) return { label: "Platinum", color: "primary" };
    return { label: "Diamond", color: "success" };
  }, [user]);

  const topRivals = useMemo(() => {
    return [...rivals]
      .sort((a, b) => b.wins + b.losses - (a.wins + a.losses))
      .slice(0, 5);
  }, [rivals]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString();
  };

  const handleRecordMatch = () => {
    navigate("/matches");
  };

  const totalMatches = useMemo(() => {
    if (!stats) return 0;
    return stats.total_matches || stats.totalMatches || 0;
  }, [stats]);

  const overallWinRate = useMemo(() => {
    if (!stats) return null;
    const wins = stats.wins ?? 0;
    const losses = stats.losses ?? 0;
    const total = wins + losses;
    if (!total) return null;
    return Math.round((wins / total) * 100);
  }, [stats]);

  const winRateLast10 = useMemo(() => {
    if (!stats) return 0;
    return Math.round(stats.win_rate_last_10 ?? 0);
  }, [stats]);

  const selectedAvatar = useMemo(() => {
    if (user?.avatar === undefined || user?.avatar === null) return "";
    return AVATARS[user.avatar] || "";
  }, [user]);

  const initials = useMemo(() => {
    if (!user?.username) return "";
    return user.username
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  const heroBackground = useMemo(() => {
    if (user?.profile_image_url) {
      return `linear-gradient(135deg, rgba(0,0,0,0.55), rgba(0,0,0,0.2)), url(${user.profile_image_url})`;
    }
    return "linear-gradient(135deg, #0f172a, #1d4ed8)";
  }, [user]);

  const topHeroStats = useMemo(
    () => [
      {
        label: "Rank",
        value:
          stats?.rank !== undefined && stats?.rank !== null
            ? `#${stats.rank}`
            : "--",
      },
      {
        label: "Current Elo",
        value: stats?.current_elo ?? "--",
      },
      {
        label: "Win rate",
        value:
          overallWinRate !== null && overallWinRate !== undefined
            ? `${overallWinRate}%`
            : "--",
      },
    ],
    [overallWinRate, stats]
  );

  return (
    <Container maxWidth="md" sx={{ py: 4, pb: 8 }}>
      <Box sx={{ position: "relative", mb: 8 }}>
        <Card
          sx={{
            position: "relative",
            overflow: "hidden",
            minHeight: 220,
            borderRadius: 4,
            backgroundImage: heroBackground,
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: "common.white",
            boxShadow: 6,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.75) 100%)",
            }}
          />
          <CardContent sx={{ position: "relative", zIndex: 1 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={3}
              alignItems={{ xs: "flex-start", sm: "center" }}
            >
              <Avatar
                sx={{
                  width: 88,
                  height: 88,
                  fontSize: 40,
                  bgcolor: "rgba(255,255,255,0.15)",
                  color: "common.white",
                  border: "2px solid rgba(255,255,255,0.35)",
                  backdropFilter: "blur(6px)",
                }}
              >
                {selectedAvatar || initials || (user?.username || "?")[0] || "?"}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={800} gutterBottom>
                  {user?.username || "Player"}
                </Typography>
                <Typography color="rgba(255,255,255,0.8)" variant="body2">
                  {user?.bio || user?.region || "Your personalized player dashboard"}
                </Typography>
                {tier && (
                  <Chip
                    label={`${tier.label} tier`}
                    color={tier.color}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -40,
            zIndex: 2,
          }}
        >
          {topHeroStats.map((item) => (
            <Card
              key={item.label}
              sx={{
                flex: 1,
                boxShadow: 4,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
              variant="outlined"
            >
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  {item.label}
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>

      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Performance snapshot
              </Typography>
              {loading && !stats && (
                <Typography color="text.secondary">Loading stats...</Typography>
              )}
              {!loading && !stats && (
                <Typography color="text.secondary">No stats available.</Typography>
              )}
              {stats && (
                <Stack spacing={3}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography color="text.secondary" variant="body2">
                        Record
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {stats.wins ?? 0}W - {stats.losses ?? 0}L
                      </Typography>
                      {overallWinRate !== null && (
                        <Typography color="text.secondary" variant="body2">
                          {overallWinRate}% win rate overall
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={6}>
                      <Typography color="text.secondary" variant="body2">
                        Total Matches
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {totalMatches}
                      </Typography>
                      {totalMatches > 0 && (
                        <Typography color="text.secondary" variant="body2">
                          Last 10: {winRateLast10}% wins
                        </Typography>
                      )}
                    </Grid>
                  </Grid>

                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Typography color="text.secondary">Weekly activity</Typography>
                      <Chip
                        label={`${stats.weekly_activity?.matches_this_week || 0}/${
                          stats.weekly_activity?.weekly_target || 0
                        } matches`}
                        size="small"
                      />
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(
                        stats.weekly_activity?.progress_pct || 0,
                        100
                      )}
                    />
                  </Stack>

                  <Stack direction="row" alignItems="center" gap={1}>
                    <Typography color="text.secondary">Activity streak:</Typography>
                    <Chip
                      label={`${stats.activity_streak?.current_streak_weeks || 0} weeks`}
                      color={
                        stats.activity_streak?.is_active_this_week
                          ? "success"
                          : "default"
                      }
                      size="small"
                    />
                    {tier && (
                      <Chip label={tier.label} color={tier.color} size="small" />
                    )}
                  </Stack>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <EloStockChart onRecordMatch={handleRecordMatch} />
        </Grid>

        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Typography variant="h6" fontWeight={700}>
                  Recent matches
                </Typography>
                {loading && (
                  <Typography color="text.secondary" variant="body2">
                    Loading...
                  </Typography>
                )}
              </Stack>
              {error && (
                <Typography color="error" variant="body2" mb={1}>
                  {error}
                </Typography>
              )}
              {!loading && !error && recentMatches.length === 0 && (
                <Typography color="text.secondary">
                  No recent matches yet.
                </Typography>
              )}
              {recentMatches.length > 0 && (
                <Table size="small" sx={{ mt: 1 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Match</TableCell>
                      <TableCell>Result</TableCell>
                      <TableCell align="right">Score</TableCell>
                      <TableCell align="right">Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentMatches.map((match, index) => {
                      const isWinner = match.winner_username === user?.username;
                      const resultLabel = isWinner ? "W" : "L";
                      const key =
                        match.match_id ||
                        `${match.winner_username}-${match.loser_username}-${match.created_at}-${index}`;
                      return (
                        <TableRow key={key} hover>
                          <TableCell>
                            <Typography fontWeight={600}>
                              {match.winner_username} vs {match.loser_username}
                            </Typography>
                            <Typography color="text.secondary" variant="body2">
                              {match.gender} · {match.category}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={resultLabel}
                              size="small"
                              color={isWinner ? "success" : "error"}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Chip label={match.scores || "-"} size="small" />
                          </TableCell>
                          <TableCell align="right">
                            <Typography color="text.secondary" variant="body2">
                              {formatDate(match.created_at)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                H2H Rivals
              </Typography>
              {error && (
                <Typography color="error" variant="body2" mb={1}>
                  {error}
                </Typography>
              )}
              {!loading && !error && topRivals.length === 0 && (
                <Typography color="text.secondary">
                  No head-to-head data yet.
                </Typography>
              )}
              {topRivals.length > 0 && (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Opponent</TableCell>
                      <TableCell>Record</TableCell>
                      <TableCell align="right">Win rate</TableCell>
                      <TableCell align="right">Matches</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topRivals.map((rival, index) => {
                      const totalMatches = (rival?.wins || 0) + (rival?.losses || 0);
                      const winRate = totalMatches
                        ? Math.round((rival.wins / totalMatches) * 100)
                        : 0;
                      const key =
                        rival.opponent_auth_id ||
                        `${rival.opponent_username || "rival"}-${index}`;
                      return (
                        <TableRow key={key} hover>
                          <TableCell>
                            <Typography fontWeight={600}>
                              {rival.opponent_username}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`W ${rival.wins} - L ${rival.losses}`}
                              color="secondary"
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography color="text.secondary" variant="body2">
                              {winRate}%
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography color="text.secondary" variant="body2">
                              {totalMatches}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default HomeScreen;
