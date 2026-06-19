import { useAuthStore } from "../../store/useAuthStore";
import Button from "../ui/Button";

export default function GuestStorageRecovery() {
  const guestStorageError = useAuthStore((s) => s.guestStorageError);
  const retryGuestStorage = useAuthStore((s) => s.retryGuestStorage);
  const clearGuestWorkspace = useAuthStore((s) => s.clearGuestWorkspace);

  if (!guestStorageError) return null;

  return (
    <div className="shrink-0 border-b border-error/30 bg-error/5 px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
      <p className="text-sm text-error">{guestStorageError}</p>
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="secondary" size="sm" onClick={retryGuestStorage}>
          Retry
        </Button>
        <Button variant="danger" size="sm" onClick={clearGuestWorkspace}>
          Clear guest data
        </Button>
      </div>
    </div>
  );
}
