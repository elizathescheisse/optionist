import type { OptionStatus } from "../../types/domain";

const STYLES: Record<OptionStatus, string> = {
  active: "bg-blue-50 text-blue-600",
  rejected: "bg-red-50 text-red-600",
  final: "bg-green-50 text-green-700",
};

const LABELS: Record<OptionStatus, string> = {
  active: "Active",
  rejected: "Rejected",
  final: "Final",
};

export default function OptionStatusBadge({ status }: { status: OptionStatus }) {
  return (
    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
