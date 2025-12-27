import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App";

jest.mock("react-router-dom");
jest.mock("./screens/Home/HomeScreen", () => () => <div>Home</div>);
jest.mock("./screens/Matches/MatchHistoryScreen", () => () => <div>Matches</div>);

test("renders app shell", () => {
  const { container } = render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  expect(container).toBeInTheDocument();
});
