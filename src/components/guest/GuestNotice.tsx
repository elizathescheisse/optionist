import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

export default function GuestNotice() {
  const dismissGuestNotice = useAuthStore((s) => s.dismissGuestNotice);
  const showNotice = useAuthStore((s) => s.status === "guest" && !s.hasSeenGuestNotice);

  if (!showNotice) return null;

  return (
    <div
      className="shrink-0 border-b border-border bg-primary-soft px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between"
      role="status"
    >
      <p className="text-sm text-text">
        You are using Optionist as a guest. Your work is saved only on this device. Create an
        account to save, sync, and collaborate.
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          to="/signup"
          className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-gray-900 text-white hover:bg-gray-700"
        >
          Create account
        </Link>
        <button
          type="button"
          onClick={dismissGuestNotice}
          className="text-sm text-text-muted hover:text-text px-2 py-1"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
