import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  login as loginRequest,
  signup as signupRequest,
  resendConfirmationEmail as resendConfirmationEmailRequest,
  requestPasswordReset as requestPasswordResetRequest,
  resetPassword as resetPasswordRequest,
} from "../../services/api";
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from "../../services/storage";

const tokenFromStorage = getStoredToken();

const initialState = {
  accessToken: tokenFromStorage || null,
  loading: false,
  error: null,
  signupMessage: null,
  resendMessage: null,
  resendError: null,
  resendLoading: false,
  resetLoading: false,
  resetMessage: null,
  resetError: null,
  passwordUpdateLoading: false,
  passwordUpdateMessage: null,
  passwordUpdateError: null,
};

export const signup = createAsyncThunk(
  "auth/signup",
  async ({ email, password, username, gender }, { rejectWithValue }) => {
    try {
      const data = await signupRequest(email, password, username, gender);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Signup failed");
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await loginRequest(email, password);
      const token = data?.session?.access_token;
      if (!token) {
        throw new Error("Incorrect email or password");
      }
      setStoredToken(token);
      return token;
    } catch (error) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

export const resendConfirmationEmail = createAsyncThunk(
  "auth/resendConfirmationEmail",
  async ({ email }, { rejectWithValue }) => {
    try {
      const data = await resendConfirmationEmailRequest(email);
      return data?.message || "Confirmation email resent if the account exists.";
    } catch (error) {
      return rejectWithValue(error.message || "Resend confirmation failed");
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  "auth/requestPasswordReset",
  async ({ identifier }, { rejectWithValue }) => {
    try {
      const data = await requestPasswordResetRequest(identifier);
      return (
        data?.message ||
        "If the account exists, a password reset email has been sent."
      );
    } catch (error) {
      return rejectWithValue(error.message || "Password reset request failed");
    }
  }
);

export const completePasswordReset = createAsyncThunk(
  "auth/completePasswordReset",
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      if (!token) {
        throw new Error("Password recovery link is invalid or has expired.");
      }
      const data = await resetPasswordRequest(token, newPassword);
      return data?.message || "Password updated successfully.";
    } catch (error) {
      return rejectWithValue(error.message || "Password update failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.accessToken = action.payload;
      setStoredToken(action.payload);
    },
    clearAuth: (state) => {
      state.accessToken = null;
      state.error = null;
      state.signupMessage = null;
      state.resendMessage = null;
      state.resendError = null;
      state.resendLoading = false;
      state.resetLoading = false;
      state.resetMessage = null;
      state.resetError = null;
      state.passwordUpdateLoading = false;
      state.passwordUpdateMessage = null;
      state.passwordUpdateError = null;
      clearStoredToken();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.signupMessage = null;
        state.resendMessage = null;
        state.resendError = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.signupMessage =
          action.payload?.message ||
          "Signup successful. Please check your email to confirm your account.";
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Signup failed";
        state.signupMessage = null;
        state.resendMessage = null;
        state.resendError = null;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
        state.resendMessage = null;
        state.resendError = null;
      })
      .addCase(resendConfirmationEmail.pending, (state) => {
        state.resendLoading = true;
        state.resendMessage = null;
        state.resendError = null;
      })
      .addCase(resendConfirmationEmail.fulfilled, (state, action) => {
        state.resendLoading = false;
        state.resendMessage = action.payload;
      })
      .addCase(resendConfirmationEmail.rejected, (state, action) => {
        state.resendLoading = false;
        state.resendError = action.payload || "Resend confirmation failed";
      })
      .addCase(requestPasswordReset.pending, (state) => {
        state.resetLoading = true;
        state.resetMessage = null;
        state.resetError = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.resetLoading = false;
        state.resetMessage = action.payload;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.resetLoading = false;
        state.resetError = action.payload || "Password reset request failed";
      })
      .addCase(completePasswordReset.pending, (state) => {
        state.passwordUpdateLoading = true;
        state.passwordUpdateMessage = null;
        state.passwordUpdateError = null;
      })
      .addCase(completePasswordReset.fulfilled, (state, action) => {
        state.passwordUpdateLoading = false;
        state.passwordUpdateMessage = action.payload;
      })
      .addCase(completePasswordReset.rejected, (state, action) => {
        state.passwordUpdateLoading = false;
        state.passwordUpdateError =
          action.payload || "Password update failed";
      });
  },
});

export const { setToken, clearAuth } = authSlice.actions;

export default authSlice.reducer;
