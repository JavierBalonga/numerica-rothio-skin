import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { HashRouter } from "react-router-dom";
import { TwitchAuthProvider } from "./providers/TwitchAuthProvider";

const { VITE_TWITCH_CLIENT_ID } = import.meta.env;

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <HashRouter>
      <TwitchAuthProvider
        clientId={VITE_TWITCH_CLIENT_ID}
        scopes={["moderator:manage:banned_users"]}
      >
        <App />
      </TwitchAuthProvider>
    </HashRouter>
  </React.StrictMode>
);
