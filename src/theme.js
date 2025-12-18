import { alpha, createTheme } from "@mui/material/styles";
import { themeColors, themeFonts } from "./theme/tokens";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: themeColors.brand.primary,
      contrastText: themeColors.brand.primaryContrast,
    },
    secondary: {
      main: themeColors.brand.secondary,
      contrastText: themeColors.brand.secondaryContrast,
    },
    background: {
      default: themeColors.background.base,
      paper: themeColors.background.surface,
    },
    text: {
      primary: themeColors.text.primary,
      secondary: themeColors.text.secondary,
    },
    divider: themeColors.border.soft,
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: themeFonts.body,
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ":root": {
          "--color-primary": themeColors.brand.primary,
          "--color-primary-contrast": themeColors.brand.primaryContrast,
          "--color-secondary": themeColors.brand.secondary,
          "--color-secondary-contrast": themeColors.brand.secondaryContrast,
          "--color-text-primary": themeColors.text.primary,
          "--color-text-secondary": themeColors.text.secondary,
          "--color-surface": themeColors.background.surface,
          "--color-background": themeColors.background.base,
          "--color-border-subtle": themeColors.border.soft,
          "--color-border-strong": themeColors.border.strong,
          "--color-neutral-dashed": themeColors.border.dashed,
          "--color-neutral-surface": themeColors.neutral.surface,
          "--color-neutral-raised": themeColors.neutral.raised,
          "--color-accent-blue": themeColors.accent.blue,
          "--color-accent-blue-dark": themeColors.accent.blueDark,
          "--color-accent-blue-light": themeColors.accent.blueLight,
          "--color-accent-blue-surface": themeColors.accent.blueSurface,
          "--color-chart-grid": themeColors.accent.grid,
          "--color-overlay-strong": themeColors.overlay.strong,
          "--font-body": themeFonts.body,
          "--font-accent": themeFonts.accent,
        },
        body: {
          backgroundColor: themeColors.background.base,
          fontFamily: themeFonts.body,
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
          boxShadow: `0px 12px 30px ${alpha(themeColors.brand.primary, 0.25)}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 22,
          boxShadow: `0px 18px 50px ${alpha(themeColors.brand.primary, 0.1)}`,
          border: `1px solid ${themeColors.border.soft}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 22,
          boxShadow: `0px 18px 50px ${alpha(themeColors.brand.primary, 0.12)}`,
          border: `1px solid ${themeColors.border.soft}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: `0px 16px 36px ${alpha(themeColors.brand.primary, 0.18)}`,
        },
      },
    },
  },
  custom: {
    colors: themeColors,
    fonts: themeFonts,
  },
});

export { themeColors, themeFonts };
export default theme;
