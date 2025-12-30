import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import GroupIcon from "@mui/icons-material/Group";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

function FindPlayersScreen() {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Search players",
      description: "Look up players directly by username.",
      icon: <PersonSearchIcon />,
      onClick: () => navigate("/connections/search"),
      accent: "primary.main",
    },
    {
      label: "Requests",
      description: "Review incoming and outgoing requests.",
      icon: <MailOutlineIcon />,
      onClick: () => navigate("/connections/requests"),
      accent: "secondary.main",
    },
    {
      label: "Recommended",
      description: "Discover players matched to your play style.",
      icon: <GroupIcon />,
      onClick: () => navigate("/connections/recommended"),
      accent: "success.main",
    },
  ];

  return (
    <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            Find Players
          </Typography>
          <Typography color="text.secondary">
            Discover new partners, manage requests, and grow your network.
          </Typography>
        </Box>

        {/* Action cards */}
        <Stack spacing={2.5}>
          {actions.map((action) => (
            <Card
              key={action.label}
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 3,
                },
              }}
            >
              <CardActionArea onClick={action.onClick}>
                <CardContent sx={{ py: 3 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2.5}
                  >
                    {/* Icon container */}
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: action.accent,
                        color: "white",
                        flexShrink: 0,
                      }}
                    >
                      {action.icon}
                    </Box>

                    {/* Text */}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={800}>
                        {action.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {action.description}
                      </Typography>
                    </Box>

                    {/* Chevron */}
                    <ChevronRightIcon
                      sx={{ color: "text.secondary" }}
                    />
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
