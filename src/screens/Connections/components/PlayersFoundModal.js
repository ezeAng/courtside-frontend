import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import PlayerChip from "./PlayerChip";
import EmptyState from "../../../components/EmptyState";

function PlayersFoundModal({ open, onClose, players, onSelectPlayer }) {
  const hasPlayers = players?.length;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Players Found</DialogTitle>
      <DialogContent dividers>
        {hasPlayers ? (
          <Stack spacing={1.5}>
            {players.map((player) => (
              <PlayerChip
                key={player.auth_id || player.id || player.username}
                player={player}
                onClick={() => onSelectPlayer?.(player)}
              />
            ))}
          </Stack>
        ) : (
          <EmptyState
            title="No players found"
            description="Try updating your filters."
          />
        )}
      </DialogContent>
      <Button onClick={onClose} sx={{ m: 2 }} variant="outlined" fullWidth>
        Close
      </Button>
    </Dialog>
  );
}

export default PlayersFoundModal;
