import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import userReducer from "../features/user/userSlice";
import leaderboardReducer from "../features/leaderboard/leaderboardSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    leaderboard: leaderboardReducer,
  },
});
