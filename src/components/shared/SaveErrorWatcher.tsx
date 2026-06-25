import { useEffect, useRef } from "react";
import { useToast } from "../../context/ToastContext";
import { SAVE_ERROR_EVENT } from "../../store/useAppStore";

// Listens for failed DB writes dispatched by the store and surfaces a single
// error toast. A burst of failures (e.g. "mark final" writes several rows at
// once) is collapsed into one toast via a short throttle window.
const THROTTLE_MS = 3000;

export default function SaveErrorWatcher() {
  const { showToast } = useToast();
  const lastShownRef = useRef(0);

  useEffect(() => {
    function onSaveError() {
      const now = Date.now();
      if (now - lastShownRef.current < THROTTLE_MS) return;
      lastShownRef.current = now;
      showToast("Couldn't save your changes. Reload to make sure nothing was lost.", "error");
    }
    window.addEventListener(SAVE_ERROR_EVENT, onSaveError);
    return () => window.removeEventListener(SAVE_ERROR_EVENT, onSaveError);
  }, [showToast]);

  return null;
}
