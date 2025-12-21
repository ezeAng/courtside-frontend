import { useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";

const backendUrl = process.env.REACT_APP_BACKEND_URL || "";

function FeedbackModal({ open, onClose, token }) {
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const subjectLength = subject.length;
  const textLength = text.length;

  const subjectValid = useMemo(() => {
    const trimmed = subject.trim();
    return trimmed.length >= 1 && trimmed.length <= 50;
  }, [subject]);

  const textValid = useMemo(() => {
    const trimmed = text.trim();
    return trimmed.length >= 1 && trimmed.length <= 1000;
  }, [text]);

  const canSubmit = subjectValid && textValid && Boolean(token) && !loading;

  useEffect(() => {
    if (!open) {
      setSubject("");
      setText("");
      setError("");
    }
  }, [open]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!subjectValid || !textValid || loading) {
      return;
    }

    if (!token) {
      setError("You must be logged in to send feedback.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${backendUrl}/api/feedback`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: subject.trim(),
          text: text.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 201) {
        setSuccess(true);
        setSubject("");
        setText("");
        onClose();
        return;
      }

      setError(data.error || "Failed to send feedback. Please try again.");
    } catch (err) {
      setError(err.message || "Failed to send feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Send Feedback</DialogTitle>
        <DialogContent>
          <Stack
            component="form"
            spacing={2}
            sx={{ pt: 1 }}
            onSubmit={handleSubmit}
          >
            {error && <Alert severity="error">{error}</Alert>}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" fontWeight={600}>
                  Subject
                </Typography>
                <Typography variant="body2" color={subjectLength > 50 ? "error.main" : "text.secondary"}>
                  {subjectLength}/50
                </Typography>
              </Stack>
              <TextField
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Briefly summarize your feedback"
                fullWidth
                error={subjectLength > 50}
                helperText={
                  subjectLength > 50 ? "Subject must be 50 characters or fewer." : " "
                }
              />
            </Box>
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" fontWeight={600}>
                  Details
                </Typography>
                <Typography variant="body2" color={textLength > 1000 ? "error.main" : "text.secondary"}>
                  {textLength}/1000
                </Typography>
              </Stack>
              <TextField
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Tell us more about your feedback"
                fullWidth
                multiline
                minRows={4}
                error={textLength > 1000}
                helperText={
                  textLength > 1000 ? "Feedback must be 1000 characters or fewer." : " "
                }
              />
            </Box>
            <DialogActions sx={{ px: 0 }}>
              <Button onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!canSubmit}
              >
                {loading ? "Sending..." : "Submit"}
              </Button>
            </DialogActions>
          </Stack>
        </DialogContent>
      </Dialog>
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        message="Feedback sent"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
}

export default FeedbackModal;
