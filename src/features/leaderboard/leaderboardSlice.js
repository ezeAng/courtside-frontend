import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getLeaderboard } from "../../services/api";

const initialState = {
  gender: "mixed",
  data: [],      // always the leaders array
  loading: false,
  error: null,
};

export const fetchLeaderboard = createAsyncThunk(
  "leaderboard/fetchLeaderboard",
  async (gender, { rejectWithValue }) => {
    try {
      const response = await getLeaderboard(gender);

      // Normalize: ensure always an array
      return response.leaders || [];
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

        // payload is already an array from the thunk fix
        state.data = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load leaderboard";
      });
  },
});

export const { setGender } = leaderboardSlice.actions;

export default leaderboardSlice.reducer;
