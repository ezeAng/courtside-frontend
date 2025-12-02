import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginScreen from "./screens/Auth/LoginScreen";
import SignupScreen from "./screens/Auth/SignupScreen";
import HomeScreen from "./screens/Home/HomeScreen";
import { fetchCurrentUser } from "./features/user/userSlice";

function ProtectedRoute({ children }) {
  const token = useSelector((state) => state.auth.accessToken);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
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
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignupScreen />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomeScreen />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
