import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getH2H, getHomeStats, getRecentActivity } from "../../services/api";
import { fetchCurrentUser } from "../../features/user/userSlice";
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

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={3} alignItems="stretch">
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Overview
            </Typography>
            {loading && !stats && (
              <Typography color="text.secondary">Loading stats...</Typography>
            )}
            {!loading && !stats && (
              <Typography color="text.secondary">No stats available.</Typography>
            )}
            {stats && (
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Box flex={1} minWidth={120}>
                    <Typography color="text.secondary" variant="body2">
                      Current ELO
                    </Typography>
                    <Typography variant="h6">{stats.current_elo}</Typography>
                  </Box>
                  <Box flex={1} minWidth={120}>
                    <Typography color="text.secondary" variant="body2">
                      Rank
                    </Typography>
                    <Typography variant="h6">#{stats.rank}</Typography>
                  </Box>
                  <Box flex={1} minWidth={120}>
                    <Typography color="text.secondary" variant="body2">
                      Record
                    </Typography>
                    <Typography variant="h6">
                      {stats.wins ?? 0}W - {stats.losses ?? 0}L
                    </Typography>
                    {overallWinRate !== null && (
                      <Typography color="text.secondary" variant="body2">
                        {overallWinRate}% win rate overall
                      </Typography>
                    )}
                  </Box>
                  <Box flex={1} minWidth={120}>
                    <Typography color="text.secondary" variant="body2">
                      Total Matches
                    </Typography>
                    <Typography variant="h6">{totalMatches}</Typography>
                    {totalMatches > 0 && (
                      <Typography color="text.secondary" variant="body2">
                        Win Rate (Last 10): {winRateLast10}%
                      </Typography>
                    )}
                  </Box>
                </Stack>

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
                      stats.activity_streak?.is_active_this_week ? "success" : "default"
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

        <EloStockChart onRecordMatch={handleRecordMatch} />

        {/* <Card variant="outlined">
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={700}>
                Recent Activity
              </Typography>
              {loading && (
                <Typography color="text.secondary" variant="body2">
                  Loading...
                </Typography>
              )}
            </Stack>
            {error && (
              <Typography color="error" variant="body2" mt={1}>
                {error}
              </Typography>
            )}
            {!loading && !error && recentMatches.length === 0 && (
              <Typography color="text.secondary" mt={2}>
                No recent matches yet.
              </Typography>
            )}
            <Stack spacing={2} mt={2}>
              {recentMatches.map((match, index) => (
                <Box
                  key={
                    match.match_id ||
                    `${match.winner_username}-${match.loser_username}-${match.created_at}-${index}`
                  }
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {match.winner_username} vs {match.loser_username}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        {match.gender} · {match.category}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        {formatDate(match.created_at)}
                      </Typography>
                    </Box>
                    <Chip
                      label={match.scores}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card> */}

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
            <Stack spacing={2}>
              {topRivals.map((rival, index) => {
                const totalMatches = (rival?.wins || 0) + (rival?.losses || 0);
                return (
                  <Box
                    key={
                      rival.opponent_auth_id ||
                      `${rival.opponent_username || "rival"}-${index}`
                    }
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      p: 2,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {rival.opponent_username}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          {totalMatches} matches
                        </Typography>
                      </Box>
                      <Chip
                        label={`W ${rival.wins} - L ${rival.losses}`}
                        color="secondary"
                        variant="outlined"
                        size="small"
                      />
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}

export default HomeScreen;
