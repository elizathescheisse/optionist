import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { downloadGuestExportJson, hasGuestAppData } from "../../services/guestStorage";
import { trackGuestEvent } from "../../services/guestAnalytics";
import Modal from "../ui/Modal";

export default function GuestMenuPanel() {
  const navigate = useNavigate();
  const isGuest = useAuthStore((s) => s.isGuest);
  const showGuestNoticeAgain = useAuthStore((s) => s.showGuestNoticeAgain);
  const clearGuestWorkspace = useAuthStore((s) => s.clearGuestWorkspace);
  const exitGuestMode = useAuthStore((s) => s.exitGuestMode);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isGuest()) return null;

  function handleSaveWorkClick() {
    trackGuestEvent("save_work_clicked");
  }

  function handleExport() {
    trackGuestEvent("migration_export_clicked");
    downloadGuestExportJson();
  }

  function handleClearConfirm() {
    clearGuestWorkspace();
    setConfirmClear(false);
    exitGuestMode();
    navigate("/login");
  }

  return (
    <>
      <div className="px-4 py-3 border-t border-border flex flex-col gap-2">
        <p className="text-xs text-text-soft uppercase tracking-wide">Guest workspace</p>
        <p className="text-sm text-text-muted">Work on this device only</p>
        <Link
          to="/signup"
          onClick={handleSaveWorkClick}
          className="text-sm text-primary font-medium hover:underline"
        >
          Save my work
        </Link>
        {hasGuestAppData() && (
          <button
            type="button"
            onClick={handleExport}
            className="text-sm text-text-soft hover:text-text text-left"
          >
            Export guest data (JSON)
          </button>
        )}
        <button
          type="button"
          onClick={showGuestNoticeAgain}
          className="text-sm text-text-soft hover:text-text text-left"
        >
          About guest mode
        </button>
        <button
          type="button"
          onClick={() => {
            exitGuestMode();
            navigate("/login");
          }}
          className="text-sm text-text-soft hover:text-text text-left"
        >
          Log out
        </button>
        <button
          type="button"
          onClick={() => setConfirmClear(true)}
          className="text-sm text-text-soft hover:text-error text-left"
        >
          Clear guest workspace
        </button>
      </div>

      {confirmClear && (
        <Modal
          title="Clear guest workspace?"
          confirmLabel="Clear local data"
          confirmVariant="danger"
          onConfirm={handleClearConfirm}
          onCancel={() => setConfirmClear(false)}
        >
          <p>
            This removes all guest projects, decisions, and uploads from this browser only.
            It does not affect any account data in the cloud.
          </p>
        </Modal>
      )}
    </>
  );
}
