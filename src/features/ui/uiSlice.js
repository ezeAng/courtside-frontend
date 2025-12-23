import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  eloMode: "overall",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setEloMode: (state, action) => {
      const mode = action.payload;
      if (mode === "overall" || mode === "singles" || mode === "doubles") {
        state.eloMode = mode;
        return;
      }
      state.eloMode = "overall";
    },
  },
});

export const { setEloMode } = uiSlice.actions;

export default uiSlice.reducer;
