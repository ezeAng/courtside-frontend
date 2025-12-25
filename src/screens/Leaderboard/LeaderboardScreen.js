import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Avatar from "@mui/material/Avatar";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import { alpha, useTheme } from "@mui/material/styles";

import GroupsIcon from "@mui/icons-material/Groups";
import ManIcon from "@mui/icons-material/Man";
import WomanIcon from "@mui/icons-material/Woman";

import LoadingSpinner from "../../components/LoadingSpinner";
import { normalizeProfileImage } from "../../utils/profileImage";
import {
  getOverallLeaderboard,
  getLeaderboard,
} from "../../services/api";
import { fetchCurrentUser } from "../../features/user/userSlice";

/* ----------------------------------------
   Tabs definition (single axis, explicit)
---------------------------------------- */

const leaderboardTabs = [
  { value: "overall", label: "Overall", icon: <GroupsIcon /> },
  { value: "male_singles", label: "Men • Singles", icon: <ManIcon /> },
  { value: "male_doubles", label: "Men • Doubles", icon: <ManIcon /> },
  { value: "female_singles", label: "Women • Singles", icon: <WomanIcon /> },
  { value: "female_doubles", label: "Women • Doubles", icon: <WomanIcon /> },
];

const tabSubtitleMap = {
  overall: "Overall rankings across all disciplines",
  male_singles: "Men • Singles",
  male_doubles: "Men • Doubles",
  female_singles: "Women • Singles",
  female_doubles: "Women • Doubles",
};

function LeaderboardScreen() {
  const dispatch = useDispatch();
  const theme = useTheme();

  const token = useSelector((state) => state.auth.accessToken);
  const currentUserId = useSelector((state) => state.user.user?.auth_id);

  const [activeTab, setActiveTab] = useState("overall");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  /* ----------------------------------------
     Labels
  ---------------------------------------- */

  const scoreLabel = useMemo(() => {
    if (activeTab === "overall") return "Overall Elo";
    return activeTab.includes("singles") ? "Singles Elo" : "Doubles Elo";
  }, [activeTab]);

  /* ----------------------------------------
     Load current user (once)
  ---------------------------------------- */

  useEffect(() => {
    if (!token || currentUserId) return;
    dispatch(fetchCurrentUser(token));
  }, [currentUserId, dispatch, token]);

  /* ----------------------------------------
     Load leaderboard data
  ---------------------------------------- */

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        let response;

        if (activeTab === "overall") {
          response = await getOverallLeaderboard(token);
        } else {
          const [gender, discipline] = activeTab.split("_");
          response = await getLeaderboard(gender, token, discipline);
        }

        const leaders = Array.isArray(response?.leaders)
          ? response.leaders
          : [];

        if (mounted) setData(leaders);
      } catch {
        if (mounted) setError("Unable to load leaderboard.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (token) load();
    return () => {
      mounted = false;
    };
  }, [activeTab, token]);

  /* ----------------------------------------
     Helpers
  ---------------------------------------- */

  const getRankForEntry = (entry, index) =>
    activeTab === "overall"
      ? entry?.overall_rank ?? entry?.rank ?? index + 1
      : entry?.rank ?? index + 1;

  const getEloForEntry = (entry) => {
    if (activeTab === "overall") return entry?.overall_elo ?? 0;
    if (activeTab.includes("singles")) return entry?.singles_elo ?? entry?.elo;
    return entry?.doubles_elo ?? entry?.elo;
  };

  const getSecondary = (entry) => {
    return entry.gender
  }
    

  /* ----------------------------------------
     Render
  ---------------------------------------- */

  return (
    <Container maxWidth="md" sx={{ py: 4, pb: 10 }}>
      <Stack spacing={3}>
        <Stack spacing={1} alignItems="center">
          <Typography variant="h5" fontWeight={700}>
            Leaderboards
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track competitive rankings across formats.
          </Typography>
        </Stack>

        {/* Tabs */}
        <Paper variant="outlined" sx={{ borderRadius: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => v && setActiveTab(v)}
            variant="scrollable"
            allowScrollButtonsMobile
          >
            {leaderboardTabs.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                icon={tab.icon}
                label={tab.label}
                iconPosition="top"
              />
            ))}
          </Tabs>

          <Divider />

          <Stack px={5} py={3} spacing={0.5}>
            <Typography variant="overline" color="text.secondary">
              TOP 100 PLAYERS ON COURTSIDE
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tabSubtitleMap[activeTab]}
            </Typography>
          </Stack>
        </Paper>

        {error && <Alert severity="error">{error}</Alert>}

        {/* Loading */}
        {loading ? (
          <Stack spacing={2}>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width={80}>Rank</TableCell>
                    <TableCell>Player</TableCell>
                    <TableCell align="right">{scoreLabel}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...Array(6)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton width={24} /></TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={2}>
                          <Skeleton variant="circular" width={40} height={40} />
                          <Skeleton width="60%" />
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Skeleton width={40} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <LoadingSpinner message="Loading leaderboard..." />
          </Stack>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width={80}>Rank</TableCell>
                  <TableCell>Player</TableCell>
                  <TableCell align="right">{scoreLabel}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((entry, index) => {
                  const rank = getRankForEntry(entry, index);
                  const primaryElo = getEloForEntry(entry);
                  const secondary = getSecondary(entry);

                  const isCurrentUser =
                    entry?.auth_id &&
                    currentUserId &&
                    String(entry.auth_id) === String(currentUserId);

                  return (
                    <TableRow
                      key={`${entry?.auth_id || "p"}-${index}`}
                      hover
                      sx={{
                        cursor: "pointer",
                        backgroundColor: isCurrentUser
                          ? alpha(theme.palette.primary.main, 0.08)
                          : undefined,
                      }}
                      onClick={() =>
                        setSelectedPlayer({
                          ...entry,
                          rank,
                          primaryElo,
                          secondary,
                        })
                      }
                    >
                      <TableCell align="center">
                        <Typography fontWeight={700}>{rank}</Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar src={normalizeProfileImage(entry?.profile_image_url)}>
                            {entry?.username?.charAt(0) || "P"}
                          </Avatar>
                          <Box>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography>{entry?.username}</Typography>
                              {isCurrentUser && (
                                <Chip label="You" size="small" color="primary" />
                              )}
                            </Stack>
                            {secondary && (
                              <Typography variant="body2" color="text.secondary">
                                {secondary}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={700}>{primaryElo}</Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {!data.length && !error && (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No entries yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>

      {/* Player dialog */}
      <Dialog
        open={Boolean(selectedPlayer)}
        onClose={() => setSelectedPlayer(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle align="center">Player Profile</DialogTitle>
        <DialogContent>
          {selectedPlayer && (
            <Stack spacing={2} alignItems="center" py={1}>
              <Avatar
                sx={{ width: 72, height: 72 }}
                src={normalizeProfileImage(selectedPlayer.profile_image_url)}
              >
                {selectedPlayer.username?.charAt(0) || "P"}
              </Avatar>

              <Typography variant="h6">{selectedPlayer.username}</Typography>

              <Stack direction="row" spacing={3}>
                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Rank
                  </Typography>
                  <Typography fontWeight={800}>{selectedPlayer.rank}</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Elo
                  </Typography>
                  <Typography fontWeight={800}>
                    {selectedPlayer.primaryElo}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default LeaderboardScreen;
