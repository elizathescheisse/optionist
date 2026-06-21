import { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import { useToast } from "../../context/ToastContext";
import Modal from "../ui/Modal";

export function useResetDemoData() {
  const { showToast } = useToast();
  const resetAllData = useAppStore((s) => s.resetAllData);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function requestReset() {
    setConfirmOpen(true);
  }

  function confirmReset() {
    resetAllData();
    setConfirmOpen(false);
    showToast("Demo data reset.", "success");
  }

  function ResetConfirmModal() {
    if (!confirmOpen) return null;
    return (
      <Modal
        title="Reset demo data?"
        confirmLabel="Reset data"
        confirmVariant="danger"
        onConfirm={confirmReset}
        onCancel={() => setConfirmOpen(false)}
      >
        <p>
          This clears all projects, decisions, and options from local storage.
          Your account, profile, and theme preferences are not affected.
        </p>
      </Modal>
    );
  }

  return { requestReset, ResetConfirmModal };
}
