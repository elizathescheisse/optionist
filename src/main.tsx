import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { loadSeedIfEmpty } from "./utils/seed";
import { useAuthStore } from "./store/useAuthStore";

const root = createRoot(document.getElementById("root")!);

// Load seed data into localStorage (if present and localStorage is empty)
// *before* importing App — the store reads localStorage on first import,
// so the seed must be written before that happens.
loadSeedIfEmpty().then(async () => {
  await useAuthStore.getState().initialize();

  const { default: App } = await import("./App");
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
