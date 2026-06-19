import { useAppStore } from "../../store/useAppStore";
import Button from "../ui/Button";

type Props = {
  projectId: string;
  onClose: () => void;
};

export default function SessionReviewModal({ projectId, onClose }: Props) {
  const project = useAppStore((s) => s.projects[projectId]);
  const decisions = useAppStore((s) => s.decisions);
  const options = useAppStore((s) => s.options);

  if (!project) return null;

  const finalizedDecisions = project.decisionIds
    .map((id) => decisions[id])
    .filter((d) => d?.status === "finalized");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col overflow-hidden max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <h2 className="font-semibold text-text text-base">Decision review</h2>
          <button
            onClick={onClose}
            className="text-text-soft hover:text-text-muted transition-colors text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Decision list */}
        <div className="flex-1 overflow-y-auto px-6 pb-2 flex flex-col gap-4">
          {finalizedDecisions.length === 0 ? (
            <p className="text-sm text-text-soft text-center py-8">
              No finalized decisions yet.
            </p>
          ) : (
            finalizedDecisions.map((decision) => {
              const chosenOption = decision.selectedOptionId
                ? options[decision.selectedOptionId]
                : undefined;
              return (
                <div
                  key={decision.id}
                  className="flex flex-col gap-2 pb-4 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-green-600">✓</span>
                    <span className="text-sm font-semibold text-text">
                      {decision.title}
                    </span>
                  </div>

                  {chosenOption && (
                    <div className="flex items-center gap-3">
                      <img
                        src={chosenOption.imageDataUrl}
                        alt={chosenOption.name}
                        draggable={false}
                        className="w-10 h-10 object-cover rounded-lg shrink-0"
                      />
                      <span className="text-sm text-text-muted truncate">
                        {chosenOption.name}
                      </span>
                    </div>
                  )}

                  {decision.finalRationale ? (
                    <p className="text-sm text-text-muted leading-relaxed">
                      {decision.finalRationale}
                    </p>
                  ) : (
                    <p className="text-xs text-text-soft italic">No rationale added.</p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 shrink-0 border-t border-border flex justify-end">
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
