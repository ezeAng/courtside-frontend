const brand = {
  primary: "#0FB177",
  primaryContrast: "#FFFFFF",
  secondary: "#9AEF6F",
  secondaryContrast: "#0F1F1C",
};

const action = {
  primary: brand.primary,
  primaryHover: "#0C8D5F",
  disabled: "#AFCBBD",
};

const spacingScale = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

const radii = {
  sm: 8,
  md: 12,
  lg: 16,
};

const typographyScale = {
  h1: { fontSize: "32px", lineHeight: "40px", fontWeight: 700 },
  h2: { fontSize: "28px", lineHeight: "36px", fontWeight: 700 },
  h3: { fontSize: "22px", lineHeight: "30px", fontWeight: 600 },
  body: { fontSize: "16px", lineHeight: "24px", fontWeight: 500 },
  bodySmall: { fontSize: "14px", lineHeight: "22px", fontWeight: 500 },
  caption: { fontSize: "12px", lineHeight: "18px", fontWeight: 500 },
};

const accent = {
  blue: "#1976d2",
  blueDark: "#0d47a1",
  blueLight: "#90caf9",
  blueSurface: "#E3F2FD",
  grid: "#f0f4f8",
};

const shadows = {
  light: {
    sm: "0 8px 18px rgba(15, 177, 119, 0.12)",
    md: "0 16px 40px rgba(15, 177, 119, 0.16)",
  },
  dark: {
    sm: "0 8px 18px rgba(14, 20, 18, 0.32)",
    md: "0 16px 40px rgba(14, 20, 18, 0.38)",
  },
};

const playerCard = {
  textLight: "#f5f7fa",
  textDark: "#111111",
  frame: "#000000",
  panel: "rgba(255,255,255,0.92)",
  tiers: {
    elite: {
      background: "linear-gradient(135deg, #2a003f, #14001f)",
      accent: "#c77dff",
    },
    pro: {
      background: "linear-gradient(135deg, #0b2a3f, #06131f)",
      accent: "#4bf0ff",
    },
    contender: {
      background: "linear-gradient(135deg, #3f2f00, #1f1700)",
      accent: "#ffd166",
    },
    challenger: {
      background: "linear-gradient(135deg, #2a1c0f, #140c05)",
      accent: "#cd7f32",
    },
  },
  borders: {
    diamond: "#e5e4e2",
    gold: "#ffd700",
    silver: "#c0c0c0",
    bronze: "#cd7f32",
  },
};

const overlay = {
  strong: "rgba(0, 0, 0, 0.7)",
};

const modeColors = {
  light: {
    background: {
      default: "#F6F9FB",
      surface: "#FFFFFF",
    },
    text: {
      primary: "#0F1F1C",
      secondary: "#4A6C63",
      muted: "#6A837C",
    },
    border: {
      subtle: "#E5F2EB",
      soft: "#E5F2EB",
      strong: "#E0E0E0",
      dashed: "#D1D5DB",
    },
    neutral: {
      surface: "#F8FAFC",
      raised: "#F9FAFB",
    },
  },
  dark: {
    background: {
      default: "#0E1412",
      surface: "#121C19",
    },
    text: {
      primary: "#E6F2EB",
      secondary: "#A8BEB7",
      muted: "#7F9B93",
    },
    border: {
      subtle: "#1F2A28",
      soft: "#1F2A28",
      strong: "#2C3936",
      dashed: "#34524A",
    },
    neutral: {
      surface: "#111A17",
      raised: "#1A2623",
    },
  },
};

export const getThemeColors = (mode = "light") => {
  const palette = mode === "dark" ? modeColors.dark : modeColors.light;
  return {
    brand,
    action,
    accent,
    overlay,
    playerCard,
    divider: palette.border.soft,
    shadows: shadows[mode],
    spacing: spacingScale,
    radii,
    typography: typographyScale,
    ...palette,
  };
};

export const themeColors = getThemeColors();

export const themeFonts = {
  body: "'Ubuntu', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  accent: "'Ubuntu', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
};