import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { login as loginRequest, signup as signupRequest } from "../../services/api";

const tokenFromStorage = localStorage.getItem("accessToken");

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
      const token = data.access_token;
      localStorage.setItem("accessToken", token);
      return token;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await loginRequest(email, password);
      const token = data.access_token;
      localStorage.setItem("accessToken", token);
      return token;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.accessToken = action.payload;
      localStorage.setItem("accessToken", action.payload);
    },
    clearAuth: (state) => {
      state.accessToken = null;
      state.error = null;
      localStorage.removeItem("accessToken");
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
        state.accessToken = action.payload;
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
