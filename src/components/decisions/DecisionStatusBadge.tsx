import type { DecisionStatus } from "../../types/domain";
import { cn } from "../../utils/cn";

const STYLES: Record<DecisionStatus, string> = {
  active: "bg-primary-soft text-primary",
  finalized: "bg-success-soft text-success",
  postponed: "bg-warning-soft text-warning",
  archived: "bg-surface-muted text-text-soft",
};

const LABELS: Record<DecisionStatus, string> = {
  active: "In Review",
  finalized: "Decided",
  postponed: "Postponed",
  archived: "Archived",
};

export default function DecisionStatusBadge({ status }: { status: DecisionStatus }) {
  return (
    <span
      className={cn(
        "text-xs font-medium px-2 py-0.5 rounded-full shrink-0",
        STYLES[status],
      )}
    >
      {LABELS[status]}
    </span>
  );
}
