import { useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { STORAGE_FULL_EVENT } from "../../store/persistence";

/**
 * Bridges the storage layer to the toast UI: when saveState fails because
 * localStorage is full, it dispatches STORAGE_FULL_EVENT on window; this
 * component listens for it and shows an error toast so the user knows their
 * latest change wasn't saved instead of losing it silently.
 *
 * Renders nothing — it only wires up the listener. Must live inside ToastProvider.
 */
export default function StorageQuotaWatcher() {
  const { showToast } = useToast();

  useEffect(() => {
    function handleStorageFull() {
      showToast(
        "Storage full — your latest change wasn't saved. Export your data to free up space.",
        "error",
      );
    }
    window.addEventListener(STORAGE_FULL_EVENT, handleStorageFull);
    return () => window.removeEventListener(STORAGE_FULL_EVENT, handleStorageFull);
  }, [showToast]);

  return null;
}
