import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "@mui/material/Button";
import Badge from "@mui/material/Badge";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import InboxIcon from "@mui/icons-material/Inbox";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import RecordMatchModal from "./RecordMatchModal";
import MatchSuccessModal from "./MatchSuccessModal";
import AddMatchVideoModal from "./AddMatchVideoModal";
import { fetchMatchHistory } from "../../features/matches/matchSlice";
import { getPendingMatches } from "../../api/matches";
import { getStoredToken } from "../../services/storage";
import PlayerProfileChip from "../../components/PlayerProfileChip";
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import LoadingSpinner from "../../components/LoadingSpinner";
import { getDisciplineFromMatch, getEloForMode } from "../../utils/elo";
import { extractYouTubeId, isYouTubeLink } from "../../utils/video";

const getOutcomeFromWinnerTeam = (winnerTeam, teamKey) => {
  if (winnerTeam === "draw" || winnerTeam === null) return "draw";
  if (!winnerTeam) return "pending";
  return winnerTeam === teamKey ? "winner" : "loser";
};

const getOutcomeStyles = (theme, outcome) => {
  const isWinner = outcome === "winner";
  const isLoser = outcome === "loser";

  return {
    color: isWinner
      ? theme.palette.success.main
      : isLoser
      ? theme.palette.error.main
      : theme.palette.text.primary,
    backgroundColor: isWinner
      ? alpha(theme.palette.success.main, 0.12)
      : isLoser
      ? alpha(theme.palette.error.main, 0.12)
      : alpha(theme.palette.text.primary, 0.04),
    px: 1,
    py: 0.5,
    borderRadius: 1,
    display: "inline-flex",
    alignItems: "center",
    gap: 0.5,
    fontWeight: isWinner ? 800 : 600,
    fontSize: isWinner ? "1.05rem" : "1rem",
    transform: isWinner ? "translateY(-2px)" : "none",
    boxShadow: isWinner
      ? `0 6px 12px ${alpha(theme.palette.success.main, 0.18)}`
      : "none",
  };
};

function TeamCard({ title, players, outcome, discipline }) {
  const isWinner = outcome === "winner";

  return (
    <Stack
      spacing={4}
      sx={(theme) => ({
        border: 1,
        borderColor: isWinner
          ? theme.palette.success.main
          : outcome === "loser"
          ? alpha(theme.palette.error.main, 0.4)
          : "divider",
        borderRadius: 1,
        p: 5,
        boxShadow: isWinner
          ? `0 6px 14px ${alpha(theme.palette.success.main, 0.16)}`
          : "none",
        transform: isWinner ? "translateY(-2px)" : "none",
        transition: "all 0.2s ease",
      })}
    >
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>
      {players?.map((player) => (
        <Stack
          key={player.auth_id || player.id || player.username}
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <PlayerProfileChip
            player={player}
            chipProps={{
              sx: (theme) => getOutcomeStyles(theme, outcome),
              variant: "outlined",
            }}
          />
          {player.elo !== undefined && (
            <Typography color="text.secondary">
              Elo: {getEloForMode(player, discipline, { fallback: player.elo })}
            </Typography>
          )}
        </Stack>
      ))}
    </Stack>
  );
}

function MatchHistoryScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = useSelector((state) => state.user.user?.auth_id);
  const { matches, loading } = useSelector((state) => state.matches);
  const [openModal, setOpenModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [recordedMatch, setRecordedMatch] = useState(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoModalMatch, setVideoModalMatch] = useState(null);
  useEffect(() => {
    if (userId) {
      dispatch(fetchMatchHistory(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    async function loadPendingCount() {
      const token = getStoredToken();
      if (!token) return;

      try {
        const data = await getPendingMatches(token);
        setPendingCount(data.incoming?.length || 0);
      } catch (err) {
        console.error("Failed to load pending matches", err);
      }
    }

    loadPendingCount();
  }, []);

  const handleRecorded = (matchData) => {
    setOpenModal(false);
    setRecordedMatch(matchData?.match || matchData || null);
    setShowSuccessModal(true);
    if (userId) {
      dispatch(fetchMatchHistory(userId));
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    setRecordedMatch(null);
  };

  const handleMatchClick = (match) => {
    setSelectedMatch(match);
  };

  const handleCloseMatchDetail = () => {
    setSelectedMatch(null);
  };

  const getTeamPlayers = (match, teamKey) =>
    match?.players?.[teamKey] || match?.[`players_${teamKey}`] || [];

  const handleOpenVideoModal = (match) => {
    if (!match) return;
    const matchId = match.match_id || match.id;
    setVideoModalMatch({
      id: matchId,
      link: match.video_link || "",
    });
    setVideoModalOpen(true);
  };

  const handleAddVideoFromSuccess = () => {
    setShowSuccessModal(false);
    handleOpenVideoModal(recordedMatch);
  };

  const handleVideoSaved = async () => {
    if (userId) {
      try {
        const data = await dispatch(fetchMatchHistory(userId)).unwrap();
        const refreshedMatches = data?.matches || data || [];
        const updatedMatch = refreshedMatches.find(
          (item) => (item.match_id || item.id) === videoModalMatch?.id
        );
        if (updatedMatch) {
          setSelectedMatch(updatedMatch);
        }
      } catch (err) {
        console.error("Failed to refresh matches after saving video", err);
      }
    }
    setVideoModalOpen(false);
    setVideoModalMatch(null);
  };

  const renderMatchDetail = () => {
    if (!selectedMatch) return null;
  
    const matchStatus = selectedMatch?.status
    const discipline = getDisciplineFromMatch(selectedMatch);
    const teamAPlayers = getTeamPlayers(selectedMatch, "team_A");
    const teamBPlayers = getTeamPlayers(selectedMatch, "team_B");
    const winnerTeam = selectedMatch.winner_team;
    const isDraw = winnerTeam === "draw" || winnerTeam === null;
    const teamAOutcome = getOutcomeFromWinnerTeam(winnerTeam, "A");
    const teamBOutcome = getOutcomeFromWinnerTeam(winnerTeam, "B");
    const winnerLabel = isDraw
      ? "Draw"
      : winnerTeam
      ? `Team ${winnerTeam}`
      : "";

    const videoLink = selectedMatch.video_link;
    const youtubeId = videoLink && isYouTubeLink(videoLink) ? extractYouTubeId(videoLink) : null;

    return (
      <Dialog
        open={Boolean(selectedMatch)}
        onClose={handleCloseMatchDetail}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Match Detail</DialogTitle>
        <DialogContent>
          <Stack spacing={2} py={1}>
            <Stack spacing={0.5}>
              <Typography variant="h6" fontWeight={700}>
                {selectedMatch.match_type === "doubles" ? "Doubles" : "Singles"}
              </Typography>
              <Typography color="text.secondary">Result: {winnerLabel}</Typography>
              <Typography>Score: {selectedMatch.score}</Typography>
              <Typography color="text.secondary">
                {selectedMatch.played_at
                  ? new Date(selectedMatch.played_at).toLocaleDateString()
                  : ""}
              </Typography>
            </Stack>

            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" fontWeight={700}>
                  Match video
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => handleOpenVideoModal(selectedMatch)}
                >
                  {videoLink ? "Edit video link" : "Add match video"}
                </Button>
              </Stack>
              {!videoLink ? (
                <Typography sx={{margin:"20px"}}>No match video.</Typography>
              ) : youtubeId ? (
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    pt: "56.25%",
                    borderRadius: 2,
                    overflow: "hidden",
                    boxShadow: 3,
                  }}
                >
                  <Box
                    component="iframe"
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title="Match video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    sx={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      border: 0,
                    }}
                  />
                </Box>
              ) : (
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={(theme) => ({
                    p: 2,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  })}
                >
                  <VideoLibraryIcon color="primary" />
                  <Stack spacing={0.25} flex={1}>
                    <Typography fontWeight={700}>
                      {(() => {
                        try {
                          return new URL(videoLink).hostname.replace(/^www\./, "");
                        } catch (error) {
                          return "External video link";
                        }
                      })()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      External video link
                    </Typography>
                  </Stack>
                  <Button
                    variant="outlined"
                    component="a"
                    href={videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open video
                  </Button>
                </Stack>
              )}
            </Stack>

            <TeamCard
              title="Team A"
              players={teamAPlayers}
              outcome={teamAOutcome}
              discipline={discipline}
            />
            <TeamCard
              title="Team B"
              players={teamBPlayers}
              outcome={teamBOutcome}
              discipline={discipline}
            />
          </Stack>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" rowGap={2} padding={4}>
          <Typography variant="h5" fontWeight={500}>
            Match History
          </Typography>
          <Stack direction="row" spacing={5} alignItems="center" flexWrap="wrap" justifyContent="space-evenly">
            <IconButton onClick={() => navigate("/matches/pending")}> 
              <Badge
                color="error"
                badgeContent={pendingCount}
                overlap="circular"
                showZero
              >
              <InboxIcon />
              </Badge>
            </IconButton>
            <Button variant="contained" onClick={() => setOpenModal(true)}>
              Record Match
            </Button>
          </Stack>
        </Stack>

        <Box></Box>

        {loading ? (
          <Stack spacing={2}>
            {[...Array(4)].map((_, idx) => (
              <Stack key={idx} spacing={1} p={2} sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}>
                <Skeleton width="80%" />
                <Skeleton width="60%" />
                <Skeleton variant="rectangular" height={8} />
                <Skeleton variant="rectangular" height={8} width="70%" />
              </Stack>
            ))}
            <LoadingSpinner message="Loading match history..." />
          </Stack>
        ) : matches?.length ? (
          <List>
            {matches.map((match) => {
              const discipline = getDisciplineFromMatch(match);
              const winnerTeam = match.winner_team;
              const teamAOutcome = getOutcomeFromWinnerTeam(winnerTeam, "A");
              const teamBOutcome = getOutcomeFromWinnerTeam(winnerTeam, "B");
              const hasVideo = Boolean(match.video_link);
              const thisMatchStatus = match.status;

              return (
                <ListItemButton
                  key={match.match_id || match.id}
                  divider
                  onClick={() => handleMatchClick(match)}
                  sx={{
                    alignItems: "flex-start",
                    position: "relative",
                    py: 1.5,
                  }}
                >
                  {/* Status chip – top right */}
                  <Box sx={{ position: "absolute", top: 12, right: 16 }}>
                    <Chip
                      size="small"
                      label={thisMatchStatus}
                      color={thisMatchStatus === "confirmed" ? "success" : "default"}
                    />
                  </Box>

                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={600}>
                        {discipline === "doubles" ? "Doubles" : "Singles"} •{" "}
                        {(() => {
                          const wt = match.winner_team;
                          if (wt === "draw" || wt === null) return "Draw";
                          if (wt) return `Winner: Team ${wt}`;
                          return "Result pending";
                        })()}
                      </Typography>
                    }
                    secondary={
                      <Stack spacing={2} mt={0.75}>
                        {/* Score */}
                        <Typography variant="body1" color="text.primary">
                          Score: {match.score}
                        </Typography>

                        {/* Team A */}
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            sx={{ minWidth: 64 }}
                          >
                            Team A:
                          </Typography>
                          <Stack direction="row" spacing={0.75} flexWrap="wrap">
                            {(match.players?.team_A || []).map((player) => (
                              <PlayerProfileChip
                                key={player.auth_id || player.id || player.username}
                                player={player}
                                chipProps={{
                                  sx: (theme) => getOutcomeStyles(theme, teamAOutcome),
                                  variant: "outlined",
                                  size: "small",
                                }}
                              />
                            ))}
                          </Stack>
                        </Stack>

                        {/* Team B */}
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            sx={{ minWidth: 64 }}
                          >
                            Team B:
                          </Typography>
                          <Stack direction="row" spacing={0.75} flexWrap="wrap">
                            {(match.players?.team_B || []).map((player) => (
                              <PlayerProfileChip
                                key={player.auth_id || player.id || player.username}
                                player={player}
                                chipProps={{
                                  sx: (theme) => getOutcomeStyles(theme, teamBOutcome),
                                  variant: "outlined",
                                  size: "small",
                                }}
                              />
                            ))}
                          </Stack>
                        </Stack>

                        {/* Meta row */}
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="caption" color="text.secondary">
                            {match.played_at
                              ? new Date(match.played_at).toLocaleDateString()
                              : ""}
                          </Typography>

                          {hasVideo && (
                            <Tooltip title="Match video available">
                              <Typography variant="caption" color="text.secondary">
                                🎥 Video
                              </Typography>
                            </Tooltip>
                          )}
                        </Stack>
                      </Stack>
                    }
                  />
                </ListItemButton>

              );
            })}
          </List>
        ) : (
          <DialogContentText>No matches recorded yet.</DialogContentText>
        )}
      </Stack>

      <RecordMatchModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onRecorded={handleRecorded}
      />
      <MatchSuccessModal
        open={showSuccessModal}
        match={recordedMatch}
        onClose={handleCloseSuccess}
        onAddVideo={recordedMatch ? handleAddVideoFromSuccess : undefined}
      />
      <AddMatchVideoModal
        open={videoModalOpen}
        onClose={() => {
          setVideoModalOpen(false);
          setVideoModalMatch(null);
        }}
        matchId={videoModalMatch?.id}
        existingLink={videoModalMatch?.link}
        onSaved={handleVideoSaved}
      />
      {renderMatchDetail()}
    </Container>
  );
}

export default MatchHistoryScreen;
