import { useMemo } from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Paper from "@mui/material/Paper";
import HomeIcon from "@mui/icons-material/Home";
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import PersonIcon from '@mui/icons-material/Person';
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const navItems = [
  { label: "Home", value: "/home", icon: <HomeIcon /> },
  { label: "Leaderboard", value: "/leaderboard", icon: <LeaderboardIcon /> },
  { label: "Matches", value: "/matches", icon: <SportsTennisIcon /> },
  { label: "Competitions", value: "/competitions", icon: <MilitaryTechIcon /> },
  { label: "Me", value: "/settings", icon: <PersonIcon /> },
];

function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  const currentValue = useMemo(() => {
    const match = [...navItems]
      .sort((a, b) => b.value.length - a.value.length)
      .find((item) => location.pathname.startsWith(item.value));
    return match ? match.value : "/home";
  }, [location.pathname]);

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.custom?.colors?.shadows?.sm,
        height: "10vh",
        
      }}
      elevation={3}
    >
      <BottomNavigation
        value={currentValue}
        onChange={(event, newValue) => navigate(newValue)}
        showLabels
        
        sx={{
          "& .MuiBottomNavigationAction-root": {
            color: theme.palette.text.secondary,
            fontWeight: 600,
            paddingTop: theme.spacing(3),
            paddingBottom: theme.spacing(1),
            minWidth: 64,
            gap: theme.spacing(0.5),
          },
          "& .MuiBottomNavigationAction-root .MuiSvgIcon-root": {
            fontSize: "24px",
          },
          "& .Mui-selected": {
            color: theme.palette.primary.main,
            fontWeight: 700,
          },
          "& .Mui-selected .MuiSvgIcon-root": {
            color: theme.palette.primary.main,
          },
          "& .MuiBottomNavigationAction-label": {
            fontSize: theme.typography.caption.fontSize,
            lineHeight: theme.typography.caption.lineHeight,
          },
        }}
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
