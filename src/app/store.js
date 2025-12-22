import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import preferencesReducer from "../features/preferences/preferencesSlice";
import userReducer from "../features/user/userSlice";
import leaderboardReducer from "../features/leaderboard/leaderboardSlice";
import matchReducer from "../features/matches/matchSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    preferences: preferencesReducer,
    user: userReducer,
    leaderboard: leaderboardReducer,
    matches: matchReducer,
  },
});
