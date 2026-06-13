import type { Decision, DesignOption, ID, ISODateString } from "./domain";

export type ComparisonStatus = "draft" | "review" | "decided";

export type ComparisonOptionStatus =
  | "draft"
  | "ready"
  | "recommended"
  | "selected"
  | "rejected";

export type ComparisonOption = {
  id: string;
  title: string;
  imageUrl?: string;
  rationale?: string;
  pros?: string[];
  risks?: string[];
  status: ComparisonOptionStatus;
};

export type FacilitatorNote = {
  id: string;
  content: string;
  createdAt: ISODateString;
};

export type ComparisonDecision = {
  selectedOptionId: string;
  summary: string;
  rationale: string;
  openConcerns?: string;
  nextSteps?: string;
  decidedAt: ISODateString;
  decisionMaker?: string;
};

export type Comparison = {
  id: string;
  title: string;
  description?: string;
  audience?: string;
  status: ComparisonStatus;
  options: ComparisonOption[];
  notes: FacilitatorNote[];
  decision?: ComparisonDecision;
  createdAt: string;
  updatedAt: string;
};

function mapOptionStatus(status: DesignOption["status"]): ComparisonOptionStatus {
  switch (status) {
    case "final":
      return "selected";
    case "rejected":
      return "rejected";
    case "active":
    default:
      return "ready";
  }
}

function mapComparisonStatus(status: Decision["status"]): ComparisonStatus {
  switch (status) {
    case "finalized":
      return "decided";
    case "active":
      return "review";
    default:
      return "draft";
  }
}

export function decisionToComparison(
  decision: Decision,
  options: Record<ID, DesignOption>,
): Comparison {
  return {
    id: decision.id,
    title: decision.title,
    description: decision.description || undefined,
    status: mapComparisonStatus(decision.status),
    options: decision.optionIds
      .map((id) => options[id])
      .filter(Boolean)
      .map((opt) => ({
        id: opt.id,
        title: opt.name,
        imageUrl: opt.imageDataUrl,
        rationale: opt.notes || undefined,
        status: mapOptionStatus(opt.status),
      })),
    notes: decision.notes
      ? [{ id: decision.id, content: decision.notes, createdAt: decision.updatedAt }]
      : [],
    decision: decision.selectedOptionId
      ? {
          selectedOptionId: decision.selectedOptionId,
          summary: decision.title,
          rationale: decision.finalRationale,
          openConcerns: decision.openConcerns || undefined,
          nextSteps: decision.nextSteps || undefined,
          decidedAt: decision.decidedAt ?? decision.updatedAt,
        }
      : undefined,
    createdAt: decision.createdAt,
    updatedAt: decision.updatedAt,
  };
}

export function comparisonOptionStatusLabel(status: ComparisonOptionStatus): string {
  const labels: Record<ComparisonOptionStatus, string> = {
    draft: "Draft",
    ready: "Ready for Review",
    recommended: "Recommended",
    selected: "Selected",
    rejected: "Not Selected",
  };
  return labels[status];
}
