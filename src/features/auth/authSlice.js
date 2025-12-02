import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { login as loginRequest, signup as signupRequest } from "../../services/api";
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
};

export const signup = createAsyncThunk(
  "auth/signup",
  async ({ email, password, username, gender }, { rejectWithValue }) => {
    try {
      const data = await signupRequest(email, password, username, gender);
      return data.message;
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
      clearStoredToken();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Signup failed";
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
      });
  },
});

export const { setToken, clearAuth } = authSlice.actions;

export default authSlice.reducer;
