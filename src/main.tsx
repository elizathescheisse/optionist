import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { loadSeedIfEmpty } from "./utils/seed";
import { useAuthStore } from "./store/useAuthStore";

const root = createRoot(document.getElementById("root")!);

// Restore auth/onboarding/settings (and apply the saved theme) before render.
useAuthStore.getState().hydrate();

// Load seed data into localStorage (if present and localStorage is empty)
// *before* importing App — the store reads localStorage on first import,
// so the seed must be written before that happens.
loadSeedIfEmpty().then(async () => {
  const { default: App } = await import("./App");
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
