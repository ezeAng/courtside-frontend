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
import Divider from "@mui/material/Divider";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import ManIcon from "@mui/icons-material/Man";
import WomanIcon from "@mui/icons-material/Woman";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import { setGender, fetchLeaderboard } from "../../features/leaderboard/leaderboardSlice";
import { normalizeProfileImage } from "../../utils/profileImage";
import LoadingSpinner from "../../components/LoadingSpinner";

function LeaderboardScreen() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.leaderboard);

  const [category, setCategory] = useState("overall");
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const categories = useMemo(
    () => [
      {
        value: "overall",
        label: "Overall",
        icon: <LeaderboardIcon fontSize="small" />,
        gender: "mixed",
        helper: "Top players across all match types",
      },
      {
        value: "menSingles",
        label: "Men's Singles",
        icon: <ManIcon fontSize="small" />,
        gender: "male",
        helper: "Single matches for men",
      },
      {
        value: "womenSingles",
        label: "Women's Singles",
        icon: <WomanIcon fontSize="small" />,
        gender: "female",
        helper: "Single matches for women",
      },
      {
        value: "menDoubles",
        label: "Men's Doubles",
        icon: <PeopleAltIcon fontSize="small" />,
        gender: "male",
        helper: "Doubles play for men",
      },
      {
        value: "womenDoubles",
        label: "Women's Doubles",
        icon: <PeopleAltIcon fontSize="small" />,
        gender: "female",
        helper: "Doubles play for women",
      },
    ],
    []
  );

  const activeCategory = useMemo(
    () => categories.find((item) => item.value === category) || categories[0],
    [categories, category]
  );

  useEffect(() => {
    dispatch(fetchLeaderboard(activeCategory.gender));
  }, [dispatch, activeCategory]);

  const handleCategoryChange = (_event, newValue) => {
    if (!newValue) return;
    const newCategory = categories.find((item) => item.value === newValue);
    if (newCategory) {
      setCategory(newCategory.value);
      dispatch(setGender(newCategory.gender));
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, pb: 10 }}>
      <Stack spacing={3}>
        <Stack spacing={1} alignItems="center">
          <Typography variant="h5" fontWeight={700} textAlign="center">
            League Rankings
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Explore the top players across singles and doubles leaderboards.
          </Typography>
        </Stack>

        <Paper variant="outlined" sx={{ borderRadius: 2 }}>
          <Tabs
            value={category}
            onChange={handleCategoryChange}
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
            {categories.map((item) => (
              <Tab
                key={item.value}
                value={item.value}
                icon={item.icon}
                iconPosition="top"
                label={item.label}
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
            <Stack direction="row" alignItems="center" spacing={1}>
              <SportsTennisIcon fontSize="small" color="primary" />
              <Typography variant="body2" color="text.secondary">
                {activeCategory.helper}
              </Typography>
            </Stack>
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
                      Elo Rating
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
                    Elo Rating
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((entry, index) => (
                  <TableRow
                    key={entry.id || `${entry.username}-${index}`}
                    hover
                    onClick={() =>
                      setSelectedPlayer({
                        ...entry,
                        rank: entry.rank ?? index + 1,
                      })
                    }
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>
                      <Typography fontWeight={700}>{entry.rank ?? index + 1}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          src={normalizeProfileImage(entry.profile_image_url)}
                          imgProps={{ referrerPolicy: "no-referrer" }}
                        >
                          {entry.username?.charAt(0).toUpperCase() || "P"}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={700}>{entry.username}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {entry.gender ? `${entry.gender} player` : "Player"}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={700}>{entry.elo ?? "—"}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
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
                  {selectedPlayer.gender ? `${selectedPlayer.gender} player` : "Player"}
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
                  <Typography fontWeight={800}>{selectedPlayer.elo ?? "—"}</Typography>
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
