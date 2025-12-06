import { useMemo } from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Paper from "@mui/material/Paper";
import HomeIcon from "@mui/icons-material/Home";
import SportsMartialArtsIcon from "@mui/icons-material/SportsMartialArts";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SettingsIcon from "@mui/icons-material/Settings";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { label: "Home", value: "/home", icon: <HomeIcon /> },
  { label: "Leaderboard", value: "/leaderboard", icon: <EmojiEventsIcon /> },
  { label: "Matches", value: "/matches", icon: <SportsMartialArtsIcon /> },
  { label: "Settings", value: "/settings", icon: <SettingsIcon /> },
];

function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentValue = useMemo(() => {
    const match = [...navItems]
      .sort((a, b) => b.value.length - a.value.length)
      .find((item) => location.pathname.startsWith(item.value));
    return match ? match.value : "/home";
  }, [location.pathname]);

  return (
    <Paper
      sx={{ position: "fixed", bottom: 0, left: 0, right: 0, borderTop: "1px solid rgba(255,255,255,0.1)" }}
      elevation={3}
    >
      <BottomNavigation
        value={currentValue}
        onChange={(event, newValue) => navigate(newValue)}
        showLabels
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.value}
            label={item.label}
            value={item.value}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

export default BottomNav;
