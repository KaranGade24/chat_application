import App from "../App";
import { createBrowserRouter } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import Chat from "../pages/chat/Chat";

const Router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  {
    path: "/app",
    element: <App />,
    children: [{ path: "chat", element: <Chat /> }],
  },
]);

export default Router;
