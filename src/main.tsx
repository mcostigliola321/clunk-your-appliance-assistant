import "@fontsource-variable/albert-sans";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { RepairProvider } from "./state/RepairProvider";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Clunk could not find its root element.");
}

createRoot(root).render(
  <StrictMode>
    <AppErrorBoundary>
      <RepairProvider>
        <App />
      </RepairProvider>
    </AppErrorBoundary>
  </StrictMode>,
);
