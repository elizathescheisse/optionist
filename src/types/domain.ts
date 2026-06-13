export type ID = string;
export type ISODateString = string;
export type AppDataVersion = 1;

export type Project = {
  id: ID;
  name: string;
  description: string;
  decisionIds: ID[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type DecisionStatus = "active" | "finalized" | "archived" | "postponed";

export type DecisionWorkflowStatus =
  | "not_started"
  | "in_review"
  | "proposed"
  | "decided"
  | "revisit";

export type CompareMode = "grid" | "side-by-side" | "focus";

export type PresentationSettings = {
  showRecommendation: boolean;
  hideNotes: boolean;
  showExecutiveSummary: boolean;
};

export type Decision = {
  id: ID;
  projectId: ID;
  title: string;
  description: string;
  status: DecisionStatus;
  decisionStatus: DecisionWorkflowStatus;
  optionIds: ID[];
  selectedOptionId: ID | null;
  notes: string;
  finalRationale: string;
  openConcerns: string;
  nextSteps: string;
  audience: string;
  dueDate: string;
  owner: string;
  summary: string;
  compareMode: CompareMode;
  presentationSettings: PresentationSettings;
  decidedAt: ISODateString | null;
  archivedAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type OptionStatus = "active" | "rejected" | "final";

export type OptionDisplayStatus =
  | "draft"
  | "ready"
  | "recommended"
  | "selected"
  | "rejected";

export type DesignOption = {
  id: ID;
  decisionId: ID;
  name: string;
  imageDataUrl: string;
  imageMimeType: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
  status: OptionStatus;
  displayStatus: OptionDisplayStatus;
  summary: string;
  pros: string;
  risks: string;
  notes: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type ReviewViewMode = "fit-width" | "full-image";

export type AppState = {
  projects: Record<ID, Project>;
  decisions: Record<ID, Decision>;
  options: Record<ID, DesignOption>;
  currentProjectId: ID | null;
  currentDecisionId: ID | null;
  currentOptionId: ID | null;
  reviewViewMode: ReviewViewMode;
  dataVersion: AppDataVersion;
};

export const DEFAULT_PRESENTATION_SETTINGS: PresentationSettings = {
  showRecommendation: true,
  hideNotes: true,
  showExecutiveSummary: true,
};
