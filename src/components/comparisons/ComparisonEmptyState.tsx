import Button from "../shared/Button";
import Card from "../ui/Card";
import { useToast } from "../../context/ToastContext";

type Props = {
  onUploadClick?: () => void;
};

export default function ComparisonEmptyState({ onUploadClick }: Props) {
  const { showToast } = useToast();

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-app-bg">
      <Card padding="lg" className="max-w-md text-center shadow-card">
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary-soft flex items-center justify-center">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-md font-semibold text-text">No design options yet</h3>
        <p className="text-sm text-text-muted mt-2 leading-relaxed">
          Upload screenshots or import from Figma to start comparing directions for this decision.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center mt-6">
          {onUploadClick && (
            <Button variant="primary" onClick={onUploadClick}>
              Upload design options
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => showToast("Figma import coming soon")}
          >
            Import from Figma
          </Button>
        </div>
      </Card>
    </div>
  );
}
