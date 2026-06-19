import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import {
  clearGuestAppState,
  clearGuestSession,
  downloadGuestExportJson,
  summarizeGuestWork,
} from "../../services/guestStorage";
import { migrateGuestWorkToAccount } from "../../services/guestMigration";
import { trackGuestEvent } from "../../services/guestAnalytics";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

export default function GuestMigrationModal() {
  const navigate = useNavigate();
  const pendingGuestMigration = useAuthStore((s) => s.pendingGuestMigration);
  const status = useAuthStore((s) => s.status);
  const dismissGuestMigration = useAuthStore((s) => s.dismissGuestMigration);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const summary = useMemo(() => summarizeGuestWork(), [pendingGuestMigration]);

  useEffect(() => {
    if (pendingGuestMigration && status === "authenticated") {
      trackGuestEvent("migration_review_opened");
    }
  }, [pendingGuestMigration, status]);

  if (!pendingGuestMigration || status !== "authenticated") return null;

  function handleExport() {
    trackGuestEvent("migration_export_clicked", {
      projectCount: summary.projectCount,
    });
    downloadGuestExportJson();
  }

  function handleKeepLocal() {
    trackGuestEvent("migration_keep_local");
    dismissGuestMigration();
  }

  function handleDiscardConfirm() {
    trackGuestEvent("migration_discard_clicked");
    clearGuestAppState();
    clearGuestSession();
    dismissGuestMigration();
    setConfirmDiscard(false);
  }

  async function handleImportAttempt() {
    const result = await migrateGuestWorkToAccount();
    if (!result.ok && result.reason === "cloud_sync_unavailable") {
      setImportMessage(
        "Cloud project sync is not available yet. Export your guest work as JSON to keep a backup.",
      );
    }
  }

  if (confirmDiscard) {
    return (
      <Modal
        title="Remove guest work from this device?"
        confirmLabel="Remove guest data"
        confirmVariant="danger"
        onConfirm={handleDiscardConfirm}
        onCancel={() => setConfirmDiscard(false)}
      >
        <p>
          This removes guest projects from this browser only. Your account data is not affected.
        </p>
      </Modal>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        className="bg-surface rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 flex flex-col gap-4"
      >
        <h2 className="font-semibold text-text text-base">Save your guest work</h2>
        <p className="text-sm text-text-muted">
          You have local work from guest mode on this device. Review what is saved here before
          choosing next steps.
        </p>

        <ul className="text-sm text-text space-y-1 rounded-lg bg-surface-muted p-3">
          <li>{summary.projectCount} project(s)</li>
          <li>{summary.decisionCount} decision(s)</li>
          <li>{summary.optionCount} design option(s)</li>
        </ul>

        {summary.projects.length > 0 && (
          <ul className="text-xs text-text-muted space-y-1 max-h-32 overflow-y-auto">
            {summary.projects.map((p) => (
              <li key={p.id}>
                {p.name} · {p.decisionCount} decision(s)
              </li>
            ))}
          </ul>
        )}

        {importMessage && (
          <p className="text-sm text-text-muted" role="status">
            {importMessage}
          </p>
        )}

        <div className="flex flex-col gap-2 pt-1">
          <Button variant="primary" className="w-full" onClick={() => void handleImportAttempt()}>
            Import to my account
          </Button>
          <Button variant="secondary" className="w-full" onClick={handleExport}>
            Export as JSON
          </Button>
          <Button variant="secondary" className="w-full" onClick={handleKeepLocal}>
            Keep on this device
          </Button>
          <button
            type="button"
            className="text-sm text-text-soft hover:text-error text-center py-1"
            onClick={() => setConfirmDiscard(true)}
          >
            Remove guest data
          </button>
          <button
            type="button"
            className="text-sm text-primary font-medium hover:underline text-center"
            onClick={() => {
              trackGuestEvent("save_work_clicked");
              dismissGuestMigration();
              navigate("/signup");
            }}
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}
