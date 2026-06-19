import type { DecisionStatus } from "../../types/domain";

const STYLES: Record<DecisionStatus, string> = {
  active: "bg-blue-50 text-blue-500",
  finalized: "bg-emerald-50 text-emerald-600",
  postponed: "bg-amber-50 text-amber-600",
  archived: "bg-surface-muted text-text-soft",
};

const LABELS: Record<DecisionStatus, string> = {
  active: "Active",
  finalized: "Finalized",
  postponed: "Postponed",
  archived: "Archived",
};

export default function DecisionStatusBadge({ status }: { status: DecisionStatus }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
