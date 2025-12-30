import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import PlayerChip from "./PlayerChip";
import EmptyState from "../../../components/EmptyState";

function PlayersFoundModal({ open, onClose, players, onSelectPlayer }) {
  const hasPlayers = players?.length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={{
        borderRadius: 4,
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ py: 2 }}>
        <Stack spacing={0.5}>
          <Typography variant="h6" fontWeight={800}>
            Players Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tap a player to view their profile
          </Typography>
        </Stack>
      </DialogTitle>

      {/* Content */}
      <DialogContent
        sx={{
          pt: 2,
          pb: 0,
        }}
      >
        {hasPlayers ? (
          <Stack spacing={2}>
            {players.map((player) => (
              <PlayerChip
                key={player.auth_id || player.id || player.username}
                player={player}
                onClick={() => onSelectPlayer?.(player)}
              />
            ))}
          </Stack>
        ) : (
          <Box py={4}>
            <EmptyState
              title="No players found"
              description="Try adjusting your filters to widen the search."
            />
          </Box>
        )}
      </DialogContent>

      {/* Footer */}
      <Box
        sx={{
          p: 2.5,
          pt: 2,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          fullWidth
          size="large"
          sx={{
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Close
        </Button>
      </Box>
    </Dialog>
  );
}

export default PlayersFoundModal;
