import { useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { GUEST_LIMIT_EVENT } from "../../store/useAppStore";

export default function GuestLimitWatcher() {
  const { showToast } = useToast();

  useEffect(() => {
    function onGuestLimit(e: Event) {
      const message = (e as CustomEvent<string>).detail;
      if (message) showToast(message, "default");
    }
    window.addEventListener(GUEST_LIMIT_EVENT, onGuestLimit);
    return () => window.removeEventListener(GUEST_LIMIT_EVENT, onGuestLimit);
  }, [showToast]);

  return null;
}
