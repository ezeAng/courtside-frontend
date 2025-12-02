import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getLeaderboard } from "../../services/api";

const initialState = {
  gender: "male",
  data: [],
  loading: false,
  error: null,
};

export const fetchLeaderboard = createAsyncThunk(
  "leaderboard/fetchLeaderboard",
  async (gender, { rejectWithValue }) => {
    try {
      const data = await getLeaderboard(gender);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const leaderboardSlice = createSlice({
  name: "leaderboard",
  initialState,
  reducers: {
    setGender: (state, action) => {
      state.gender = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load leaderboard";
      });
  },
});

export const { setGender } = leaderboardSlice.actions;

export default leaderboardSlice.reducer;
