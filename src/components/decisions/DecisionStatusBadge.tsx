import type { DecisionStatus } from "../../types/domain";

const STYLES: Record<DecisionStatus, string> = {
  active: "bg-blue-50 text-blue-600",
  finalized: "bg-green-50 text-green-700",
  postponed: "bg-yellow-50 text-yellow-700",
  archived: "bg-gray-100 text-gray-500",
};

const LABELS: Record<DecisionStatus, string> = {
  active: "Active",
  finalized: "Finalized",
  postponed: "Postponed",
  archived: "Archived",
};

export default function DecisionStatusBadge({ status }: { status: DecisionStatus }) {
  return (
    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
