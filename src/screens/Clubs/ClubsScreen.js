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
          <Typography variant="h5" fontWeight={800}>
            Club
          </Typography>
          <Box width={24} />
        </Stack>

        <Card
          sx={{
            borderRadius: 3,
            color: "common.white",
            background:
              "linear-gradient(135deg, rgba(16,106,82,0.98) 0%, rgba(46,156,122,0.94) 55%, rgba(98,196,154,0.92) 100%)",
            boxShadow: "0px 18px 32px -20px rgba(16, 106, 82, 0.7)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={700}>
                Create your own Courtside club
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Start a badminton community and schedule matches with players nearby.
              </Typography>
              <Button
                variant="contained"
                color="inherit"
                sx={{
                  alignSelf: "flex-start",
                  bgcolor: "common.white",
                  color: "success.dark",
                  fontWeight: 700,
                  px: 3,
                  py: 1,
                  borderRadius: 999,
                  "&:hover": {
                    bgcolor: "grey.100",
                  },
                }}
              >
                Create a Club
              </Button>
            </Stack>
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
              <Grid item xs={6} key={club.id}>
                <Card variant="outlined" sx={{ height: "100%", borderRadius: 3 }}>
                  <CardMedia
                    component="img"
                    height="120"
                    image={club.image}
                    alt={club.name}
                  />
                  <CardContent sx={{ p: 2 }}>
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
