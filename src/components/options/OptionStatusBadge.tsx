import type { OptionStatus } from "../../types/domain";
import { cn } from "../../utils/cn";

const STYLES: Record<OptionStatus, string> = {
  active: "bg-primary-soft text-primary",
  rejected: "bg-error-soft text-error",
  final: "bg-success-soft text-success",
};

const LABELS: Record<OptionStatus, string> = {
  active: "Ready for Review",
  rejected: "Not Selected",
  final: "Selected",
};

export default function OptionStatusBadge({ status }: { status: OptionStatus }) {
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
