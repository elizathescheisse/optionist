import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import type { Decision } from "../../types/domain";
import DecisionStatusBadge from "../decisions/DecisionStatusBadge";

type Props = {
  projectId: string;
  decision: Decision;
  currentIndex: number;
  totalOptions: number;
  onHelpToggle: () => void;
};

export default function ReviewToolbar({
  projectId,
  decision,
  currentIndex,
  totalOptions,
  onHelpToggle,
}: Props) {
  const navigate = useNavigate();
  const reviewViewMode = useAppStore((s) => s.reviewViewMode);
  const setReviewViewMode = useAppStore((s) => s.setReviewViewMode);

  return (
    <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 border-b border-border bg-surface">
      <button
        onClick={() => navigate(`/projects/${projectId}`)}
        className="text-sm text-text-soft hover:text-text flex items-center gap-1 shrink-0 transition-colors motion-reduce:transition-none"
        aria-label="Back to project"
      >
        ← Back
      </button>

      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-medium text-text truncate">{decision.title}</span>
        <DecisionStatusBadge status={decision.status} />
      </div>

      {totalOptions > 0 && (
        <span className="text-xs text-text-soft shrink-0 tabular-nums">
          {currentIndex} / {totalOptions}
        </span>
      )}

      <div className="ml-auto flex items-center gap-2 shrink-0">
        <button
          onClick={() =>
            setReviewViewMode(reviewViewMode === "fit-width" ? "full-image" : "fit-width")
          }
          className="px-2.5 py-1 rounded-md text-xs font-medium text-text-muted hover:text-text border border-border hover:border-border transition-colors motion-reduce:transition-none bg-surface shadow-sm"
        >
          {reviewViewMode === "fit-width" ? "Full size" : "Fit width"}
        </button>
        <button
          onClick={onHelpToggle}
          className="px-2.5 py-1 rounded-md text-xs font-medium text-text-muted hover:text-text border border-border hover:border-border transition-colors motion-reduce:transition-none bg-surface shadow-sm"
          aria-label="Toggle keyboard shortcuts"
        >
          ? Shortcuts
        </button>
      </div>
    </div>
  );
}
