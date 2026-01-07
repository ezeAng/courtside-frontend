import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

const clubs = [
  {
    id: "club-1",
    name: "Shuttle Sprint Society",
    location: "Singapore",
    members: "1,284 Players",
    type: "Badminton",
    image: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "club-2",
    name: "Smash & Spin Crew",
    location: "Johor, Malaysia",
    members: "946 Players",
    type: "Badminton",
    image: "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&w=600&q=80",
  },
];

function ClubsScreen() {
  return (
    <Container maxWidth="sm" sx={{ pb: 12, pt: 2 }}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={700}>
            Club
          </Typography>
          <Box width={24} />
        </Stack>

        <Card
          sx={{
            borderRadius: 3,
            color: "common.white",
            background:
              "linear-gradient(135deg, rgba(255,112,67,0.95) 0%, rgba(255,167,38,0.9) 100%)",
          }}
        >
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={700}>
                Create your own Courtside club
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Start a badminton community and schedule matches with players nearby.
              </Typography>
              <Button variant="contained" color="inherit" sx={{ alignSelf: "flex-start" }}>
                Create a Club
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <CardMedia
                component="img"
                src="https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=120&q=80"
                alt="Featured badminton club"
                sx={{ width: 64, height: 64, borderRadius: 2 }}
              />
              <Stack spacing={0.5} flex={1}>
                <Typography variant="h6" fontWeight={700}>
                  Courtside Smash Club
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <LocationOnIcon fontSize="small" color="action" />
                  <Typography color="text.secondary" variant="body2">
                    San Francisco, California
                  </Typography>
                </Stack>
                <Typography color="text.secondary" variant="body2">
                  2,340 Players
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
          <TextField
            placeholder="Search clubs near you"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
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
