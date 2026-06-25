import type { DecisionStatus } from "../../types/domain";

const STYLES: Record<DecisionStatus, string> = {
  active: "bg-[#D0F1FB] text-[#3494FB] border border-[#3494FB]/30",
  finalized: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  postponed: "bg-purple-50 text-purple-500 border border-purple-200",
};

const LABELS: Record<DecisionStatus, string> = {
  active: "Active",
  finalized: "Finalized",
  postponed: "Postponed",
};

export default function DecisionStatusBadge({ status }: { status: DecisionStatus }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
