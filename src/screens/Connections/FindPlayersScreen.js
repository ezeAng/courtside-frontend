import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import GroupIcon from "@mui/icons-material/Group";

function FindPlayersScreen() {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Search by Username",
      description: "Quickly look up players by handle.",
      icon: <PersonSearchIcon color="primary" />,
      onClick: () => navigate("/connections/search"),
    },
    {
      label: "Connection Requests",
      description: "Manage incoming and outgoing requests.",
      icon: <MailOutlineIcon color="primary" />,
      onClick: () => navigate("/connections/requests"),
    },
    {
      label: "Find recommended players",
      description: "See players tailored to your preferences.",
      icon: <GroupIcon color="primary" />,
      onClick: () => navigate("/connections/recommended"),
    },
  ];

  return (
    <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            Find Players
          </Typography>
          <Typography color="text.secondary">
            Discover new partners, accept requests, and keep track of your connections.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={(theme) => ({
            py: 2,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 800,
            fontSize: "1.05rem",
            boxShadow: theme.custom?.colors?.shadows?.md,
            backgroundImage:
              "linear-gradient(120deg, " +
              theme.palette.primary.main +
              ", " +
              theme.palette.secondary.main +
              ")",
          })}
          onClick={() => navigate("/connections/recommended")}
        >
          Find Recommended Players
        </Button>

        <Stack spacing={2}>
          {actions.map((action) => (
            <Card key={action.label} variant="outlined" sx={{ borderRadius: 2 }}>
              <CardActionArea onClick={action.onClick}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={(theme) => ({
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        backgroundColor: theme.palette.action.hover,
                      })}
                    >
                      {action.icon}
                    </Box>
                    <Box>
                      <Typography fontWeight={700}>{action.label}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}

export default FindPlayersScreen;
