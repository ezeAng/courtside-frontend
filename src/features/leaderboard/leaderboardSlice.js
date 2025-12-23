import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getLeaderboard } from "../../services/api";

const initialState = {
  gender: "mixed",
  discipline: "singles",
  data: [], // always the leaders array
  loading: false,
  error: null,
};

export const fetchLeaderboard = createAsyncThunk(
  "leaderboard/fetchLeaderboard",
  async (params, { rejectWithValue }) => {
    const payload =
      typeof params === "string"
        ? { gender: params, discipline: "singles" }
        : params || {};

    const gender = payload.gender || "mixed";
    const discipline = payload.discipline || "singles";

    try {
      const response = await getLeaderboard(gender, undefined, discipline);

      // Normalize: ensure always an array
      return { leaders: response.leaders || [], gender, discipline };
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
    setDiscipline: (state, action) => {
      state.discipline = action.payload === "doubles" ? "doubles" : "singles";
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
        const payload = action.payload || {};
        state.data = Array.isArray(payload.leaders) ? payload.leaders : [];
        state.gender = payload.gender || state.gender;
        state.discipline = payload.discipline || state.discipline;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load leaderboard";
      });
  },
});

export const { setGender, setDiscipline } = leaderboardSlice.actions;

export default leaderboardSlice.reducer;
