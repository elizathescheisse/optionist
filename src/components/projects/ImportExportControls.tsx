import { useRef, useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import { validateImportedData } from "../../utils/validation";
import type { ExportedAppData } from "../../types/importExport";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

export default function ImportExportControls() {
  const exportData = useAppStore((s) => s.exportData);
  const importDataReplace = useAppStore((s) => s.importDataReplace);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingData, setPendingData] = useState<ExportedAppData | null>(null);

  function handleExport() {
    const data = exportData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `optionist-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    setError(null);
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target!.result as string);
        const result = validateImportedData(raw);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setError(null);
        setPendingData(result.data);
      } catch {
        setError("File is not valid JSON.");
      }
    };
    reader.readAsText(file);
  }

  function confirmImport() {
    if (!pendingData) return;
    importDataReplace(pendingData);
    setPendingData(null);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={handleExport}>
          Export JSON
        </Button>
        <Button variant="secondary" onClick={handleImportClick}>
          Import JSON
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={handleFileChange}
        />
      </div>
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
      {pendingData && (
        <Modal
          title="Replace all data?"
          onConfirm={confirmImport}
          onCancel={() => setPendingData(null)}
          confirmLabel="Replace"
          confirmVariant="danger"
        >
          <p>
            This will replace all your projects, decisions, and options with the
            imported data. This cannot be undone.
          </p>
        </Modal>
      )}
    </div>
  );
}
