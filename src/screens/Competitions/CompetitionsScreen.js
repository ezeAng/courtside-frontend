import { useState } from "react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import EmptyState from "../../components/EmptyState";

const tabOptions = [
  { label: "Tournaments", value: "tournaments", emoji: "🏆" },
  { label: "Leagues", value: "leagues", emoji: "🏅" },
];

function ComingSoon({ emoji }) {
  return <EmptyState
    title="Competition hub coming soon"
    description="Stay tuned for tournaments and leagues tailored to your discipline. We’ll notify you when sign-ups open."
    icon={<EmojiEventsOutlinedIcon />}
    actionLabel="Back to Home"
    onAction={() => window.history.back()}
  >
    <Typography variant="caption" color="text.secondary">
      {emoji} We’re polishing the brackets.
    </Typography>
  </EmptyState>;
}

export default function CompetitionsScreen() {
  const [tab, setTab] = useState(tabOptions[0].value);

  const activeTab = tabOptions.find((option) => option.value === tab);

  return (
    <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={700}>
          Competitions
        </Typography>

        <Tabs
          value={tab}
          onChange={(event, newValue) => setTab(newValue)}
          variant="fullWidth"
        >
          {tabOptions.map((option) => (
            <Tab key={option.value} label={option.label} value={option.value} />
          ))}
        </Tabs>

        <ComingSoon emoji={activeTab?.emoji || "⏳"} />
      </Stack>
    </Container>
  );
}
