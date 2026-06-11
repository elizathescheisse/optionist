import Button from "../shared/Button";

type Props = {
  onExport?: () => void;
  onImport?: () => void;
};

export default function ImportExportControls({ onExport, onImport }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" onClick={onExport} disabled={!onExport}>
        Export JSON
      </Button>
      <Button variant="secondary" onClick={onImport} disabled={!onImport}>
        Import JSON
      </Button>
    </div>
  );
}
