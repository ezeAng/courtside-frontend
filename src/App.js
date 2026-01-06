import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";
import Box from "@mui/material/Box";
import LoginScreen from "./screens/Auth/LoginScreen";
import SignupScreen from "./screens/Auth/SignupScreen";
import ResendConfirmationScreen from "./screens/Auth/ResendConfirmationScreen";
import HomeScreen from "./screens/Home/HomeScreen";
import MatchHistoryScreen from "./screens/Matches/MatchHistoryScreen";
import MatchDetailScreen from "./screens/Matches/MatchDetailScreen";
import PendingMatchesScreen from "./screens/Matches/PendingMatchesScreen";
import LeaderboardScreen from "./screens/Leaderboard/LeaderboardScreen";
import SettingsScreen from "./screens/Settings/SettingsScreen";
import AppSettingsScreen from "./screens/Settings/AppSettingsScreen";
import SplashScreen from "./screens/SplashScreen";
import RecommendedPlayersScreen from "./screens/Connections/RecommendedPlayersScreen";
import ConnectionRequestsScreen from "./screens/Connections/ConnectionRequestsScreen";
import MyConnectionsScreen from "./screens/Connections/MyConnectionsScreen";
import ConnectionsHomeScreen from "./screens/Connections/ConnectionsHomeScreen";
import FindPlayersScreen from "./screens/Connections/FindPlayersScreen";
import SearchUsersScreen from "./screens/Connections/SearchUsersScreen";
import ForgotPasswordScreen from "./screens/Auth/ForgotPasswordScreen";
import ResetPasswordScreen from "./screens/Auth/ResetPasswordScreen";
import BottomNav from "./components/BottomNav";
import { clearAuth } from "./features/auth/authSlice";
import { clearUser, fetchCurrentUser } from "./features/user/userSlice";
import PlayScreen from "./screens/Play/PlayScreen";

function ProtectedLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.accessToken);
  const { error } = useSelector((state) => state.user);

  useEffect(() => {
    if (token && error) {
      dispatch(clearAuth());
      dispatch(clearUser());
      navigate("/login", { replace: true });
    }
  }, [dispatch, error, navigate, token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <>
      <Box pb={10}>
        <Outlet />
      </Box>
      <BottomNav />
    </>
  );
}

function App() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.accessToken);
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchCurrentUser(token));
    }
  }, [dispatch, token, user]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignupScreen />} />
        <Route path="/resend-confirmation" element={<ResendConfirmationScreen />} />
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
        <Route path="/reset-password" element={<ResetPasswordScreen />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/matches" element={<MatchHistoryScreen />} />
          <Route path="/matches/pending" element={<PendingMatchesScreen />} />
          <Route path="/play" element={<PlayScreen />} />
          <Route path="/competitions" element={<Navigate to="/play" replace />} />
          <Route path="/matches/:match_id" element={<MatchDetailScreen />} />
          <Route path="/leaderboard" element={<LeaderboardScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/settings/preferences" element={<AppSettingsScreen />} />
          <Route path="/connections" element={<ConnectionsHomeScreen />} />
          <Route path="/connections/find" element={<FindPlayersScreen />} />
          <Route path="/connections/search" element={<SearchUsersScreen />} />
          <Route
            path="/connections/recommended"
            element={<RecommendedPlayersScreen />}
          />
          <Route
            path="/connections/requests"
            element={<ConnectionRequestsScreen />}
          />
          <Route path="/connections/list" element={<MyConnectionsScreen />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
