import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  eloMode: "singles",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setEloMode: (state, action) => {
      state.eloMode = action.payload === "doubles" ? "doubles" : "singles";
    },
  },
});

export const { setEloMode } = uiSlice.actions;

export default uiSlice.reducer;
