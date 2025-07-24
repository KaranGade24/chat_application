import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import Router from "./routers/Router.jsx";
import MessageContextProvider from "./store/Messages/MessageContextProvider.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MessageContextProvider>
      <RouterProvider router={Router}>
        <App />
      </RouterProvider>
    </MessageContextProvider>
  </StrictMode>
);
