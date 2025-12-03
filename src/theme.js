import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0FB177", // vibrant courtside teal/green
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#9AEF6F", // lively lime accent
      contrastText: "#0F1F1C",
    },
    background: {
      default: "#F6F9FB",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F1F1C",
      secondary: "#4A6C63",
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#F6F9FB",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 10,
          paddingBottom: 10,
          boxShadow: "0px 12px 30px rgba(15, 177, 119, 0.25)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 22,
          boxShadow: "0px 18px 50px rgba(15, 177, 119, 0.10)",
          border: "1px solid #E5F2EB",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 22,
          boxShadow: "0px 18px 50px rgba(15, 177, 119, 0.12)",
          border: "1px solid #E5F2EB",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: "0px 16px 36px rgba(15, 177, 119, 0.18)",
        },
      },
    },
  },
});

export default theme;
