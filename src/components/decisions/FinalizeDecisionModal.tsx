import { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import Button from "../ui/Button";
import Textarea from "../ui/Textarea";

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

  if (!decision || !option) return null;

  function handleFinalize() {
    markOptionFinal(optionId);
    if (rationale.trim()) {
      updateDecision(decisionId, { finalRationale: rationale.trim() });
    }
    onClose();
  }

  function handleSkip() {
    markOptionFinal(optionId);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md mx-4 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="font-semibold text-text text-base">Finalize decision</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-muted transition-colors text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-4">
          {/* Chosen option preview */}
          <div className="flex items-center gap-3 bg-subtle rounded-xl p-3">
            <img
              src={option.imageDataUrl}
              alt={option.name}
              draggable={false}
              className="w-12 h-12 object-cover rounded-lg shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-text-muted font-medium uppercase tracking-wider">Chosen option</span>
              <span className="text-sm font-medium text-text truncate">{option.name}</span>
            </div>
          </div>

          {/* Rationale */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text">
              Why did you choose this?
              <span className="text-text-muted font-normal ml-1">(optional)</span>
            </span>
            <Textarea
              rows={4}
              placeholder="Add your rationale — this helps future you and your team understand the decision…"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              autoFocus
            />
            {!rationale.trim() && (
              <span className="text-xs text-warning bg-warning-soft rounded px-2 py-1">
                This decision will be finalized without a rationale. Add one
                now to fully complete it.
              </span>
            )}
          </label>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleSkip}
              className="text-sm text-text-muted hover:text-text-muted transition-colors"
            >
              Skip for now →
            </button>
            <Button variant="primary" onClick={handleFinalize}>
              Finalize decision
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
