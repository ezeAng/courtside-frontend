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
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import { alpha, useTheme } from "@mui/material/styles";
import LoadingSpinner from "../../components/LoadingSpinner";
import { normalizeProfileImage } from "../../utils/profileImage";
import {
  getOverallLeaderboard,
  getSinglesLeaderboard,
  getDoublesLeaderboard,
} from "../../services/api";
import { fetchCurrentUser } from "../../features/user/userSlice";

const tabs = ["overall", "singles", "doubles"];

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

  const scoreLabel = useMemo(() => {
    if (activeTab === "overall") return "Overall Elo";
    if (activeTab === "singles") return "Singles Elo";
    return "Doubles Elo";
  }, [activeTab]);

  useEffect(() => {
    if (!token || currentUserId) return;
    dispatch(fetchCurrentUser(token));
  }, [currentUserId, dispatch, token]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        let response;
        if (activeTab === "overall") {
          response = await getOverallLeaderboard(token);
        } else if (activeTab === "singles") {
          response = await getSinglesLeaderboard(token);
        } else {
          response = await getDoublesLeaderboard(token);
        }

        const leaders = Array.isArray(response?.leaders)
          ? response.leaders
          : Array.isArray(response)
            ? response
            : [];

        if (mounted) {
          setData(leaders);
        }
      } catch (err) {
        if (mounted) {
          setError("Unable to load leaderboard.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [activeTab, token]);

  const getRankForEntry = (entry, index) =>
    activeTab === "overall"
      ? entry?.overall_rank ?? entry?.rank ?? index + 1
      : entry?.rank ?? index + 1;

  const getEloForEntry = (entry) => {
    if (activeTab === "overall") return entry?.overall_elo ?? entry?.elo;
    if (activeTab === "singles") return entry?.singles_elo ?? entry?.elo;
    return entry?.doubles_elo ?? entry?.elo;
  };

  const getSecondary = (entry) =>
    activeTab === "overall"
      ? `S: ${entry?.singles_elo ?? "--"} • D: ${entry?.doubles_elo ?? "--"}`
      : null;

  return (
    <Container maxWidth="md" sx={{ py: 4, pb: 10 }}>
      <Stack spacing={3}>
        <Stack spacing={1} alignItems="center">
          <Typography variant="h5" fontWeight={700} textAlign="center">
            Leaderboards
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Track overall, singles, and doubles rankings.
          </Typography>
        </Stack>

        <Paper variant="outlined" sx={{ borderRadius: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, value) => value && setActiveTab(value)}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            sx={{
              minHeight: 48,
              "& .MuiTabs-flexContainer": {
                alignItems: "stretch",
              },
            }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab}
                value={tab}
                icon={<LeaderboardIcon fontSize="small" />}
                iconPosition="top"
                label={tab.charAt(0).toUpperCase() + tab.slice(1)}
                sx={{
                  minWidth: 15,
                  minHeight: 90,
                  padding: "6px 4px",
                  fontSize: "0.65rem",
                  lineHeight: 1.1,
                  fontWeight: 600,
                  "& .MuiTab-iconWrapper": {
                    marginBottom: "2px",
                    "& svg": {
                      fontSize: 18,
                    },
                  },
                }}
              />
            ))}
          </Tabs>

          <Divider />
          <Stack px={3} py={2} spacing={0.5}>
            <Typography variant="overline" color="text.secondary">
              TOP 100 PLAYERS ON COURTSIDE
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Explore rankings for the selected mode.
            </Typography>
          </Stack>
        </Paper>

        {error && <Alert severity="error">{error}</Alert>}

        {loading ? (
          <Stack spacing={2}>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 80, fontWeight: 700 }}>Rank</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Player</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {scoreLabel}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...Array(6)].map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Skeleton width={24} />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Skeleton variant="circular" width={40} height={40} />
                          <Box flex={1}>
                            <Skeleton width="70%" />
                            <Skeleton width="50%" />
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Skeleton width={40} sx={{ ml: "auto" }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <LoadingSpinner message="Loading leaderboard..." />
          </Stack>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 80, fontWeight: 700 }}>Rank</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Player</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {scoreLabel}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((entry, index) => {
                    const rank = getRankForEntry(entry, index);
                    const primaryElo = getEloForEntry(entry) ?? "—";
                    const secondary = getSecondary(entry);
                    const isCurrentUser =
                      entry?.auth_id &&
                      currentUserId &&
                      String(entry.auth_id) === String(currentUserId);

                    return (
                      <TableRow
                        key={entry?.id || `${entry?.username || "player"}-${index}`}
                        hover
                        onClick={() =>
                          setSelectedPlayer({
                            ...entry,
                            rank,
                            primaryElo,
                            secondary,
                            tab: activeTab,
                          })
                        }
                        sx={{
                          cursor: "pointer",
                          backgroundColor: isCurrentUser
                            ? alpha(theme.palette.primary.main, 0.08)
                            : undefined,
                          "&:hover": {
                            backgroundColor: isCurrentUser
                              ? alpha(theme.palette.primary.main, 0.12)
                              : undefined,
                          },
                        }}
                      >
                        <TableCell>
                          <Typography fontWeight={700}>{rank}</Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar
                              src={normalizeProfileImage(entry?.profile_image_url)}
                              imgProps={{ referrerPolicy: "no-referrer" }}
                            >
                              {entry?.username?.charAt(0).toUpperCase() || "P"}
                            </Avatar>
                            <Box>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography fontWeight={700}>{entry?.username}</Typography>
                                {isCurrentUser && <Chip label="You" size="small" color="primary" />}
                              </Stack>
                              {secondary ? (
                                <Typography variant="body2" color="text.secondary">
                                  {secondary}
                                </Typography>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  Player
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
                      <Typography color="text.secondary">No entries yet.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>

      <Dialog
        open={Boolean(selectedPlayer)}
        onClose={() => setSelectedPlayer(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Player Profile</DialogTitle>
        <DialogContent>
          {selectedPlayer && (
            <Stack spacing={2} alignItems="center" py={1}>
              <Avatar
                sx={{ width: 72, height: 72 }}
                src={normalizeProfileImage(selectedPlayer.profile_image_url)}
                imgProps={{ referrerPolicy: "no-referrer" }}
              >
                {selectedPlayer.username?.charAt(0).toUpperCase() || "P"}
              </Avatar>
              <Stack spacing={0.5} alignItems="center">
                <Typography variant="h6" fontWeight={800}>
                  {selectedPlayer.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedPlayer.secondary || "Player"}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
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
                  <Typography fontWeight={800}>{selectedPlayer.primaryElo ?? "—"}</Typography>
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
