import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { addMatchVideo } from "../../services/api";

function AddMatchVideoModal({
  open,
  onClose,
  matchId,
  existingLink = "",
  onSaved,
}) {
  const token = useSelector((state) => state.auth.accessToken);
  const [videoLink, setVideoLink] = useState(existingLink || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setVideoLink(existingLink || "");
      setError(null);
    }
  }, [existingLink, open]);

  const handleSave = async () => {
    const trimmedLink = videoLink.trim();

    if (!trimmedLink || !trimmedLink.startsWith("https://")) {
      setError("Please enter a valid video link");
      return;
    }

    if (!matchId) {
      setError("Missing match information");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await addMatchVideo(matchId, trimmedLink, token);
      onSaved?.(trimmedLink);
      onClose?.();
    } catch (apiError) {
      setError(apiError.message || "Failed to save video link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add match video</DialogTitle>
      <DialogContent>
        <Stack spacing={2} pt={1}>
          <TextField
            fullWidth
            label="Video link"
            placeholder="Paste YouTube or video link"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
            disabled={loading}
            helperText="YouTube or any public video link"
            error={Boolean(error)}
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddMatchVideoModal;
