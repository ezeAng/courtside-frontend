import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCurrentUser } from "../../services/api";

const initialState = {
  user: null,
  loading: false,
  error: null,
};

export const fetchCurrentUser = createAsyncThunk(
  "user/fetchCurrentUser",
  async (token, { rejectWithValue }) => {
    try {
      const data = await getCurrentUser(token);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUser: (state) => {
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = action.payload || "Failed to load user";
      });
  },
});

export const { clearUser } = userSlice.actions;

export default userSlice.reducer;
