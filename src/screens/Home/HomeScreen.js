import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AVATARS } from "../../constants/avatars";
import { getH2H, getHomeStats, getRecentActivity } from "../../services/api";
import PlayerCardModal from "../../components/PlayerCardModal";
import { fetchCurrentUser } from "../../features/user/userSlice";
import EloStockChart from "../../components/EloStockChart";

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
  const [showCard, setShowCard] = useState(false);

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

  const avatarIcon = useMemo(() => {
    if (user?.avatar === undefined || user?.avatar === null) {
      return "";
    }
    return AVATARS[user.avatar] || "";
  }, [user]);

  const initials = useMemo(() => {
    if (user?.username) {
      return user.username
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    return "";
  }, [user]);

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

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={3} alignItems="stretch">
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2} alignItems="center" textAlign="center">
              <Typography variant="h5" fontWeight={700} textAlign="center">
                Profile
              </Typography>
              <Avatar sx={{ width: 72, height: 72, fontSize: 32 }}>
                {avatarIcon || initials}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {user?.username || "Loading user..."}
                </Typography>
                <Typography color="text.secondary">
                  {user?.gender ? `Gender: ${user.gender}` : ""}
                </Typography>
                <Typography color="text.secondary">
                  {user?.elo ? `Elo rating: ${user.elo}` : ""}
                </Typography>
                {tier && (
                  <Stack direction="row" spacing={1} justifyContent="center" mt={1}>
                    <Typography color="text.secondary">Tier:</Typography>
                    <Chip label={tier.label} color={tier.color} size="small" />
                  </Stack>
                )}
              </Box>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => setShowCard(true)}
              >
                View Player Card
              </Button>
            </Stack>
          </CardContent>
        </Card>

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
              <Stack spacing={1}>
                <Typography>ELO: {stats.current_elo}</Typography>
                <Typography>Rank: #{stats.rank}</Typography>
                {/* <Typography>Matches this week: {stats.matches_this_week}</Typography> */}
                <Typography>
                  Win Rate (Last 10): {Math.round(stats.win_rate_last_10)}%
                </Typography>
              </Stack>
            )}
          </CardContent>
        </Card>

        <EloStockChart token={token} onRecordMatch={handleRecordMatch} />

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
                  key=
                    {match.match_id ||
                    `${match.winner_username}-${match.loser_username}-${match.created_at}-${index}`}
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

        
        {showCard && (
          <PlayerCardModal token={token} onClose={() => setShowCard(false)} />
        )}
      </Stack>
    </Container>
  );
}

export default HomeScreen;
