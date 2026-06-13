import { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import { logTimelineEvent } from "../../services/timeline";
import Button from "../shared/Button";
import Textarea from "../shared/Textarea";

type Props = {
  decisionId: string;
  optionId: string;
  onClose: () => void;
};

export default function FinalizeDecisionModal({ decisionId, optionId, onClose }: Props) {
  const decision = useAppStore((s) => s.decisions[decisionId]);
  const option = useAppStore((s) => s.options[optionId]);
  const markOptionFinal = useAppStore((s) => s.markOptionFinal);
  const updateDecision = useAppStore((s) => s.updateDecision);

  const [rationale, setRationale] = useState(decision?.finalRationale ?? "");
  const [openConcerns, setOpenConcerns] = useState(decision?.openConcerns ?? "");
  const [nextSteps, setNextSteps] = useState(decision?.nextSteps ?? "");

  if (!decision || !option) return null;

  function handleFinalize() {
    markOptionFinal(optionId);
    updateDecision(decisionId, {
      finalRationale: rationale.trim(),
      openConcerns: openConcerns.trim(),
      nextSteps: nextSteps.trim(),
      decisionStatus: "decided",
    });
    logTimelineEvent({
      type: "decision_captured",
      decisionId,
      projectId: decision.projectId,
      label: `Decision captured: ${option.name}`,
    });
    onClose();
  }

  function handleSkip() {
    markOptionFinal(optionId);
    updateDecision(decisionId, { decisionStatus: "decided" });
    logTimelineEvent({
      type: "decision_captured",
      decisionId,
      projectId: decision.projectId,
      label: `Decision captured: ${option.name}`,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-surface rounded-xl shadow-lg w-full max-w-md mx-4 flex flex-col overflow-hidden border border-border">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="font-semibold text-text text-md">Capture decision</h2>
          <button
            onClick={onClose}
            className="text-text-soft hover:text-text transition-colors text-lg leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 bg-surface-muted rounded-lg p-3">
            <img
              src={option.imageDataUrl}
              alt={option.name}
              draggable={false}
              className="w-12 h-12 object-cover rounded-lg shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-text-soft font-medium uppercase tracking-wider">
                Selected option
              </span>
              <span className="text-sm font-medium text-text truncate">{option.name}</span>
            </div>
          </div>

          <Textarea
            label="Rationale"
            rows={3}
            placeholder="Why did you choose this direction?"
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            autoFocus
          />

          <Textarea
            label="Open concerns"
            rows={2}
            placeholder="Unresolved questions or risks…"
            value={openConcerns}
            onChange={(e) => setOpenConcerns(e.target.value)}
          />

          <Textarea
            label="Next step"
            rows={2}
            placeholder="What happens after this decision?"
            value={nextSteps}
            onChange={(e) => setNextSteps(e.target.value)}
          />

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-text-soft hover:text-text transition-colors"
            >
              Skip for now →
            </button>
            <Button variant="primary" onClick={handleFinalize}>
              Capture decision
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
