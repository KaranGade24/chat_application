import App from "../App";
import { createBrowserRouter } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import Chat from "../pages/chat/Chat";
import Login from "../pages/Login/Login";
import Signup from "../pages/Signup/Signup";

const Router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <Login /> },
  { path: "signup", element: <Signup /> },
  {
    path: "/app",
    element: <App />,
    children: [{ path: "chat", element: <Chat /> }],
  },
]);

export default Router;
