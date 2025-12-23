import { createTheme } from "@mui/material/styles";
import {
  getThemeColors,
  themeColors as lightThemeColors,
  themeFonts,
} from "./theme/tokens";

export const buildTheme = (mode = "light") => {
  const paletteColors = getThemeColors(mode);
  const typeScale = paletteColors.typography;

  return createTheme({
    spacing: 4,
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
        default: paletteColors.background.default,
        paper: paletteColors.background.surface,
      },
      text: {
        primary: paletteColors.text.primary,
        secondary: paletteColors.text.secondary,
        disabled: paletteColors.text.muted,
      },
      divider: paletteColors.divider,
      action: {
        disabledBackground: paletteColors.action.disabled,
        disabled: paletteColors.text.muted,
      },
    },
    shape: {
      borderRadius: paletteColors.radii.md,
    },
    typography: {
      fontFamily: themeFonts.body,
      h1: typeScale.h1,
      h2: typeScale.h2,
      h3: typeScale.h3,
      body1: typeScale.body,
      body2: typeScale.bodySmall,
      caption: typeScale.caption,
      button: {
        fontWeight: 700,
        textTransform: "none",
        letterSpacing: 0.2,
        lineHeight: typeScale.body.lineHeight,
      },
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
            "--color-text-muted": paletteColors.text.muted,
            "--color-surface": paletteColors.background.surface,
            "--color-background": paletteColors.background.default,
            "--color-background-surface": paletteColors.background.surface,
            "--color-border-subtle": paletteColors.border.subtle,
            "--color-border-strong": paletteColors.border.strong,
            "--color-neutral-dashed": paletteColors.border.dashed,
            "--color-neutral-surface": paletteColors.neutral.surface,
            "--color-neutral-raised": paletteColors.neutral.raised,
            "--color-action-primary": paletteColors.action.primary,
            "--color-action-primary-hover": paletteColors.action.primaryHover,
            "--color-action-disabled": paletteColors.action.disabled,
            "--color-divider": paletteColors.divider,
            "--color-accent-blue": paletteColors.accent.blue,
            "--color-accent-blue-dark": paletteColors.accent.blueDark,
            "--color-accent-blue-light": paletteColors.accent.blueLight,
            "--color-accent-blue-surface": paletteColors.accent.blueSurface,
            "--color-chart-grid": paletteColors.accent.grid,
            "--color-overlay-strong": paletteColors.overlay.strong,
            "--radius-sm": `${paletteColors.radii.sm}px`,
            "--radius-md": `${paletteColors.radii.md}px`,
            "--radius-lg": `${paletteColors.radii.lg}px`,
            "--shadow-sm": paletteColors.shadows.sm,
            "--shadow-md": paletteColors.shadows.md,
            "--space-xs": `${paletteColors.spacing.xs}px`,
            "--space-sm": `${paletteColors.spacing.sm}px`,
            "--space-md": `${paletteColors.spacing.md}px`,
            "--space-lg": `${paletteColors.spacing.lg}px`,
            "--space-xl": `${paletteColors.spacing.xl}px`,
            "--space-xxl": `${paletteColors.spacing.xxl}px`,
            "--font-body": themeFonts.body,
            "--font-accent": themeFonts.accent,
          },
          body: {
            backgroundColor: paletteColors.background.default,
            fontFamily: themeFonts.body,
          },
        },
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            paddingLeft: "var(--space-lg)",
            paddingRight: "var(--space-lg)",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: paletteColors.radii.md,
            paddingLeft: paletteColors.spacing.lg,
            paddingRight: paletteColors.spacing.lg,
            paddingTop: paletteColors.spacing.sm + 2,
            paddingBottom: paletteColors.spacing.sm + 2,
            boxShadow: paletteColors.shadows.sm,
            transition: "transform 0.12s ease, box-shadow 0.12s ease",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: paletteColors.shadows.md,
              backgroundColor: paletteColors.action.primaryHover,
            },
            "&:active": {
              transform: "translateY(0)",
              boxShadow: paletteColors.shadows.sm,
            },
            "&.Mui-disabled": {
              boxShadow: "none",
              backgroundColor: paletteColors.action.disabled,
              color: paletteColors.text.muted,
            },
          },
          outlined: {
            borderColor: paletteColors.border.subtle,
            "&:hover": {
              borderColor: paletteColors.border.strong,
            },
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            borderRadius: paletteColors.radii.sm,
            borderColor: paletteColors.border.subtle,
            textTransform: "none",
            fontWeight: 600,
            paddingLeft: paletteColors.spacing.md,
            paddingRight: paletteColors.spacing.md,
            "&.Mui-selected": {
              backgroundColor: paletteColors.action.primary,
              color: paletteColors.brand.primaryContrast,
              "&:hover": {
                backgroundColor: paletteColors.action.primaryHover,
              },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: paletteColors.radii.lg,
            boxShadow: paletteColors.shadows.md,
            border: `1px solid ${paletteColors.border.subtle}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: paletteColors.radii.lg,
            boxShadow: paletteColors.shadows.md,
            border: `1px solid ${paletteColors.border.subtle}`,
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: `${paletteColors.spacing.lg}px ${paletteColors.spacing.lg}px ${paletteColors.spacing.lg + 4}px`,
            "&:last-child": {
              paddingBottom: `${paletteColors.spacing.lg + 4}px`,
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            borderRadius: paletteColors.radii.md,
            boxShadow: paletteColors.shadows.sm,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: paletteColors.radii.lg,
            padding: `${paletteColors.spacing.lg}px`,
            backgroundColor: paletteColors.background.surface,
            boxShadow: paletteColors.shadows.md,
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            padding: 0,
            marginBottom: paletteColors.spacing.md,
            fontWeight: 700,
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            padding: 0,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${paletteColors.border.subtle}`,
          },
          indicator: {
            height: 3,
            borderRadius: paletteColors.radii.sm,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            fontSize: paletteColors.typography.bodySmall.fontSize,
            minHeight: 48,
            "&.Mui-selected": {
              color: paletteColors.action.primary,
            },
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            "& th": {
              fontWeight: 700,
              color: paletteColors.text.secondary,
              borderBottomColor: paletteColors.border.subtle,
            },
          },
        },
      },
      MuiTableBody: {
        styleOverrides: {
          root: {
            "& td": {
              borderBottomColor: paletteColors.border.subtle,
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: paletteColors.radii.md,
            "&.Mui-selected": {
              backgroundColor: paletteColors.action.primaryHover,
              color: paletteColors.brand.primaryContrast,
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: paletteColors.border.subtle,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: paletteColors.radii.sm,
            fontWeight: 600,
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            backgroundColor: paletteColors.background.surface,
            color: paletteColors.text.primary,
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
