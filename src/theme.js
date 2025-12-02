import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#0A5C38", // Courtside dark green (court color)
    },
    secondary: {
      main: "#B5FF6B", // neon-lime accent
    },
    background: {
      default: "#0E0F0F",
      paper: "#131414",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#BFC4C8",
    }
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    button: { textTransform: "none" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 10,
          paddingBottom: 10,
        }
      }
    },
  }
});

export default theme;
