import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AVATARS } from "../../constants/avatars";

function HomeScreen() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const avatarIcon = useMemo(() => {
    if (user?.avatar === undefined || user?.avatar === null) {
      return "";
    }
    return AVATARS[user.avatar] || "";
  }, [user]);

  const initials = useMemo(() => {
    if (user?.username) {
      return user.username
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    return "";
  }, [user]);

  const tier = useMemo(() => {
    if (user?.elo === undefined || user?.elo === null) {
      return null;
    }

    if (user.elo < 800) return { label: "Wood", color: "default" };
    if (user.elo < 1000) return { label: "Bronze", color: "warning" };
    if (user.elo < 1200) return { label: "Silver", color: "info" };
    if (user.elo < 1400) return { label: "Gold", color: "warning" };
    if (user.elo < 1600) return { label: "Platinum", color: "primary" };
    return { label: "Diamond", color: "success" };
  }, [user]);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={3} alignItems="stretch">
        <Typography variant="h5" fontWeight={700} textAlign="center">
          Profile
        </Typography>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2} alignItems="center" textAlign="center">
              <Avatar sx={{ width: 72, height: 72, fontSize: 32 }}>
                {avatarIcon || initials}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {user?.username || "Loading user..."}
                </Typography>
                <Typography color="text.secondary">
                  {user?.gender ? `Gender: ${user.gender}` : ""}
                </Typography>
                <Typography color="text.secondary">
                  {user?.elo ? `Elo rating: ${user.elo}` : ""}
                </Typography>
                {tier && (
                  <Stack direction="row" spacing={1} justifyContent="center" mt={1}>
                    <Typography color="text.secondary">Tier:</Typography>
                    <Chip label={tier.label} color={tier.color} size="small" />
                  </Stack>
                )}
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={2}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => navigate("/matches")}
          >
            View Match History
          </Button>
          <Button
            variant="outlined"
            fullWidth
            size="large"
            onClick={() => navigate("/leaderboard")}
          >
            Go to Leaderboard
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}

export default HomeScreen;
