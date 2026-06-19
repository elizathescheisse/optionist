import { useAppStore } from "../../store/useAppStore";
import OptionStatusBadge from "./OptionStatusBadge";
import Button from "../ui/Button";

type Props = {
  decisionId: string;
  onMarkFinal: () => void;
  onReject: () => void;
};

export default function OptionActionsBar({ decisionId, onMarkFinal, onReject }: Props) {
  const decision = useAppStore((s) => s.decisions[decisionId]);
  const currentOption = useAppStore((s) =>
    s.currentOptionId ? s.options[s.currentOptionId] : undefined
  );

  if (!decision) return null;

  const isDecisionFinalized = decision.status === "finalized";
  const isRejected = currentOption?.status === "rejected";

  return (
    <div className="shrink-0 px-4 py-2.5 border-t border-border bg-surface flex items-center justify-between gap-3">
      {/* Left: current option name + status */}
      <div className="flex items-center gap-2 min-w-0">
        {currentOption ? (
          <>
            <span className="text-sm font-medium text-text truncate">
              {currentOption.name}
            </span>
            <OptionStatusBadge status={currentOption.status} />
          </>
        ) : (
          <span className="text-sm text-text-soft">No option selected</span>
        )}
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="secondary"
          onClick={onReject}
          disabled={!currentOption || isDecisionFinalized}
        >
          {isRejected ? "Restore" : "Reject"}
          <kbd className="ml-1 inline-flex items-center rounded bg-surface-muted px-1 py-0.5 text-xs font-mono text-text-soft leading-none">R</kbd>
        </Button>

        {isDecisionFinalized ? (
          <Button variant="primary" disabled>
            Finalized ✓
          </Button>
        ) : (
          <Button variant="primary" onClick={onMarkFinal} disabled={!currentOption}>
            Mark final
            <kbd className="ml-1 inline-flex items-center rounded bg-surface/20 px-1 py-0.5 text-xs font-mono text-white/60 leading-none">F</kbd>
          </Button>
        )}
      </div>
    </div>
  );
}
