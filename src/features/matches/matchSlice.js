import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createMatch,
  getMatchDetail,
  getMatchHistory,
} from "../../services/api";

const initialState = {
  matches: [],
  matchDetail: null,
  loading: false,
  error: null,
};

export const fetchMatchHistory = createAsyncThunk(
  "matches/fetchMatchHistory",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.accessToken;
      const data = await getMatchHistory(userId, token);
      console.log(data)
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMatchDetail = createAsyncThunk(
  "matches/fetchMatchDetail",
  async (matchId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.accessToken;
      const data = await getMatchDetail(matchId, token);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const recordMatch = createAsyncThunk(
  "matches/recordMatch",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.accessToken;
      const data = await createMatch(payload, token);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const matchSlice = createSlice({
  name: "matches",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatchHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = action.payload || [];
      })
      .addCase(fetchMatchHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load matches";
      })
      .addCase(fetchMatchDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatchDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.matchDetail = action.payload;
      })
      .addCase(fetchMatchDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load match";
      })
      .addCase(recordMatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recordMatch.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.matches = [action.payload, ...state.matches];
        }
      })
      .addCase(recordMatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to record match";
      });
  },
});

export default matchSlice.reducer;
