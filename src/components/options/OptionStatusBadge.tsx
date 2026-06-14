import type { OptionStatus } from "../../types/domain";

const STYLES: Record<OptionStatus, string> = {
  active: "bg-blue-50 text-blue-500",
  rejected: "bg-red-50 text-red-500",
  final: "bg-emerald-50 text-emerald-600",
};

const LABELS: Record<OptionStatus, string> = {
  active: "Active",
  rejected: "Rejected",
  final: "Final",
};

export default function OptionStatusBadge({ status }: { status: OptionStatus }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
