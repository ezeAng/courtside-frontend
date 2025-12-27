module.exports = {
  BrowserRouter: ({ children }) => children,
  Routes: ({ children }) => children,
  Route: ({ element }) => element,
  Navigate: ({ to }) => `Navigate to ${to}`,
  Outlet: ({ children }) => children,
  useNavigate: () => () => {},
  useLocation: () => ({ pathname: "/" }),
  useParams: () => ({}),
  Link: ({ children }) => children,
};
