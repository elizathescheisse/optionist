import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { loadSeedIfEmpty } from "./utils/seed";
import { useAuthStore } from "./store/useAuthStore";

const root = createRoot(document.getElementById("root")!);

loadSeedIfEmpty().then(async () => {
  useAuthStore.getState().hydrate();
  const { default: App } = await import("./App");
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
