import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import {
  confirmMatch,
  deleteMatch,
  editMatch,
  getPendingMatches,
  rejectMatch,
} from "../../api/matches";
import { getStoredToken } from "../../services/storage";
import MatchConfirmedDialog from "../../components/MatchConfirmedDialog";
import PlayerProfileChip from "../../components/PlayerProfileChip";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import RecordMatchModal from "./RecordMatchModal";
import { parseScoreToSets } from "./scoreFormatting";
import { getPlayerAuthId } from "../../utils/matchPlayers";

export default function PendingMatchesScreen() {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.user);
  const currentUserId = currentUser?.auth_id;
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmFeedback, setConfirmFeedback] = useState(null);
  const [editingMatch, setEditingMatch] = useState(null);
  const [editSinglesValues, setEditSinglesValues] = useState(null);
  const [editDoublesValues, setEditDoublesValues] = useState(null);

  /* ---------------- helpers ---------------- */

  const getMatchPlayers = (match) => {
    if (Array.isArray(match.match_players) && match.match_players.length > 0) {
      return match.match_players.map((mp) => mp.user || mp);
    }
    if (match.submitted_by_user) {
      return [match.submitted_by_user];
    }
    return [];
  };

  const getScoreLabel = (match) => {
    if (!match.score) return "Score pending";
    return `Score: ${match.score}`;
  };

  const determineUserTeam = (match) => {
    const teamAPlayers = match.players_team_A || [];
    const teamBPlayers = match.players_team_B || [];

    const isInTeam = (players) =>
      players.some((player) => String(getPlayerAuthId(player)) === String(currentUserId));

    if (isInTeam(teamAPlayers)) return "A";
    if (isInTeam(teamBPlayers)) return "B";
    return "A";
  };

  const buildInitialValues = (match) => {
    const userTeam = determineUserTeam(match);
    const scoreSets = parseScoreToSets(match.score);
    const orientedSets =
      scoreSets.length > 0
        ? scoreSets.map((set) =>
            userTeam === "A"
              ? { your: set.teamA, opponent: set.teamB }
              : { your: set.teamB, opponent: set.teamA }
          )
        : [{ your: "", opponent: "" }];

    const matchType = (match.match_type || "").toLowerCase();

    if (matchType === "singles") {
      const opponent =
        userTeam === "A"
          ? (match.players_team_B || [])[0]
          : (match.players_team_A || [])[0];
      return {
        singles: {
          opponent,
          sets: orientedSets,
        },
        doubles: null,
      };
    }

    if (matchType !== "doubles") {
      return { singles: null, doubles: null };
    }

    const teamA = match.players_team_A || [];
    const teamB = match.players_team_B || [];
    const isUserOnTeamA = userTeam === "A";
    const myTeam = isUserOnTeamA ? teamA : teamB;
    const otherTeam = isUserOnTeamA ? teamB : teamA;

    const partner = myTeam.find(
      (player) => String(getPlayerAuthId(player)) !== String(currentUserId)
    );
    const [opponent1, opponent2] = otherTeam;

    return {
      singles: null,
      doubles: {
        partner: partner || null,
        opponent1: opponent1 || null,
        opponent2: opponent2 || null,
        sets: orientedSets,
      },
    };
  };

  const handleOpenEdit = (match) => {
    const initialValues = buildInitialValues(match);
    setEditingMatch(match);
    setEditSinglesValues(initialValues.singles);
    setEditDoublesValues(initialValues.doubles);
  };

  const handleCloseEdit = () => {
    setEditingMatch(null);
    setEditSinglesValues(null);
    setEditDoublesValues(null);
  };

  const handleEditSubmit = async (payload) => {
    if (!editingMatch) return null;
    const token = getStoredToken();
    const matchId = editingMatch.match_id || editingMatch.id;
    try {
      const result = await editMatch(matchId, payload, token);
      await load();
      handleCloseEdit();
      return result;
    } catch (err) {
      alert(err.message || "Failed to edit match");
      throw err;
    }
  };

  /* ---------------- data ---------------- */

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const token = getStoredToken();
      const data = await getPendingMatches(token);
      setIncoming(data.incoming || []);
      setOutgoing(data.outgoing || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleConfirm(matchId) {
    try {
      const token = getStoredToken();
      const confirmation = await confirmMatch(matchId, token);
      setConfirmFeedback(confirmation);
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleReject(matchId) {
    try {
      const token = getStoredToken();
      await rejectMatch(matchId, token);
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(matchId) {
    const confirmed = window.confirm("Delete this pending match?");
    if (!confirmed) return;
    try {
      const token = getStoredToken();
      await deleteMatch(matchId, token);
      await load();
    } catch (err) {
      alert(err.message || "Failed to delete match");
    }
  }

  /* ---------------- states ---------------- */

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Stack spacing={2}>
          {[...Array(3)].map((_, idx) => (
            <Paper key={idx} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack spacing={1}>
                <Skeleton width="50%" />
                <Skeleton width="70%" />
                <Skeleton height={28} />
              </Stack>
            </Paper>
          ))}
          <LoadingSpinner message="Loading pending matches..." />
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">Error loading matches: {error}</Alert>
      </Container>
    );
  }

  /* ---------------- renderers ---------------- */

  const renderIncoming = () => (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight={700}>
        Matches You Need To Confirm
      </Typography>

      {incoming.length === 0 ? (
        <EmptyState
          title="Nothing to confirm"
          description="You’ll see matches that need your confirmation here."
        />
      ) : (
        incoming.map((m) => (
          <Paper key={m.match_id} variant="outlined" sx={{ p: 4, borderRadius: 1.5 }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1" fontWeight={700}>
                {m.match_type.toUpperCase()}
              </Typography>

              {/* players */}
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {getMatchPlayers(m).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Players not assigned
                  </Typography>
                ) : (
                  getMatchPlayers(m).map((p, idx) => (
                    <PlayerProfileChip
                      key={idx}
                      player={p}
                      chipProps={{ size: "small", variant: "outlined" }}
                    />
                  ))
                )}
              </Stack>

              {/* score */}
              <Typography variant="body2" color={m.score ? "text.primary" : "text.secondary"}>
                {getScoreLabel(m)}
              </Typography>

              {/* submitted by */}
              {m.submitted_by_user && (
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Typography variant="body2">Submitted by</Typography>
                  <PlayerProfileChip
                    player={m.submitted_by_user}
                    chipProps={{ size: "small" }}
                  />
                </Stack>
              )}

              <Typography variant="caption" color="text.secondary">
                {new Date(m.created_at).toLocaleString()}
              </Typography>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleConfirm(m.match_id)}
                >
                  Confirm
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleReject(m.match_id)}
                >
                  Reject
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ))
      )}
    </Stack>
  );

  const renderOutgoing = () => (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight={700}>
        Matches You Submitted
      </Typography>

      {outgoing.length === 0 ? (
        <EmptyState
          title="No pending submissions"
          description="Submit a match and wait for opponents to confirm."
        />
      ) : (
        outgoing.map((m) => (
          <Paper key={m.match_id} variant="outlined" sx={{ p: 4, borderRadius: 1.5 }}>
            <Stack spacing={1.25}>
              <Typography variant="subtitle1" fontWeight={700}>
                {m.match_type.toUpperCase()}
              </Typography>

              {/* players */}
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {getMatchPlayers(m).map((p, idx) => (
                  <PlayerProfileChip
                    key={idx}
                    player={p}
                    chipProps={{ size: "small", variant: "outlined" }}
                  />
                ))}
              </Stack>

              {/* score */}
              <Typography variant="body2" color={m.score ? "text.primary" : "text.secondary"}>
                {getScoreLabel(m)}
              </Typography>

              <Typography variant="body2" color="warning.main">
                Waiting for confirmation
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {new Date(m.created_at).toLocaleString()}
              </Typography>

              <Stack direction="row" spacing={1}>
                
                <Button color="error" onClick={() => handleDelete(m.match_id)}>
                  Delete
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ))
      )}
    </Stack>
  );

  /* ---------------- layout ---------------- */

  return (
    <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
      <MatchConfirmedDialog
        open={Boolean(confirmFeedback)}
        confirmFeedback={confirmFeedback}
        onClose={() => setConfirmFeedback(null)}
      />

      <Stack spacing={5}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/matches")}
            variant="text"
          >
            Back
          </Button>
          <Typography variant="h5" fontWeight={700}>
            Pending Matches
          </Typography>
        </Stack>

        {renderIncoming()}

        <Divider />

        {renderOutgoing()}
      </Stack>

      <RecordMatchModal
        open={Boolean(editingMatch)}
        onClose={handleCloseEdit}
        onRecorded={() => {}}
        initialSinglesValues={editSinglesValues}
        initialDoublesValues={editDoublesValues}
        initialTab={editingMatch?.match_type === "doubles" ? 1 : 0}
        submitLabel="Save changes"
        onSinglesSubmit={handleEditSubmit}
        onDoublesSubmit={handleEditSubmit}
      />
    </Container>
  );
}
