import { useAppStore } from "../../store/useAppStore";
import OptionStatusBadge from "./OptionStatusBadge";
import Button from "../shared/Button";

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
    <div className="shrink-0 px-4 py-2.5 border-t border-gray-100 bg-white flex items-center justify-between gap-3">
      {/* Left: current option name + status */}
      <div className="flex items-center gap-2 min-w-0">
        {currentOption ? (
          <>
            <span className="text-sm font-medium text-gray-700 truncate">
              {currentOption.name}
            </span>
            <OptionStatusBadge status={currentOption.status} />
          </>
        ) : (
          <span className="text-sm text-gray-400">No option selected</span>
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
          <span className="ml-1 text-xs opacity-50">R</span>
        </Button>

        {isDecisionFinalized ? (
          <Button variant="primary" disabled>
            Finalized ✓
          </Button>
        ) : (
          <Button variant="primary" onClick={onMarkFinal} disabled={!currentOption}>
            Mark final
            <span className="ml-1 text-xs opacity-50">F</span>
          </Button>
        )}
      </div>
    </div>
  );
}
