import { useAuthStore } from "../../store/useAuthStore";
import Modal from "../ui/Modal";

export default function GuestMigrationPrompt() {
  const pendingGuestMigration = useAuthStore((s) => s.pendingGuestMigration);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const dismissGuestMigration = useAuthStore((s) => s.dismissGuestMigration);

  if (!pendingGuestMigration || !isAuthenticated()) return null;

  return (
    <Modal
      title="Save your guest work?"
      confirmLabel="Got it"
      onConfirm={dismissGuestMigration}
      onCancel={dismissGuestMigration}
    >
      <p>
        You have projects saved on this device from guest mode. Full cloud import is coming
        soon — your guest work stays on this device until you migrate it.
      </p>
    </Modal>
  );
}
