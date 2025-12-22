import React, { useMemo } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import { store } from "./app/store";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useSelector } from "react-redux";
import { buildTheme } from "./theme";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

function ThemedApp() {
  const themeMode = useSelector((state) => state.preferences.themeMode);
  const theme = useMemo(() => buildTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <ThemedApp />
  </Provider>
);

reportWebVitals();

serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    console.info("Service worker update available.", registration);
  },
  onSuccess: (registration) => {
    console.info("Service worker registered for offline use.", registration);
  },
  onError: (error) => {
    console.error("Service worker registration failed.", error);
  },
});
