import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCurrentUser, updateProfile } from "../../services/api";

const initialState = {
  user: null,
  loading: false,
  error: null,
  updateLoading: false,
  updateError: null,
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

export const updateUserProfile = createAsyncThunk(
  "user/updateUserProfile",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.accessToken;
      if (!token) {
        throw new Error("User not authenticated");
      }
      const data = await updateProfile(token, payload);
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
      state.updateLoading = false;
      state.updateError = null;
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
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload || "Failed to update user";
      });
  },
});

export const { clearUser } = userSlice.actions;

export default userSlice.reducer;
