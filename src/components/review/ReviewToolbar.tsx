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
    <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 bg-white">
      <button
        onClick={() => navigate(`/projects/${projectId}`)}
        className="text-sm text-gray-400 hover:text-gray-900 flex items-center gap-1 shrink-0 transition-colors motion-reduce:transition-none"
        aria-label="Back to project"
      >
        ← Back
      </button>

      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-medium text-gray-900 truncate">{decision.title}</span>
        <DecisionStatusBadge status={decision.status} />
      </div>

      {totalOptions > 0 && (
        <span className="text-xs text-gray-400 shrink-0 tabular-nums">
          {currentIndex} / {totalOptions}
        </span>
      )}

      <div className="ml-auto flex items-center gap-2 shrink-0">
        <button
          onClick={() =>
            setReviewViewMode(reviewViewMode === "fit-width" ? "full-image" : "fit-width")
          }
          className="px-2.5 py-1 rounded-md text-xs font-medium text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300 transition-colors motion-reduce:transition-none bg-white shadow-sm"
        >
          {reviewViewMode === "fit-width" ? "Full size" : "Fit width"}
        </button>
        <button
          onClick={onHelpToggle}
          className="px-2.5 py-1 rounded-md text-xs font-medium text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300 transition-colors motion-reduce:transition-none bg-white shadow-sm"
          aria-label="Toggle keyboard shortcuts"
        >
          ? Shortcuts
        </button>
      </div>
    </div>
  );
}
