import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getH2H, getHomeStats, getRecentActivity } from "../../services/api";
import { fetchCurrentUser } from "../../features/user/userSlice";
import EloStockChart from "../../components/home/EloStockChart";
import ProfileAvatar from "../../components/ProfileAvatar";
import { normalizeProfileImage } from "../../utils/profileImage";
import Avatar from "@mui/material/Avatar";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getEloForMode } from "../../utils/elo";
import { getOverallRank } from "../../services/statsApi";
import { setEloMode } from "../../features/ui/uiSlice";

function HomeScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { user } = useSelector((state) => state.user);
  const token = useSelector((state) => state.auth.accessToken);
  const eloMode = useSelector((state) => state.ui.eloMode || "overall");
  const [recentMatches, setRecentMatches] = useState([]);
  const [rivals, setRivals] = useState([]);
  const [stats, setStats] = useState(null);
  const [overall, setOverall] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const handleSelectEloMode = useCallback(
    (mode) => dispatch(setEloMode(mode)),
    [dispatch]
  );

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [recent, rivalsData, statsData, overallRank] = await Promise.all([
          getRecentActivity(token),
          getH2H(token),
          getHomeStats(token),
          getOverallRank(token),
        ]);
        setRecentMatches(recent?.matches || []);
        setRivals(rivalsData?.rivals || []);
        setStats(statsData?.stats || null);
        setOverall(overallRank || null);
      } catch (err) {
        setError("Unable to load stats. Pull to refresh.");
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

  const overallEloValue = useMemo(
    () =>
      overall?.overall_elo ?? stats?.overall?.elo ?? stats?.overall_elo ?? null,
    [overall, stats]
  );

  const overallRankValue = useMemo(
    () =>
      overall?.overall_rank ?? stats?.overall?.rank ?? stats?.overall_rank ?? null,
    [overall, stats]
  );

  const singlesEloValue = useMemo(
    () =>
      stats?.singles_elo ?? stats?.singlesElo ?? stats?.singles?.elo ??
      getEloForMode(user, "singles", { fallback: null }),
    [stats, user]
  );

  const doublesEloValue = useMemo(
    () =>
      stats?.doubles_elo ?? stats?.doublesElo ?? stats?.doubles?.elo ??
      getEloForMode(user, "doubles", { fallback: null }),
    [stats, user]
  );

  const singlesMatchesPlayed = useMemo(
    () =>
      stats?.singles_matches_played ??
      stats?.singlesMatchesPlayed ??
      stats?.singles?.matches_played ??
      0,
    [stats]
  );

  const doublesMatchesPlayed = useMemo(
    () =>
      stats?.doubles_matches_played ??
      stats?.doublesMatchesPlayed ??
      stats?.doubles?.matches_played ??
      0,
    [stats]
  );

  const currentElo = useMemo(
    () =>
      getEloForMode(user, eloMode, {
        fallback: stats?.current_elo ?? stats?.currentElo ?? 1000,
      }),
    [eloMode, stats?.currentElo, stats?.current_elo, user]
  );

  const tier = useMemo(() => {
    if (currentElo === undefined || currentElo === null) {
      return null;
    }

    if (currentElo < 800) return { label: "Wood", color: "default" };
    if (currentElo < 1000) return { label: "Bronze", color: "warning" };
    if (currentElo < 1200) return { label: "Silver", color: "info" };
    if (currentElo < 1400) return { label: "Gold", color: "warning" };
    if (currentElo < 1600) return { label: "Platinum", color: "primary" };
    return { label: "Diamond", color: "success" };
  }, [currentElo]);

  const topRivals = useMemo(() => {
    return [...rivals]
      .sort((a, b) => b.wins + b.losses - (a.wins + a.losses))
      .slice(0, 5);
  }, [rivals]);

  const formatRelativeDate = (dateString) => {
    if (!dateString) return "";
    const created = new Date(dateString).getTime();
    const diffDays = Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "1d";
    return `${diffDays}d`;
  };

  const handleRecordMatch = () => {
    navigate("/matches");
  };

  const handleViewLeaderboard = () => {
    navigate("/leaderboard");
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

  const heroStatsLoading = loading && (!stats || (!overall && !overallEloValue));

  const topHeroStats = useMemo(
    () => [
      overallEloValue !== null && overallEloValue !== undefined
        ? {
            label: "Overall Elo",
            value: (
              <Stack spacing={0.25} alignItems="center">
                <Typography variant="h5" fontWeight={800} lineHeight={1}>
                  {overallEloValue}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Rank #{overallRankValue ?? "--"}
                </Typography>
              </Stack>
            ),
            onClick: () => handleSelectEloMode("overall"),
          }
        : {
            label: "Overall Elo",
            value: (
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Play 5 matches to unlock overall Elo
              </Typography>
            ),
            onClick: () => handleSelectEloMode("overall"),
          },
      {
        label: "Singles Elo",
        value: singlesEloValue ?? "--",
        onClick: () => handleSelectEloMode("singles"),
      },
      {
        label: "Doubles Elo",
        value: doublesEloValue ?? "--",
        onClick: () => handleSelectEloMode("doubles"),
      },
    ],
    [doublesEloValue, handleSelectEloMode, overallEloValue, overallRankValue, singlesEloValue]
  );

  return (
    <Container
      maxWidth="sm"
    >
      <Stack spacing={3}>
        {loading && (
          <LoadingSpinner message="Refreshing your Courtside insights..." inline />
        )}
        {error && !loading && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
        {/* FULL-WIDTH HERO */}
        <Box sx={{ position: "relative" }}>
          <Box
            sx={{
              height: "40vh",
              minHeight: 280,
              backgroundImage: `url(${normalizeProfileImage(
                user?.profile_image_url
              )})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
              display: "flex",
              alignItems: "flex-end",
              px: { xs: 2.5, sm: 4 },
              pb: 10,
              borderRadius: { xs: theme.shape.borderRadius, sm: theme.shape.borderRadius * 1.25 },
              overflow: "hidden",
            }}
          >
            {/* Bottom fade gradient */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  `linear-gradient(to bottom, ${alpha(
                    theme.palette.common.black,
                    0.1
                  )} 0%, ${alpha(theme.palette.common.black, 0.35)} 60%, ${
                    theme.palette.background.paper
                  } 100%)`,
              }}
            />

            {/* Profile identity */}
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ position: "relative", zIndex: 2 }}
            >
              {user ? (
                <ProfileAvatar
                  user={user}
                  size={96}
                  sx={{
                    bgcolor: theme.palette.background.paper,
                    color: "text.primary",
                    boxShadow: theme.custom?.colors?.shadows?.sm,
                    border: `2px solid ${alpha(theme.palette.common.white, 0.85)}`,
                  }}
                />
              ) : (
                <Skeleton variant="circular" width={96} height={96} />
              )}

              <Box>
                {user ? (
                  <>
                    <Typography variant="h5" fontWeight={800} color={alpha(theme.palette.common.white, 0.94)}>
                      {user?.username || "Player"}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, color: alpha(theme.palette.common.white, 0.92) }}>
                      Badminton
                    </Typography>
                  </>
                ) : (
                  <>
                    <Skeleton variant="text" width={140} sx={{ bgcolor: "rgba(255,255,255,0.5)" }} />
                    <Skeleton variant="text" width={90} sx={{ bgcolor: "rgba(255,255,255,0.4)" }} />
                  </>
                )}
                {tier && (
                  <Chip
                    label={tier.label}
                    color={tier.color}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
            </Stack>
          </Box>

        {/* FLOATING STAT CARDS */}
        <Container maxWidth="sm" sx={{ position: "relative", mt: -6, pb: 2 }}>
          <Grid container spacing={2} paddingLeft={1}>
            {(heroStatsLoading ? [...Array(3)] : topHeroStats).map((item, idx) => (
              <Card
                key={item?.label || idx}
                sx={{
                  margin: "auto",
                  width: "30%",
                  borderRadius: theme.shape.borderRadius,
                  textAlign: "center",
                  boxShadow: theme.custom?.colors?.shadows?.sm,
                  cursor: item?.onClick ? "pointer" : "default",
                }}
                onClick={item?.onClick}
              >
                <CardContent sx={{ py: 2 }}>
                  {heroStatsLoading ? (
                    <Stack spacing={1} alignItems="center">
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="50%" />
                    </Stack>
                  ) : (
                    <Stack spacing={1} alignItems="center">
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ letterSpacing: 0.5 }}
                      >
                        {item.label}
                      </Typography>
                      {typeof item.value === "string" || typeof item.value === "number" ? (
                        <Typography variant="h5" fontWeight={800}>
                          {item.value}
                        </Typography>
                      ) : (
                        item.value
                      )}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            ))}
          </Grid>
        </Container>
      </Box>

        <Stack direction="row" justifyContent="flex-end">
          <Button variant="outlined" size="small" onClick={handleViewLeaderboard}>
            View Leaderboard
          </Button>
        </Stack>


        <Card variant="outlined" sx={{ height: "100%" }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Performance snapshot
            </Typography>
            {loading && !stats && (
              <Stack spacing={2}>
                {[...Array(2)].map((_, idx) => (
                  <Grid container spacing={2} key={idx}>
                    <Grid item xs={6}>
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="50%" />
                      <Skeleton variant="text" width="70%" />
                    </Grid>
                    <Grid item xs={6}>
                      <Skeleton variant="text" width="55%" />
                      <Skeleton variant="text" width="40%" />
                      <Skeleton variant="text" width="70%" />
                    </Grid>
                  </Grid>
                ))}
                <Stack spacing={1}>
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="rounded" height={12} />
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Skeleton variant="text" width="30%" />
                  <Skeleton variant="rounded" height={28} width={90} />
                  <Skeleton variant="rounded" height={28} width={70} />
                </Stack>
              </Stack>
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

                <Divider />
                <Typography variant="subtitle2" fontWeight={700}>
                  Mode breakdown
                </Typography>
                <Grid container spacing={2}>
                  <Grid
                    item
                    xs={6}
                    onClick={() => handleSelectEloMode("singles")}
                    sx={{ cursor: "pointer" }}
                  >
                    <Typography color="text.secondary" variant="body2">
                      Singles
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {singlesEloValue ?? "--"}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      {singlesMatchesPlayed} matches played
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={6}
                    onClick={() => handleSelectEloMode("doubles")}
                    sx={{ cursor: "pointer" }}
                  >
                    <Typography color="text.secondary" variant="body2">
                      Doubles
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {doublesEloValue ?? "--"}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      {doublesMatchesPlayed} matches played
                    </Typography>
                  </Grid>
                </Grid>
              </Stack>
            )}
          </CardContent>
        </Card>

        <EloStockChart onRecordMatch={handleRecordMatch} overallElo={overallEloValue} />
        
        {/* Recent Matches */}
        {/* <Card variant="outlined" width="100%">
          <CardContent>
            <Stack spacing={2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
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
                <Stack divider={<Divider flexItem />} spacing={1.5} mt={0.5}>
                  {recentMatches.map((match, index) => {
                    const isWinner = match.winner_username === user?.username;
                    const resultLabel = isWinner ? "W" : "L";
                    const opponent = isWinner
                      ? match.loser_username || "Opponent"
                      : match.winner_username || "Opponent";
                    const key =
                      match.match_id ||
                      `${match.winner_username}-${match.loser_username}-${match.created_at}-${index}`;
                    return (
                      <Stack
                        key={key}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={2}
                        sx={{ py: 0.5 }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
                          <Avatar sx={{ width: 44, height: 44 }}>
                            {opponent?.slice(0, 1)?.toUpperCase() || "?"}
                          </Avatar>
                          <Box minWidth={0}>
                            <Typography fontWeight={700} noWrap>
                              {opponent}
                            </Typography>
                            <Typography color="text.secondary" variant="body2" noWrap>
                              {match.gender} · {match.category}
                            </Typography>
                          </Box>
                        </Stack>
                        <Stack spacing={0.5} alignItems="flex-end">
                          <Box
                            sx={{
                              px: 1.5,
                              py: 0.25,
                              borderRadius: 2,
                              fontWeight: 800,
                              letterSpacing: 0.5,
                              color: isWinner ? "success.dark" : "error.dark",
                              backgroundColor: isWinner
                                ? "rgba(34,197,94,0.14)"
                                : "rgba(239,68,68,0.14)",
                            }}
                          >
                            {resultLabel}
                          </Box>
                          <Typography variant="body2" fontWeight={700}>
                            {match.scores || "-"}
                          </Typography>
                          <Typography color="text.secondary" variant="caption">
                            {formatRelativeDate(match.created_at)}
                          </Typography>
                        </Stack>
                      </Stack>
                    );
                  })}
                </Stack>
              )}
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
              {topRivals.length > 0 && (
                <Stack divider={<Divider flexItem />} spacing={1}>
                  {topRivals.map((rival, index) => {
                    const totalMatches = (rival?.wins || 0) + (rival?.losses || 0);
                    const winRate = totalMatches
                      ? Math.round((rival.wins / totalMatches) * 100)
                      : 0;
                    const key =
                      rival.opponent_auth_id ||
                      `${rival.opponent_username || "rival"}-${index}`;
                    return (
                      <Stack
                        key={key}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={2}
                        sx={{ py: 0.5 }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
                          <Avatar sx={{ width: 40, height: 40 }}>
                            {rival.opponent_username?.slice(0, 1)?.toUpperCase() || "?"}
                          </Avatar>
                          <Box minWidth={0}>
                            <Typography fontWeight={700} noWrap>
                              {rival.opponent_username}
                            </Typography>
                            <Typography color="text.secondary" variant="body2">
                              {totalMatches} matches
                            </Typography>
                          </Box>
                        </Stack>
                        <Stack spacing={0.5} alignItems="flex-end">
                          <Chip
                            label={`W ${rival.wins} - L ${rival.losses}`}
                            color="secondary"
                            size="small"
                            variant="outlined"
                          />
                          <Typography color="text.secondary" variant="body2">
                            {winRate}% win rate
                          </Typography>
                        </Stack>
                      </Stack>
                    );
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>
        
      </Stack>
    </Container>
  );
}

export default HomeScreen;
