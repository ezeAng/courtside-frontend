import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import EmptyState from "../../components/EmptyState";

const backendUrl = process.env.REACT_APP_BACKEND_URL || "";

const tabOptions = [
  { label: "Tournaments", value: "tournaments", emoji: "🏆" },
  { label: "Leagues", value: "leagues", emoji: "🏅" },
];

function ComingSoon({ emoji, tab, onJoinWaitlist, loading, error }) {
  const explanation = useMemo(() => {
    if (tab === "tournaments") {
      return "Join tournaments and play matches at your own pace, compete and progress through the rounds and meet new people!";
    }
    return "Join leagues and compete with your group consistently and see who comes up as league champion!";
  }, [tab]);

  return <EmptyState
    title="Competition hub coming soon"
    description="Stay tuned for tournaments and leagues tailored to your discipline. We’ll notify you when sign-ups open."
    icon={<EmojiEventsOutlinedIcon />}
    actions={(
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        justifyContent="center"
        alignItems="center"
        sx={{ width: "100%" }}
      >
        <Button variant="contained" size="small" onClick={() => window.history.back()} fullWidth>
          Back to Home
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={onJoinWaitlist}
          disabled={loading}
          fullWidth
        >
          {loading ? "Sending..." : "Excited for this! Join waitlist."}
        </Button>
      </Stack>
    )}
  >
    <Stack spacing={1} alignItems="center">
      <Typography variant="caption" color="text.secondary">
        {emoji} We’re polishing the brackets.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
        {explanation}
      </Typography>
      {error && (
        <Alert severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      )}
    </Stack>
  </EmptyState>;
}

export default function CompetitionsScreen({ tab: activeTabProp, allowTabSwitching = true }) {
  const [tab, setTab] = useState(activeTabProp || tabOptions[0].value);

  useEffect(() => {
    if (activeTabProp) {
      setTab(activeTabProp);
    }
  }, [activeTabProp]);

  const resolvedTab = activeTabProp || tab;
  const token = useSelector((state) => state.auth.accessToken);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistError, setWaitlistError] = useState("");
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  const activeTab = tabOptions.find((option) => option.value === resolvedTab);
  const heading = allowTabSwitching ? "Competitions" : activeTab?.label || "Competitions";

  const handleJoinWaitlist = async () => {
    setWaitlistError("");
    if (!token) {
      setWaitlistError("You must be logged in to join the waitlist.");
      return;
    }

    setWaitlistLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/feedback`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: `waitlist for ${resolvedTab}`,
          text: "Signal of demand",
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 201) {
        setWaitlistSuccess(true);
        return;
      }

      setWaitlistError(data.error || "Failed to join the waitlist. Please try again.");
    } catch (error) {
      setWaitlistError(error.message || "Failed to join the waitlist. Please try again.");
    } finally {
      setWaitlistLoading(false);
    }
  };

  return (
    <>
      <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
        <Stack spacing={3}>
          <Typography align="center" variant="h5" fontWeight={700}>
            {heading}
          </Typography>

          {allowTabSwitching && (
            <Tabs
              value={resolvedTab}
              onChange={(event, newValue) => {
                if (!allowTabSwitching) return;
                setTab(newValue);
              }}
              variant="fullWidth"
            >
              {tabOptions.map((option) => (
                <Tab key={option.value} label={option.label} value={option.value} />
              ))}
            </Tabs>
          )}
          
          <ComingSoon
            emoji={activeTab?.emoji || "⏳"}
            tab={resolvedTab}
            onJoinWaitlist={handleJoinWaitlist}
            loading={waitlistLoading}
            error={waitlistError}
          />
        </Stack>
      </Container>
      <Snackbar
        open={waitlistSuccess}
        autoHideDuration={3000}
        onClose={() => setWaitlistSuccess(false)}
        message="Thanks for your interest! You're on the waitlist."
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
}
