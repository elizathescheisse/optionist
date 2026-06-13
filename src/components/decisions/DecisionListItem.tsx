import { useAppStore } from "../../store/useAppStore";
import type { Decision } from "../../types/domain";

type Props = {
  decision: Decision;
  isSelected: boolean;
  onSelect: () => void;
};

export default function DecisionListItem({ decision, isSelected, onSelect }: Props) {
  const postponeDecision = useAppStore((s) => s.postponeDecision);
  const reactivateDecision = useAppStore((s) => s.reactivateDecision);
  const setCurrentDecision = useAppStore((s) => s.setCurrentDecision);
  const chosenOptionName = useAppStore((s) =>
    decision.selectedOptionId ? s.options[decision.selectedOptionId]?.name : undefined
  );

  const isFinalized = decision.status === "finalized";
  const isPostponed = decision.status === "postponed";
  const isArchived = decision.status === "archived";

  const optionCount = decision.optionIds.length;

  function subtitle() {
    if (isFinalized && chosenOptionName) return chosenOptionName;
    if (isPostponed) return "Paused";
    if (isArchived) return "Archived";
    return optionCount === 0
      ? "No screenshots"
      : `${optionCount} screenshot${optionCount !== 1 ? "s" : ""}`;
  }

  return (
    <div
      className={`group px-3 py-2 rounded-lg cursor-pointer transition-colors motion-reduce:transition-none ${
        isSelected
          ? isFinalized
            ? "bg-gray-100 text-gray-700"
            : "bg-zinc-300 text-gray-900"
          : "hover:bg-gray-50 text-gray-700"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`text-sm font-medium truncate flex-1 leading-snug ${
            isFinalized
              ? isSelected
                ? "text-gray-600"
                : "text-gray-400"
              : isSelected
              ? "text-gray-900"
              : "text-gray-800"
          }`}
        >
          {isFinalized && (
            <span className="mr-1 text-green-500 text-xs">✓</span>
          )}
          {decision.title}
        </span>

        {/* Hover actions */}
        {!isSelected && (
          <div className="hidden group-hover:flex items-center gap-1 shrink-0 mt-0.5">
            {(isArchived || isPostponed) && (
              <button
                className="text-xs text-blue-500 hover:text-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  reactivateDecision(decision.id);
                  setCurrentDecision(decision.id);
                }}
              >
                Restore
              </button>
            )}
            {decision.status === "active" && (
              <button
                className="text-xs text-gray-400 hover:text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  postponeDecision(decision.id);
                }}
              >
                Pause
              </button>
            )}
          </div>
        )}
      </div>

      <span
        className={`text-xs mt-0.5 block truncate ${
          isFinalized ? "text-gray-300" : isSelected ? "text-gray-500" : "text-gray-400"
        }`}
      >
        {subtitle()}
      </span>
    </div>
  );
}
