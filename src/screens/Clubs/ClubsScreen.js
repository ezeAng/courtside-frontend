import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

const clubs = [
  {
    id: "club-1",
    name: "5000kms in 2024",
    location: "Singapore",
    members: "30,284 Cyclists",
    type: "Cycling",
    image: "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "club-2",
    name: "Solo Runners",
    location: "Johor, Malaysia",
    members: "28,965 Runners",
    type: "Running",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
  },
];

function ClubsScreen() {
  const [tab, setTab] = useState("clubs");

  return (
    <Container maxWidth="sm" sx={{ pb: 12, pt: 2 }}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <SearchIcon />
          <Typography variant="h6" fontWeight={700}>
            Groups
          </Typography>
          <Box width={24} />
        </Stack>

        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          centered
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Activity" value="activity" />
          <Tab label="Challenges" value="challenges" />
          <Tab label="Clubs" value="clubs" />
        </Tabs>

        <Card variant="outlined">
          <CardContent>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Typography fontWeight={600}>
                Create your own Courtside club
              </Typography>
              <Button variant="outlined" color="primary">
                Create a Club
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Box
          sx={{
            height: 180,
            borderRadius: 3,
            background:
              "linear-gradient(135deg, rgba(255,112,67,0.9) 0%, rgba(255,167,38,0.8) 100%)",
          }}
        />

        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <CardMedia
                component="img"
                src="https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=120&q=80"
                alt="Featured club"
                sx={{ width: 64, height: 64, borderRadius: 2 }}
              />
              <Stack spacing={0.5} flex={1}>
                <Typography variant="h6" fontWeight={700}>
                  The Courtside Club
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <LocationOnIcon fontSize="small" color="action" />
                  <Typography color="text.secondary" variant="body2">
                    San Francisco, California
                  </Typography>
                </Stack>
                <Typography color="text.secondary" variant="body2">
                  6,669,609 Athletes
                </Typography>
              </Stack>
            </Stack>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2, borderRadius: 999 }}
            >
              Join
            </Button>
          </CardContent>
        </Card>

        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <EmojiEventsIcon />
            <Typography variant="h6" fontWeight={700}>
              Popular Clubs Near You
            </Typography>
          </Stack>
          <Divider />
          <Grid container spacing={2}>
            {clubs.map((club) => (
              <Grid item xs={12} sm={6} key={club.id}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardMedia
                    component="img"
                    height="120"
                    image={club.image}
                    alt={club.name}
                  />
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {club.name}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={club.type} size="small" />
                        <Typography variant="body2" color="text.secondary">
                          {club.location}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {club.members}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Stack>
    </Container>
  );
}

export default ClubsScreen;
