import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  login as loginRequest,
  signup as signupRequest,
  resendConfirmationEmail as resendConfirmationEmailRequest,
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
      });
  },
});

export const { setToken, clearAuth } = authSlice.actions;

export default authSlice.reducer;
