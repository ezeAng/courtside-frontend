import { useState } from "react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";

const tabOptions = [
  { label: "Tournaments", value: "tournaments", emoji: "🏆" },
  { label: "Leagues", value: "leagues", emoji: "🏅" },
];

function ComingSoon({ emoji }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: 3,
        textAlign: "center",
      }}
    >
      <Typography variant="h6" fontWeight={700}>
        Coming soon, stay tuned {emoji}
      </Typography>
    </Paper>
  );
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
