import { createSlice } from "@reduxjs/toolkit";

const getStoredTheme = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("themeMode");
};

const storeTheme = (mode) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("themeMode", mode);
};

const initialTheme = getStoredTheme() || "light";

const preferencesSlice = createSlice({
  name: "preferences",
  initialState: {
    themeMode: initialTheme,
  },
  reducers: {
    setThemeMode: (state, action) => {
      state.themeMode = action.payload;
      storeTheme(action.payload);
    },
    toggleThemeMode: (state) => {
      state.themeMode = state.themeMode === "dark" ? "light" : "dark";
      storeTheme(state.themeMode);
    },
  },
});

export const { setThemeMode, toggleThemeMode } = preferencesSlice.actions;
export default preferencesSlice.reducer;
