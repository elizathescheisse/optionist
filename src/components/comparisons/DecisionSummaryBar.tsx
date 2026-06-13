import type { DecisionWorkflowStatus } from "../../types/domain";
import Button from "../shared/Button";
import { cn } from "../../utils/cn";

type Props = {
  status: DecisionWorkflowStatus;
  onMarkInReview?: () => void;
  onMarkDecided?: () => void;
  onReopen?: () => void;
};

const LABELS: Record<DecisionWorkflowStatus, string> = {
  not_started: "Draft",
  in_review: "In review",
  proposed: "Proposed",
  decided: "Decided",
  revisit: "Revisit",
};

const COLORS: Record<DecisionWorkflowStatus, string> = {
  not_started: "bg-app-surface-soft text-text-muted",
  in_review: "bg-info-soft text-info",
  proposed: "bg-warning-soft text-warning",
  decided: "bg-success-soft text-success",
  revisit: "bg-error-soft text-error",
};

export default function DecisionSummaryBar({
  status,
  onMarkInReview,
  onMarkDecided,
  onReopen,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-2.5 border-b border-app-border bg-app-panel-muted shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-text-soft uppercase tracking-wider">
          Status
        </span>
        <span
          className={cn(
            "text-xs font-semibold px-2.5 py-1 rounded-full",
            COLORS[status],
          )}
        >
          {LABELS[status]}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {status === "not_started" && onMarkInReview && (
          <Button variant="outline" size="sm" onClick={onMarkInReview}>
            Start review
          </Button>
        )}
        {(status === "in_review" || status === "proposed") && onMarkDecided && (
          <Button variant="primary" size="sm" onClick={onMarkDecided}>
            Mark decided
          </Button>
        )}
        {status === "decided" && onReopen && (
          <Button variant="outline" size="sm" onClick={onReopen}>
            Reopen decision
          </Button>
        )}
      </div>
    </div>
  );
}
