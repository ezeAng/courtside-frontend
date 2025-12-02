import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";

function LeaderboardCard({ username, elo, gender, rank }) {
  const theme = useTheme();
  return (
    <Card
      variant="outlined"
      sx={{
        borderLeft: `6px solid ${theme.palette.primary.main}`,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.common.white,
              fontWeight: 700,
            }}
          >
            {rank}
          </Box>
          <Stack spacing={0.5} flex={1}>
            <Typography variant="subtitle1" fontWeight={700}>
              {username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Elo: {elo} • {gender}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default LeaderboardCard;
