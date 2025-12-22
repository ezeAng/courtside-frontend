import { alpha, createTheme } from "@mui/material/styles";
import { getThemeColors, themeColors as lightThemeColors, themeFonts } from "./theme/tokens";

export const buildTheme = (mode = "light") => {
  const paletteColors = getThemeColors(mode);

  return createTheme({
    palette: {
      mode,
      primary: {
        main: paletteColors.brand.primary,
        contrastText: paletteColors.brand.primaryContrast,
      },
      secondary: {
        main: paletteColors.brand.secondary,
        contrastText: paletteColors.brand.secondaryContrast,
      },
      background: {
        default: paletteColors.background.base,
        paper: paletteColors.background.surface,
      },
      text: {
        primary: paletteColors.text.primary,
        secondary: paletteColors.text.secondary,
      },
      divider: paletteColors.border.soft,
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
            "--color-primary": paletteColors.brand.primary,
            "--color-primary-contrast": paletteColors.brand.primaryContrast,
            "--color-secondary": paletteColors.brand.secondary,
            "--color-secondary-contrast": paletteColors.brand.secondaryContrast,
            "--color-text-primary": paletteColors.text.primary,
            "--color-text-secondary": paletteColors.text.secondary,
            "--color-surface": paletteColors.background.surface,
            "--color-background": paletteColors.background.base,
            "--color-border-subtle": paletteColors.border.soft,
            "--color-border-strong": paletteColors.border.strong,
            "--color-neutral-dashed": paletteColors.border.dashed,
            "--color-neutral-surface": paletteColors.neutral.surface,
            "--color-neutral-raised": paletteColors.neutral.raised,
            "--color-accent-blue": paletteColors.accent.blue,
            "--color-accent-blue-dark": paletteColors.accent.blueDark,
            "--color-accent-blue-light": paletteColors.accent.blueLight,
            "--color-accent-blue-surface": paletteColors.accent.blueSurface,
            "--color-chart-grid": paletteColors.accent.grid,
            "--color-overlay-strong": paletteColors.overlay.strong,
            "--font-body": themeFonts.body,
            "--font-accent": themeFonts.accent,
          },
          body: {
            backgroundColor: paletteColors.background.base,
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
            boxShadow: `0px 12px 30px ${alpha(paletteColors.brand.primary, 0.25)}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 22,
            boxShadow: `0px 18px 50px ${alpha(paletteColors.brand.primary, 0.1)}`,
            border: `1px solid ${paletteColors.border.soft}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 22,
            boxShadow: `0px 18px 50px ${alpha(paletteColors.brand.primary, 0.12)}`,
            border: `1px solid ${paletteColors.border.soft}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            boxShadow: `0px 16px 36px ${alpha(paletteColors.brand.primary, 0.18)}`,
          },
        },
      },
    },
    custom: {
      colors: paletteColors,
      fonts: themeFonts,
    },
  });
};

const theme = buildTheme("light");

export { lightThemeColors as themeColors, themeFonts };
export default theme;
