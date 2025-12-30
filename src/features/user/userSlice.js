import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { clearAuth } from "../auth/authSlice";
import {
  deleteUser,
  getCurrentUser,
  updateProfile,
  uploadAvatar,
} from "../../services/api";

const initialState = {
  user: null,
  loading: false,
  error: null,
  updateLoading: false,
  updateError: null,
  avatarUploading: false,
  avatarError: null,
  deleteLoading: false,
  deleteError: null,
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

export const uploadUserAvatar = createAsyncThunk(
  "user/uploadUserAvatar",
  async (file, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.accessToken;
      if (!token) {
        throw new Error("User not authenticated");
      }

      const response = await uploadAvatar(token, file);
      const profile = response?.user || response?.profile || response;
      const profileImageUrl =
        response?.profileImageUrl ||
        response?.profile_image_url ||
        response?.url ||
        profile?.profile_image_url ||
        null;

      return { profile, profileImageUrl };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCurrentUser = createAsyncThunk(
  "user/deleteCurrentUser",
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const token = getState().auth.accessToken;
      if (!token) {
        throw new Error("User not authenticated");
      }

      await deleteUser(token);

      dispatch(clearAuth());
      dispatch(clearUser());
      return true;
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
      state.avatarUploading = false;
      state.avatarError = null;
      state.deleteLoading = false;
      state.deleteError = null;
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
      })
      .addCase(uploadUserAvatar.pending, (state) => {
        state.avatarUploading = true;
        state.avatarError = null;
      })
      .addCase(uploadUserAvatar.fulfilled, (state, action) => {
        state.avatarUploading = false;
        if (action.payload?.profile) {
          state.user = action.payload.profile;
        } else if (state.user && action.payload?.profileImageUrl) {
          state.user = {
            ...state.user,
            profile_image_url: action.payload.profileImageUrl,
          };
        }
      })
      .addCase(uploadUserAvatar.rejected, (state, action) => {
        state.avatarUploading = false;
        state.avatarError = action.payload || "Failed to upload avatar";
      })
      .addCase(deleteCurrentUser.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteCurrentUser.fulfilled, (state) => {
        state.deleteLoading = false;
        state.user = null;
      })
      .addCase(deleteCurrentUser.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload || "Failed to delete account";
      });
  },
});

export const { clearUser } = userSlice.actions;

export default userSlice.reducer;
